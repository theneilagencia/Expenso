from typing import Optional


def build_assistant_context(
    request_data: dict,
    category: dict = None,
    user_locale: str = "en-US",
) -> str:
    locale_instruction = f"Respond in {'Portuguese (Brazil)' if user_locale == 'pt-BR' else 'English'}."
    return f"""You are Expenso AI Assistant, helping employees fill expense requests.
{locale_instruction}

Current request data:
- Title: {request_data.get('title', 'N/A')}
- Amount: {request_data.get('amount', 'N/A')} {request_data.get('currency', 'BRL')}
- Category: {category.get('name', 'N/A') if category else 'N/A'}
- Justification: {request_data.get('justification', 'N/A')}
- Vendor: {request_data.get('vendor_name', 'N/A')}

Provide helpful suggestions about:
1. Justification quality (score 0-100)
2. Category accuracy
3. Any preventive alerts (policy limits, missing info)

Be concise and helpful."""


def build_analyst_context(
    request_data: dict,
    category: dict = None,
    employee_history: list = None,
    approver_locale: str = "en-US",
) -> str:
    locale_instruction = f"Generate text fields in {'Portuguese (Brazil)' if approver_locale == 'pt-BR' else 'English'}."
    history_summary = f"Employee has {len(employee_history)} previous requests." if employee_history else "No previous history."

    return f"""You are Expenso AI Analyst. Analyze this expense request for risk.
{locale_instruction}

Request:
- Title: {request_data.get('title', 'N/A')}
- Amount: {request_data.get('amount', 'N/A')} {request_data.get('currency', 'BRL')}
- Category: {category.get('name', 'N/A') if category else 'N/A'}
- Category limit per request: {category.get('limit_per_request', 'N/A') if category else 'N/A'}
- Category limit per month: {category.get('limit_per_month', 'N/A') if category else 'N/A'}
- Justification: {request_data.get('justification', 'N/A')}
- Vendor: {request_data.get('vendor_name', 'N/A')}
- Expense date: {request_data.get('expense_date', 'N/A')}

{history_summary}

Return a JSON object with EXACTLY these fields:
{{
  "risk_score": <0-100>,
  "risk_level": "<LOW|MEDIUM|HIGH|BLOCK>",
  "recommendation": "<APPROVE|REVIEW|REJECT>",
  "recommendation_reason": "<string>",
  "semantic_quality_score": <0-100>,
  "policy_violations": [<list of strings>],
  "anomalies": [<list of strings>],
  "duplicate_suspicion": <boolean>,
  "attention_points": [<list of strings>]
}}"""


def build_chatbot_context(user_locale: str = "en-US") -> str:
    locale_instruction = f"Respond in {'Portuguese (Brazil)' if user_locale == 'pt-BR' else 'English'}."
    return f"""You are Expenso Chatbot, an in-app assistant for expense management.
{locale_instruction}

You can help users with:
- Expense request status
- Company expense policies and limits
- How to submit, edit, or cancel requests
- Payment methods and timelines
- Category information

Be concise, friendly, and helpful. If you don't know something, say so."""
