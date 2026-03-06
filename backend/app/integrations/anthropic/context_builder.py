

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


def build_writer_context(
    mode: str,
    data: dict,
    user_locale: str = "en-US",
) -> str:
    """Build context for the Writer AI role.

    Modes:
    - "narrative": Generate a narrative expense report from aggregated data.
    - "summary": Generate an executive summary for a single request.
    - "suggest_comment": Draft an approval/rejection comment.
    """
    locale_instruction = f"Respond in {'Portuguese (Brazil)' if user_locale == 'pt-BR' else 'English'}."

    if mode == "narrative":
        dashboard = data.get("dashboard", {})
        categories = data.get("by_category", [])
        departments = data.get("by_department", [])
        period = data.get("period", "selected period")

        cat_lines = "\n".join(
            f"- {c.get('category', 'N/A')}: {c.get('count', 0)} requests, total {c.get('total', 0):,.2f}"
            for c in categories
        ) or "No category data."

        dept_lines = "\n".join(
            f"- {d.get('department', 'N/A')}: {d.get('count', 0)} requests, total {d.get('total', 0):,.2f}"
            for d in departments
        ) or "No department data."

        return f"""Generate a professional narrative expense report for the {period}.
{locale_instruction}

Dashboard summary:
- Total requests: {dashboard.get('total_requests', 0)}
- Total amount: {dashboard.get('total_amount', 0):,.2f}
- Average amount: {dashboard.get('average_amount', 0):,.2f}
- Total paid: {dashboard.get('total_paid', 0):,.2f}
- Total pending: {dashboard.get('total_pending', 0):,.2f}

By category:
{cat_lines}

By department:
{dept_lines}

Write a clear, structured narrative report with:
1. Executive summary
2. Key findings and trends
3. Category analysis
4. Department comparison
5. Recommendations

Be concise and data-driven. Use specific numbers from the data."""

    elif mode == "summary":
        return f"""Generate a concise executive summary for this expense request.
{locale_instruction}

Request details:
- Title: {data.get('title', 'N/A')}
- Amount: {data.get('amount', 'N/A')} {data.get('currency', 'BRL')}
- Status: {data.get('status', 'N/A')}
- Justification: {data.get('justification', 'N/A')}
- Vendor: {data.get('vendor_name', 'N/A')}
- Category: {data.get('category_name', 'N/A')}
- AI Risk Score: {data.get('ai_risk_score', 'N/A')}
- AI Risk Level: {data.get('ai_risk_level', 'N/A')}
- AI Recommendation: {data.get('ai_recommendation', 'N/A')}

Write a 2-3 sentence executive summary highlighting key aspects for the reviewer."""

    elif mode == "suggest_comment":
        action = data.get("action", "approve")
        action_label = {
            "approve": "approval",
            "reject": "rejection",
            "request_edit": "correction request",
        }.get(action, action)

        return f"""Draft a professional {action_label} comment for this expense request.
{locale_instruction}

Request details:
- Title: {data.get('title', 'N/A')}
- Amount: {data.get('amount', 'N/A')} {data.get('currency', 'BRL')}
- Justification: {data.get('justification', 'N/A')}
- Category: {data.get('category_name', 'N/A')}
- AI Risk Score: {data.get('ai_risk_score', 'N/A')}
- AI Recommendation: {data.get('ai_recommendation', 'N/A')}

Write a concise, professional comment suitable for a manager or finance reviewer.
The comment should be ready to use as-is. Do not include greetings or sign-offs."""

    else:
        return f"Provide helpful text content.\n{locale_instruction}"
