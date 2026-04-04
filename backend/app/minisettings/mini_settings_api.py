# app/mini_settings_api.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from .settings_service import mini_settings_service

router = APIRouter(prefix="/api/mini-settings", tags=["mini-settings"])

class MiniSettingsUpdate(BaseModel):
    theme: Optional[str] = None
    screensaver: Optional[bool] = None
    schoolType: Optional[str] = None

class CompleteMiniSettings(BaseModel):
    hasSeenMiniSettings: bool
    theme: str
    screensaver: bool
    schoolType: str

class ScreensaverRequest(BaseModel):
    enabled: bool

class SchoolTypeRequest(BaseModel):
    school_type: str

@router.get("/")
async def get_mini_settings():
    """Get all mini settings."""
    return mini_settings_service.get_all_mini_settings()

@router.post("/seen")
async def mark_as_seen():
    """Mark that user has seen mini settings."""
    mini_settings_service.set_seen_mini_settings(True)
    return {"message": "Mini settings marked as seen", "success": True}

@router.get("/has-seen")
async def has_seen_mini_settings():
    """Check if user has seen mini settings."""
    return {"hasSeenMiniSettings": mini_settings_service.has_seen_mini_settings()}

@router.get("/theme")
async def get_theme():
    """Get current theme."""
    return {"theme": mini_settings_service.get_theme()}

@router.post("/theme")
async def update_theme(theme: str):
    """Update theme."""
    if theme not in ["light", "dark"]:
        raise HTTPException(status_code=400, detail="Theme must be 'light' or 'dark'")
    
    mini_settings_service.set_theme(theme)
    return {"message": f"Theme updated to {theme}", "success": True}

@router.get("/screensaver")
async def get_screensaver():
    """Get screensaver setting."""
    return {"screensaver": mini_settings_service.get_screensaver()}

# @router.post("/screensaver")
# async def update_screensaver(enabled: bool):
#     """Update screensaver setting."""
#     mini_settings_service.set_screensaver(enabled)
#     status = "enabled" if enabled else "disabled"
#     return {"message": f"Screensaver {status}", "success": True}

@router.post("/screensaver")
async def update_screensaver(req: ScreensaverRequest):
    mini_settings_service.set_screensaver(req.enabled)
    status = "enabled" if req.enabled else "disabled"
    return {"message": f"Screensaver {status}", "success": True}

@router.get("/school-type")
async def get_school_type():
    """Get school type."""
    return {"schoolType": mini_settings_service.get_school_type()}

# @router.post("/school-type")
# async def update_school_type(school_type: str):
#     """Update school type."""
#     valid_types = ["JHS", "SHS", "Basic School"]
#     if school_type not in valid_types:
#         raise HTTPException(
#             status_code=400, 
#             detail=f"School type must be one of: {valid_types}"
#         )
    
#     mini_settings_service.set_school_type(school_type)
#     return {"message": f"School type updated to {school_type}", "success": True}

@router.post("/school-type")
async def update_school_type(req: SchoolTypeRequest):
    valid_types = ["JHS", "SHS", "Basic School"]

    if req.school_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"School type must be one of: {valid_types}"
        )

    mini_settings_service.set_school_type(req.school_type)
    return {"message": f"School type updated to {req.school_type}", "success": True}


@router.post("/update")
async def update_multiple_settings(updates: MiniSettingsUpdate):
    """Update multiple mini settings at once."""
    update_dict = {}
    if updates.theme is not None:
        if updates.theme not in ["light", "dark"]:
            raise HTTPException(status_code=400, detail="Theme must be 'light' or 'dark'")
        update_dict["theme"] = updates.theme
    
    if updates.screensaver is not None:
        update_dict["screensaver"] = updates.screensaver
    
    if updates.schoolType is not None:
        valid_types = ["JHS", "SHS", "Basic School"]
        if updates.schoolType not in valid_types:
            raise HTTPException(
                status_code=400, 
                detail=f"School type must be one of: {valid_types}"
            )
        update_dict["schoolType"] = updates.schoolType
    
    if update_dict:
        mini_settings_service.update_mini_settings(update_dict)
    
    return {
        "message": f"Updated {len(update_dict)} setting(s)", 
        "success": True,
        "updated": update_dict
    }

@router.post("/save-all")
async def save_all_mini_settings(settings: CompleteMiniSettings):
    """Save all mini settings at once."""
    if settings.theme not in ["light", "dark"]:
        raise HTTPException(status_code=400, detail="Theme must be 'light' or 'dark'")
    
    valid_types = ["JHS", "SHS", "Basic School"]
    if settings.schoolType not in valid_types:
        raise HTTPException(
            status_code=400, 
            detail=f"School type must be one of: {valid_types}"
        )
    
    # Save all settings
    all_settings = {
        "hasSeenMiniSettings": settings.hasSeenMiniSettings,
        "theme": settings.theme,
        "screensaver": settings.screensaver,
        "schoolType": settings.schoolType,
        "version": "1.0.0"
    }
    
    mini_settings_service.save_all_settings(all_settings)
    
    return {
        "message": "All mini settings saved successfully",
        "success": True,
        "settings": all_settings
    }

@router.delete("/reset")
async def reset_mini_settings():
    """Reset mini settings to defaults."""
    mini_settings_service.reset_mini_settings()
    return {"message": "Mini settings reset to defaults", "success": True}

@router.get("/file-path")
async def get_settings_file_path():
    """Get the path to the settings file (for debugging)."""
    return {"path": mini_settings_service.get_settings_file_path()}