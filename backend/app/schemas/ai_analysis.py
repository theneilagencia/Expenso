from pydantic import BaseModel, Field


class AnalystResponse(BaseModel):
    risk_score: int = Field(ge=0, le=100)
    risk_level: str = Field(pattern=r"^(LOW|MEDIUM|HIGH|BLOCK)$")
    recommendation: str = Field(pattern=r"^(APPROVE|REVIEW|REJECT)$")
    recommendation_reason: str = ""
    semantic_quality_score: int = Field(ge=0, le=100, default=50)
    policy_violations: list[str] = Field(default_factory=list)
    anomalies: list[str] = Field(default_factory=list)
    duplicate_suspicion: bool = False
    attention_points: list[str] = Field(default_factory=list)
