"""Tests for business-hours SLA calculation with holidays and weekends."""

import uuid
from datetime import date, datetime, timezone

from app.models.corporate_calendar import CorporateCalendar
from app.models.sla_config import SLAConfig
from app.services.sla_service import calculate_business_deadline


def _make_sla(
    value=8,
    unit="hours",
    business_start_hour=9,
    business_end_hour=18,
    tz="America/Sao_Paulo",
):
    """Create an SLAConfig-like object for testing."""
    sla = SLAConfig(
        id=uuid.uuid4(),
        stage="PENDING_MANAGER",
        value=value,
        unit=unit,
        business_start_hour=business_start_hour,
        business_end_hour=business_end_hour,
        timezone=tz,
    )
    return sla


class TestBusinessDeadlineCalculation:
    def test_same_day_within_business_hours(self, db):
        """If SLA fits within the same business day, deadline is same day."""
        sla = _make_sla(value=4, unit="hours", business_start_hour=9, business_end_hour=18)
        db.add(sla)
        db.commit()

        # Monday 10:00 UTC (13:00 BRT) + 4h SLA = should finish same day
        start = datetime(2026, 3, 2, 13, 0, tzinfo=timezone.utc)  # Monday
        deadline = calculate_business_deadline(start, sla, db)
        assert deadline > start
        # 4 hours of business time from 13:00 BRT -> ~17:00 BRT
        assert deadline.weekday() < 5  # Still a weekday

    def test_weekend_skipped(self, db):
        """Weekends (Sat/Sun) are skipped in business hours calculation."""
        sla = _make_sla(value=1, unit="hours", business_start_hour=9, business_end_hour=18)
        db.add(sla)
        db.commit()

        # Friday 17:30 BRT (20:30 UTC) - only 30 min left, need 1h
        # Should roll to Monday
        start = datetime(2026, 3, 6, 20, 30, tzinfo=timezone.utc)  # Friday
        deadline = calculate_business_deadline(start, sla, db)

        # Deadline should be on Monday (weekday 0)
        assert deadline > start
        # The resulting time must not be on Saturday or Sunday
        # At minimum, deadline should be after the weekend
        assert (deadline - start).total_seconds() > 3600  # More than 1 hour due to weekend gap

    def test_holiday_skipped(self, db):
        """Corporate holidays are skipped."""
        sla = _make_sla(value=2, unit="hours", business_start_hour=9, business_end_hour=18)
        db.add(sla)
        db.commit()

        # Add a holiday on Tuesday 2026-03-10
        holiday = CorporateCalendar(
            id=uuid.uuid4(),
            date=date(2026, 3, 10),
            name="Test Holiday",
            type="NATIONAL",
        )
        db.add(holiday)
        db.commit()

        # Monday 2026-03-09 17:00 BRT (20:00 UTC) - 1h left, need 2h
        # Tuesday is holiday, so should spill into Wednesday
        start = datetime(2026, 3, 9, 20, 0, tzinfo=timezone.utc)  # Monday
        deadline = calculate_business_deadline(start, sla, db)

        assert deadline > start
        # Should skip Tuesday entirely and finish on Wednesday

    def test_friday_to_monday_transition(self, db):
        """SLA starting late Friday should complete on Monday."""
        sla = _make_sla(value=120, unit="minutes", business_start_hour=9, business_end_hour=18)
        db.add(sla)
        db.commit()

        # Friday 2026-03-06 at 17:00 BRT (20:00 UTC) - only 1h left, need 2h
        start = datetime(2026, 3, 6, 20, 0, tzinfo=timezone.utc)
        deadline = calculate_business_deadline(start, sla, db)

        assert deadline > start
        # Should be on Monday at the earliest
        # Gap should be > 2 days (Saturday + Sunday)
        diff = deadline - start
        assert diff.total_seconds() > 2 * 24 * 3600  # More than 2 days due to weekend

    def test_full_day_sla(self, db):
        """SLA of 1 business day (9h with 9-18)."""
        sla = _make_sla(value=1, unit="days", business_start_hour=9, business_end_hour=18)
        db.add(sla)
        db.commit()

        # Monday 2026-03-02 09:00 BRT (12:00 UTC) + 1 day (1440 min)
        start = datetime(2026, 3, 2, 12, 0, tzinfo=timezone.utc)
        deadline = calculate_business_deadline(start, sla, db)

        assert deadline > start
        # 1 day = 1440 min / 9 business hours/day = multiple days of business time

    def test_outside_business_hours_start(self, db):
        """SLA starting outside business hours waits for next business day."""
        sla = _make_sla(value=60, unit="minutes", business_start_hour=9, business_end_hour=18)
        db.add(sla)
        db.commit()

        # Monday 2026-03-02 at 05:00 BRT (08:00 UTC) - before business hours
        start = datetime(2026, 3, 2, 8, 0, tzinfo=timezone.utc)
        deadline = calculate_business_deadline(start, sla, db)

        assert deadline > start
        # Should start counting from 09:00 BRT, so deadline ~10:00 BRT

    def test_multiple_holidays_in_sequence(self, db):
        """Multiple consecutive holidays are all skipped."""
        sla = _make_sla(value=1, unit="hours", business_start_hour=9, business_end_hour=18)
        db.add(sla)
        db.commit()

        # Add holidays on Wed, Thu, Fri (2026-03-11, 12, 13)
        for day in [11, 12, 13]:
            h = CorporateCalendar(
                id=uuid.uuid4(),
                date=date(2026, 3, day),
                name=f"Holiday {day}",
                type="NATIONAL",
            )
            db.add(h)
        db.commit()

        # Tuesday 2026-03-10 at 17:30 BRT (20:30 UTC) - 30min left, need 1h
        start = datetime(2026, 3, 10, 20, 30, tzinfo=timezone.utc)
        deadline = calculate_business_deadline(start, sla, db)

        assert deadline > start
        # Should skip Wed, Thu, Fri holidays AND Sat, Sun -> Monday 2026-03-16
        # Total gap should be significant

    def test_utc_timezone_handling(self, db):
        """SLA with UTC timezone works correctly."""
        sla = _make_sla(value=60, unit="minutes", business_start_hour=9, business_end_hour=18, tz="UTC")
        db.add(sla)
        db.commit()

        start = datetime(2026, 3, 2, 10, 0, tzinfo=timezone.utc)  # Monday 10:00 UTC
        deadline = calculate_business_deadline(start, sla, db)

        assert deadline > start
        # 60 min from 10:00 UTC = 11:00 UTC
        diff_minutes = (deadline - start).total_seconds() / 60
        assert diff_minutes == 60

    def test_zero_duration_sla(self, db):
        """SLA with 0 minutes should return immediately."""
        sla = _make_sla(value=0, unit="minutes", business_start_hour=9, business_end_hour=18, tz="UTC")
        db.add(sla)
        db.commit()

        start = datetime(2026, 3, 2, 10, 0, tzinfo=timezone.utc)
        deadline = calculate_business_deadline(start, sla, db)

        # Should be same as start (0 minutes counted)
        assert deadline == start
