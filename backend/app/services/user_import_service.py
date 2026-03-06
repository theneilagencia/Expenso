import io
import re
import uuid

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.cost_center import CostCenter
from app.models.department import Department
from app.models.user import User

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
VALID_ROLES = {"EMPLOYEE", "MANAGER", "FINANCE", "ADMIN"}
DEFAULT_PASSWORD = "Expenso@2026"


class UserImportService:
    @staticmethod
    def parse_xlsx(file_bytes: bytes, db: Session) -> dict:
        """Parse XLSX file and create users.

        Returns {"created": [...], "skipped": [...], "errors": [...]}.

        Expected columns: full_name, email, role, department_code, cost_center_code
        """
        import openpyxl

        created = []
        skipped = []
        errors = []

        try:
            wb = openpyxl.load_workbook(io.BytesIO(file_bytes), read_only=True)
        except Exception as e:
            return {"created": [], "skipped": [], "errors": [f"Invalid XLSX file: {e}"]}

        ws = wb.active
        if ws is None:
            return {"created": [], "skipped": [], "errors": ["Empty workbook"]}

        rows = list(ws.iter_rows(values_only=True))
        if len(rows) < 2:
            return {"created": [], "skipped": [], "errors": ["No data rows found"]}

        # Parse header row
        header = [str(cell).strip().lower() if cell else "" for cell in rows[0]]
        expected = {"full_name", "email", "role", "department_code", "cost_center_code"}
        if not expected.issubset(set(header)):
            missing = expected - set(header)
            return {"created": [], "skipped": [], "errors": [f"Missing columns: {', '.join(missing)}"]}

        col_map = {name: idx for idx, name in enumerate(header)}
        password_hash = hash_password(DEFAULT_PASSWORD)

        for row_num, row in enumerate(rows[1:], start=2):
            try:
                full_name = str(row[col_map["full_name"]] or "").strip()
                email = str(row[col_map["email"]] or "").strip().lower()
                role = str(row[col_map["role"]] or "").strip().upper()
                dept_code = str(row[col_map["department_code"]] or "").strip()
                cc_code = str(row[col_map["cost_center_code"]] or "").strip()

                if not full_name or not email:
                    errors.append(f"Row {row_num}: missing full_name or email")
                    continue

                if not EMAIL_REGEX.match(email):
                    errors.append(f"Row {row_num}: invalid email '{email}'")
                    continue

                if role not in VALID_ROLES:
                    errors.append(f"Row {row_num}: invalid role '{role}'")
                    continue

                # Check if user already exists
                existing = db.query(User).filter(User.email == email).first()
                if existing:
                    skipped.append({"row": row_num, "email": email, "reason": "already_exists"})
                    continue

                # Lookup department
                department = None
                if dept_code:
                    department = db.query(Department).filter(
                        Department.code == dept_code,
                        Department.deleted_at.is_(None),
                    ).first()
                    if not department:
                        skipped.append({"row": row_num, "email": email, "reason": f"department_not_found: {dept_code}"})
                        continue

                # Lookup cost center
                cost_center = None
                if cc_code:
                    cost_center = db.query(CostCenter).filter(
                        CostCenter.code == cc_code,
                        CostCenter.deleted_at.is_(None),
                    ).first()
                    if not cost_center:
                        skipped.append({"row": row_num, "email": email, "reason": f"cost_center_not_found: {cc_code}"})
                        continue

                user = User(
                    id=uuid.uuid4(),
                    full_name=full_name,
                    email=email,
                    password_hash=password_hash,
                    role=role,
                    department_id=department.id if department else None,
                    cost_center_id=cost_center.id if cost_center else None,
                    force_password_reset=True,
                )
                db.add(user)
                created.append({"row": row_num, "email": email, "role": role})

            except Exception as e:
                errors.append(f"Row {row_num}: {e}")

        if created:
            db.commit()

        return {"created": created, "skipped": skipped, "errors": errors}
