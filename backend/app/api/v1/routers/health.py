from fastapi import APIRouter

router = APIRouter()


@router.get("/health", summary="Health check")
async def health_check():
    return {"status": "healthy", "service": "expenso-backend", "version": "1.0.0"}
