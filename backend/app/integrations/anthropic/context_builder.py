

def build_assistant_context(
    request_data: dict,
    category: dict = None,
    user_locale: str = "en-US",
) -> str:
    locale_instruction = f"Respond in {'Portuguese (Brazil)' if user_locale == 'pt-BR' else 'English'}."

    category_info = ""
    if category:
        category_info = f"""- Category: {category.get('name', 'N/A')}"""
        if category.get('limit_per_request'):
            category_info += f"\n- Category limit per request: {category['limit_per_request']}"
        if category.get('min_justification_chars'):
            category_info += f"\n- Min justification chars: {category['min_justification_chars']}"
        if category.get('requires_strong_just'):
            category_info += "\n- This category requires strong justification"

    return f"""You are Expenso AI Assistant, helping employees fill expense requests.
{locale_instruction}

Current request data:
- Title: {request_data.get('title', 'N/A')}
- Description: {request_data.get('description', 'N/A')}
- Amount: {request_data.get('amount', 'N/A')} {request_data.get('currency', 'BRL')}
{category_info}
- Justification: {request_data.get('justification', 'N/A')}
- Vendor: {request_data.get('vendor_name', 'N/A')}
- Expense date: {request_data.get('expense_date', 'N/A')}

Start your response with QUALITY_SCORE: XX (0-100) on the first line.

Then provide helpful suggestions about:
1. Justification quality and improvements
2. Category accuracy
3. Policy alerts (spending limits, missing info)
4. Preventive recommendations

Be concise, empathetic, and constructive."""


def build_analyst_context(
    request_data: dict,
    category: dict = None,
    employee_history: list = None,
    approver_locale: str = "en-US",
) -> str:
    locale_instruction = f"Generate text fields in {'Portuguese (Brazil)' if approver_locale == 'pt-BR' else 'English'}."

    history_text = "No previous history."
    if employee_history:
        history_text = f"Employee has {len(employee_history)} previous requests:\n"
        for h in employee_history[:10]:
            history_text += f"  - {h.get('title', 'N/A')}: {h.get('amount', 'N/A')} ({h.get('status', 'N/A')}, {h.get('date', 'N/A')})\n"

    category_text = "No category info."
    if category:
        category_text = f"""Category: {category.get('name', 'N/A')}
- Limit per request: {category.get('limit_per_request', 'N/A')}
- Limit per month: {category.get('limit_per_month', 'N/A')}
- Max days to submit: {category.get('max_days_to_submit', 'N/A')}
- Min justification chars: {category.get('min_justification_chars', 'N/A')}
- Requires strong justification: {category.get('requires_strong_just', False)}
- Receipt required above: {category.get('receipt_required_above', 'N/A')}
- AI attention score: {category.get('ai_attention_score', 50)}"""

    return f"""You are Expenso AI Analyst. Analyze this expense request for risk.
{locale_instruction}

Request:
- Title: {request_data.get('title', 'N/A')}
- Amount: {request_data.get('amount', 'N/A')} {request_data.get('currency', 'BRL')}
- Justification: {request_data.get('justification', 'N/A')}
- Vendor: {request_data.get('vendor_name', 'N/A')}
- Expense date: {request_data.get('expense_date', 'N/A')}

{category_text}

{history_text}

Look for:
- Statistical outliers compared to employee history
- Frequency anomalies (multiple similar requests in short period)
- Weekend or holiday expenses
- Justification quality and coherence

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


def build_strategist_context(
    department_summary: list,
    category_summary: list = None,
    period: str = "last 30 days",
) -> str:
    dept_lines = "\n".join(
        f"- {d['department_name']}: {d['total_requests']} requests, total R$ {d['total_amount']:,.2f}"
        for d in department_summary
    )
    cat_lines = ""
    if category_summary:
        cat_lines = "\n\nCategory breakdown:\n" + "\n".join(
            f"- {c['category_name']}: {c['count']} requests, total R$ {c['total']:,.2f}"
            for c in category_summary
        )

    total_amount = sum(d["total_amount"] for d in department_summary)
    total_requests = sum(d["total_requests"] for d in department_summary)

    return f"""Analysis period: {period}
Total across all departments: {total_requests} requests, R$ {total_amount:,.2f}

Department breakdown:
{dept_lines}{cat_lines}

Please analyze this data and return a JSON report with strategic insights."""


def build_chatbot_context(
    user_locale: str = "en-US",
    user_role: str = "EMPLOYEE",
    user_context: str = None,
) -> str:
    locale_instruction = f"Respond in {'Portuguese (Brazil)' if user_locale == 'pt-BR' else 'English'}."

    role_context = ""
    if user_role == "EMPLOYEE":
        role_context = "The user is an Employee. They can only see their own expense requests."
    elif user_role == "MANAGER":
        role_context = "The user is a Manager. They can see their team's expense requests and approve/reject them."
    elif user_role == "FINANCE":
        role_context = "The user is a Finance user. They can see all expense requests for payment processing."
    elif user_role == "ADMIN":
        role_context = "The user is an Admin. They have full access to all data and configurations."

    data_context = ""
    if user_context:
        data_context = f"\nCurrent data: {user_context}"

    return f"""You are Expenso Chatbot, an in-app assistant for expense management.
{locale_instruction}
{role_context}{data_context}

You can help users with:
- Expense request status and workflow
- Company expense policies and category limits
- How to submit, edit, or cancel requests
- Payment methods and timelines
- SLA deadlines and processing times
- Category information

Be concise, friendly, and helpful. If you don't know something, say so."""
