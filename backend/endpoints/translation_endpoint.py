"""Translation endpoint for generating English translations from Spanish content."""
from fastapi import APIRouter, status, HTTPException
from pydantic import BaseModel, Field

from services.translation_service import TranslationService

router = APIRouter(prefix="/api", tags=["translation"])


class TranslationRequest(BaseModel):
    """Request model for translation endpoint"""
    text: str = Field(..., min_length=1, max_length=10000, description="Spanish text to translate")
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Este es mi primer proyecto importante"
            }
        }


class TranslationResponse(BaseModel):
    """Response model for translation endpoint"""
    original_text: str
    translated_text: str
    source_language: str = "es"
    target_language: str = "en"
    confidence: float = Field(0.7, description="Confidence score (0.7 for auto-translations)")
    is_draft: bool = True
    status: str = "success"
    
    class Config:
        json_schema_extra = {
            "example": {
                "original_text": "Este es mi primer proyecto importante",
                "translated_text": "This is my first important project",
                "source_language": "es",
                "target_language": "en",
                "confidence": 0.7,
                "is_draft": True,
                "status": "success"
            }
        }


class TranslationErrorResponse(BaseModel):
    """Response model for translation errors"""
    status: str = "error"
    message: str
    original_text: str


@router.post(
    "/translate",
    response_model=TranslationResponse,
    status_code=status.HTTP_200_OK,
    summary="Translate Spanish text to English",
    description="Generate an English translation proposal for Spanish content. Translations are marked as 'draft' and should be reviewed by user."
)
async def translate_text(
    request: TranslationRequest,
) -> TranslationResponse:
    """
    Generate an English translation for Spanish text using LibreTranslate API.
    
    The translation is marked as 'draft' (is_draft=True) and should be reviewed
    by the user before marking as reviewed in the CMS.
    
    Args:
        request: TranslationRequest with Spanish text
        
    Returns:
        TranslationResponse with translated text and metadata
        
    Raises:
        HTTPException: If text is empty or translation fails
    """
    if not request.text or not request.text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Text cannot be empty"
        )
    
    # Call translation service
    result = await TranslationService.translate_text(request.text)
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Translation service unavailable. Please try again later or enter translation manually."
        )
    
    return TranslationResponse(
        original_text=request.text,
        translated_text=result["translated_text"],
        source_language=result["source_language"],
        target_language=result["target_language"],
        confidence=result["confidence"],
        is_draft=result["is_draft"],
        status="success"
    )


@router.post(
    "/translate-batch",
    response_model=list[TranslationResponse],
    status_code=status.HTTP_200_OK,
    summary="Translate multiple Spanish texts to English",
    description="Generate English translation proposals for multiple Spanish content items."
)
async def translate_batch(
    requests: list[TranslationRequest],
) -> list[TranslationResponse]:
    """
    Generate English translations for multiple Spanish texts.
    
    Useful for translating all translatable fields of a content item at once.
    Each translation is marked as 'draft' and should be reviewed.
    
    Args:
        requests: List of TranslationRequest objects
        
    Returns:
        List of TranslationResponse objects (same length as input)
    """
    if not requests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Request list cannot be empty"
        )
    
    if len(requests) > 20:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum 20 items per batch translation request"
        )
    
    results = []
    for request in requests:
        if not request.text or not request.text.strip():
            results.append(TranslationResponse(
                original_text=request.text,
                translated_text="",
                confidence=0.0,
                is_draft=True,
                status="error"
            ))
            continue
        
        result = await TranslationService.translate_text(request.text)
        
        if result:
            results.append(TranslationResponse(
                original_text=request.text,
                translated_text=result["translated_text"],
                source_language=result["source_language"],
                target_language=result["target_language"],
                confidence=result["confidence"],
                is_draft=result["is_draft"],
                status="success"
            ))
        else:
            results.append(TranslationResponse(
                original_text=request.text,
                translated_text="",
                confidence=0.0,
                is_draft=True,
                status="error"
            ))
    
    return results
