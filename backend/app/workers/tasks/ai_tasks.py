from app.workers.celery_app import celery_app


@celery_app.task(name="app.workers.tasks.ai_tasks.analyze_request")
def analyze_request(request_id: str):
    """Run AI analyst on a submitted expense request."""
    # TODO: Implement AI analyst integration
    pass


@celery_app.task(name="app.workers.tasks.ai_tasks.run_strategist_analysis")
def run_strategist_analysis():
    """Run daily strategist analysis for forecasting and optimization."""
    # TODO: Implement AI strategist integration
    pass
