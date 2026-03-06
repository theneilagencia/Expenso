"""Simple currency conversion with hardcoded rates.

TODO: Replace with BCB (Banco Central do Brasil) API for live rates.
"""

# Approximate rates to BRL (updated periodically)
_RATES_TO_BRL: dict[str, float] = {
    "BRL": 1.0,
    "USD": 5.05,
    "EUR": 5.50,
    "GBP": 6.40,
}


def get_exchange_rate(currency: str) -> float:
    """Return the exchange rate from the given currency to BRL."""
    return _RATES_TO_BRL.get(currency.upper(), 1.0)


def convert_to_brl(amount: float, currency: str) -> tuple[float, float]:
    """Convert amount to BRL. Returns (amount_brl, exchange_rate)."""
    rate = get_exchange_rate(currency)
    return round(amount * rate, 2), rate
