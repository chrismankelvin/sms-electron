# # app/mini_settings_api.py
# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# from typing import Optional, Dict, Any
# from .settings_service import mini_settings_service

# router = APIRouter(prefix="/api/mini-settings", tags=["mini-settings"])

# class MiniSettingsUpdate(BaseModel):
#     theme: Optional[str] = None
#     screensaver: Optional[bool] = None
#     schoolType: Optional[str] = None

# class CompleteMiniSettings(BaseModel):
#     hasSeenMiniSettings: bool
#     theme: str
#     screensaver: bool
#     schoolType: str

# class ScreensaverRequest(BaseModel):
#     enabled: bool

# class SchoolTypeRequest(BaseModel):
#     school_type: str

# @router.get("/")
# async def get_mini_settings():
#     """Get all mini settings."""
#     return mini_settings_service.get_all_mini_settings()

# @router.post("/seen")
# async def mark_as_seen():
#     """Mark that user has seen mini settings."""
#     mini_settings_service.set_seen_mini_settings(True)
#     return {"message": "Mini settings marked as seen", "success": True}

# @router.get("/has-seen")
# async def has_seen_mini_settings():
#     """Check if user has seen mini settings."""
#     return {"hasSeenMiniSettings": mini_settings_service.has_seen_mini_settings()}

# @router.get("/theme")
# async def get_theme():
#     """Get current theme."""
#     return {"theme": mini_settings_service.get_theme()}

# @router.post("/theme")
# async def update_theme(theme: str):
#     """Update theme."""
#     if theme not in ["light", "dark"]:
#         raise HTTPException(status_code=400, detail="Theme must be 'light' or 'dark'")
    
#     mini_settings_service.set_theme(theme)
#     return {"message": f"Theme updated to {theme}", "success": True}

# @router.get("/screensaver")
# async def get_screensaver():
#     """Get screensaver setting."""
#     return {"screensaver": mini_settings_service.get_screensaver()}

# # @router.post("/screensaver")
# # async def update_screensaver(enabled: bool):
# #     """Update screensaver setting."""
# #     mini_settings_service.set_screensaver(enabled)
# #     status = "enabled" if enabled else "disabled"
# #     return {"message": f"Screensaver {status}", "success": True}

# @router.post("/screensaver")
# async def update_screensaver(req: ScreensaverRequest):
#     mini_settings_service.set_screensaver(req.enabled)
#     status = "enabled" if req.enabled else "disabled"
#     return {"message": f"Screensaver {status}", "success": True}

# @router.get("/school-type")
# async def get_school_type():
#     """Get school type."""
#     return {"schoolType": mini_settings_service.get_school_type()}

# # @router.post("/school-type")
# # async def update_school_type(school_type: str):
# #     """Update school type."""
# #     valid_types = ["JHS", "SHS", "Basic School"]
# #     if school_type not in valid_types:
# #         raise HTTPException(
# #             status_code=400, 
# #             detail=f"School type must be one of: {valid_types}"
# #         )
    
# #     mini_settings_service.set_school_type(school_type)
# #     return {"message": f"School type updated to {school_type}", "success": True}

# @router.post("/school-type")
# async def update_school_type(req: SchoolTypeRequest):
#     valid_types = ["JHS", "SHS", "Basic School"]

#     if req.school_type not in valid_types:
#         raise HTTPException(
#             status_code=400,
#             detail=f"School type must be one of: {valid_types}"
#         )

#     mini_settings_service.set_school_type(req.school_type)
#     return {"message": f"School type updated to {req.school_type}", "success": True}


# @router.post("/update")
# async def update_multiple_settings(updates: MiniSettingsUpdate):
#     """Update multiple mini settings at once."""
#     update_dict = {}
#     if updates.theme is not None:
#         if updates.theme not in ["light", "dark"]:
#             raise HTTPException(status_code=400, detail="Theme must be 'light' or 'dark'")
#         update_dict["theme"] = updates.theme
    
#     if updates.screensaver is not None:
#         update_dict["screensaver"] = updates.screensaver
    
#     if updates.schoolType is not None:
#         valid_types = ["JHS", "SHS", "Basic School"]
#         if updates.schoolType not in valid_types:
#             raise HTTPException(
#                 status_code=400, 
#                 detail=f"School type must be one of: {valid_types}"
#             )
#         update_dict["schoolType"] = updates.schoolType
    
#     if update_dict:
#         mini_settings_service.update_mini_settings(update_dict)
    
#     return {
#         "message": f"Updated {len(update_dict)} setting(s)", 
#         "success": True,
#         "updated": update_dict
#     }

# @router.post("/save-all")
# async def save_all_mini_settings(settings: CompleteMiniSettings):
#     """Save all mini settings at once."""
#     if settings.theme not in ["light", "dark"]:
#         raise HTTPException(status_code=400, detail="Theme must be 'light' or 'dark'")
    
#     valid_types = ["JHS", "SHS", "Basic School"]
#     if settings.schoolType not in valid_types:
#         raise HTTPException(
#             status_code=400, 
#             detail=f"School type must be one of: {valid_types}"
#         )
    
#     # Save all settings
#     all_settings = {
#         "hasSeenMiniSettings": settings.hasSeenMiniSettings,
#         "theme": settings.theme,
#         "screensaver": settings.screensaver,
#         "schoolType": settings.schoolType,
#         "version": "1.0.0"
#     }
    
#     mini_settings_service.save_all_settings(all_settings)
    
#     return {
#         "message": "All mini settings saved successfully",
#         "success": True,
#         "settings": all_settings
#     }

# @router.delete("/reset")
# async def reset_mini_settings():
#     """Reset mini settings to defaults."""
#     mini_settings_service.reset_mini_settings()
#     return {"message": "Mini settings reset to defaults", "success": True}

# @router.get("/file-path")
# async def get_settings_file_path():
#     """Get the path to the settings file (for debugging)."""
#     return {"path": mini_settings_service.get_settings_file_path()}




# app/mini_settings_api.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from .settings_service import mini_settings_service

router = APIRouter(prefix="/api/mini-settings", tags=["mini-settings"])

# ========== Request/Response Models ==========
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

# New models for array fields
class SchoolTypesRequest(BaseModel):
    school_types: List[str]  # Can have up to 4

class AssessmentTypesRequest(BaseModel):
    assessment_types: List[str]  # Can have up to 2

class LoginConfigsRequest(BaseModel):
    login_configs: List[str]  # Selected roles

class CompleteMiniSettingsV2(BaseModel):
    hasSeenMiniSettings: bool
    theme: str
    screensaver: bool
    schoolTypes: List[str]
    assessmentTypes: List[str]
    loginConfigs: List[str]

# Validation constants
VALID_THEMES = ["light", "dark"]
VALID_SCHOOL_TYPES = ["kindergarten", "primary", "jhs", "shs", "institute"]
VALID_ASSESSMENT_TYPES = ["montessori", "international (IB/Cambridge)", "GPA"]
VALID_LOGIN_ROLES = ["student", "teachers", "parent", "non-staff", "TA", "accountant"]

MAX_SCHOOL_TYPES = 4
MAX_ASSESSMENT_TYPES = 2

# ========== Basic Endpoints ==========
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

# ========== Theme Endpoints ==========
@router.get("/theme")
async def get_theme():
    """Get current theme."""
    return {"theme": mini_settings_service.get_theme()}

@router.post("/theme")
async def update_theme(theme: str):
    """Update theme."""
    if theme not in VALID_THEMES:
        raise HTTPException(status_code=400, detail=f"Theme must be one of: {VALID_THEMES}")
    
    mini_settings_service.set_theme(theme)
    return {"message": f"Theme updated to {theme}", "success": True}

# ========== Screensaver Endpoints ==========
@router.get("/screensaver")
async def get_screensaver():
    """Get screensaver setting."""
    return {"screensaver": mini_settings_service.get_screensaver()}

@router.post("/screensaver")
async def update_screensaver(req: ScreensaverRequest):
    """Update screensaver setting."""
    mini_settings_service.set_screensaver(req.enabled)
    status = "enabled" if req.enabled else "disabled"
    return {"message": f"Screensaver {status}", "success": True}

# ========== Legacy School Type Endpoints (Backward Compatible) ==========
@router.get("/school-type")
async def get_school_type():
    """Legacy: Get single school type for backward compatibility."""
    return {"schoolType": mini_settings_service.get_school_type()}

@router.post("/school-type")
async def update_school_type(req: SchoolTypeRequest):
    """Legacy: Update single school type (maintains backward compatibility)."""
    valid_types = ["JHS", "SHS", "Basic School", "kindergarten", "primary", "jhs", "shs", "institute"]
    
    if req.school_type not in valid_types:
        raise HTTPException(
            status_code=400,
            detail=f"School type must be one of: {valid_types}"
        )
    
    mini_settings_service.set_school_type(req.school_type)
    return {"message": f"School type updated to {req.school_type}", "success": True}

# ========== NEW: School Types Array Endpoints ==========
@router.get("/school-types")
async def get_school_types():
    """Get selected school types as array (up to 4)."""
    return {"schoolTypes": mini_settings_service.get_school_types()}

@router.post("/school-types")
async def update_school_types(req: SchoolTypesRequest):
    """Update school types (max 4)."""
    if len(req.school_types) > MAX_SCHOOL_TYPES:
        raise HTTPException(
            status_code=400, 
            detail=f"Maximum {MAX_SCHOOL_TYPES} school types allowed"
        )
    
    # Validate each school type
    invalid_types = [t for t in req.school_types if t.lower() not in VALID_SCHOOL_TYPES]
    if invalid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid school types: {invalid_types}. Must be one of: {VALID_SCHOOL_TYPES}"
        )
    
    mini_settings_service.set_school_types(req.school_types)
    return {
        "message": f"School types updated to {req.school_types}", 
        "success": True,
        "school_types": req.school_types
    }

# ========== NEW: Assessment Types Endpoints ==========
@router.get("/assessment-types")
async def get_assessment_types():
    """Get selected assessment types as array (up to 2)."""
    return {"assessmentTypes": mini_settings_service.get_assessment_types()}

@router.post("/assessment-types")
async def update_assessment_types(req: AssessmentTypesRequest):
    """Update assessment types (max 2)."""
    if len(req.assessment_types) > MAX_ASSESSMENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {MAX_ASSESSMENT_TYPES} assessment types allowed"
        )
    
    # Validate each assessment type
    invalid_types = [t for t in req.assessment_types if t.lower() not in [at.lower() for at in VALID_ASSESSMENT_TYPES]]
    if invalid_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid assessment types: {invalid_types}. Must be one of: {VALID_ASSESSMENT_TYPES}"
        )
    
    mini_settings_service.set_assessment_types(req.assessment_types)
    return {
        "message": f"Assessment types updated to {req.assessment_types}",
        "success": True,
        "assessment_types": req.assessment_types
    }

# ========== NEW: Login Configurations Endpoints ==========
@router.get("/login-configs")
async def get_login_configs():
    """Get selected login configurations."""
    return {"loginConfigs": mini_settings_service.get_login_configs()}

@router.post("/login-configs")
async def update_login_configs(req: LoginConfigsRequest):
    """Update login configurations."""
    # Validate each login role
    invalid_roles = [r for r in req.login_configs if r.lower() not in [role.lower() for role in VALID_LOGIN_ROLES]]
    if invalid_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid login roles: {invalid_roles}. Must be one of: {VALID_LOGIN_ROLES}"
        )
    
    mini_settings_service.set_login_configs(req.login_configs)
    return {
        "message": f"Login configurations updated to {req.login_configs}",
        "success": True,
        "login_configs": req.login_configs
    }

# ========== Update Multiple Settings ==========
@router.post("/update")
async def update_multiple_settings(updates: MiniSettingsUpdate):
    """Update multiple mini settings at once (legacy format)."""
    update_dict = {}
    
    if updates.theme is not None:
        if updates.theme not in VALID_THEMES:
            raise HTTPException(status_code=400, detail=f"Theme must be one of: {VALID_THEMES}")
        update_dict["theme"] = updates.theme
    
    if updates.screensaver is not None:
        update_dict["screensaver"] = updates.screensaver
    
    if updates.schoolType is not None:
        valid_types = ["JHS", "SHS", "Basic School", "kindergarten", "primary", "jhs", "shs", "institute"]
        if updates.schoolType not in valid_types:
            raise HTTPException(
                status_code=400, 
                detail=f"School type must be one of: {valid_types}"
            )
        # Convert to new format
        type_mapping = {
            "JHS": "jhs",
            "SHS": "shs",
            "Basic School": "primary"
        }
        new_type = type_mapping.get(updates.schoolType, updates.schoolType.lower())
        update_dict["schoolTypes"] = [new_type]
    
    if update_dict:
        mini_settings_service.update_mini_settings(update_dict)
    
    return {
        "message": f"Updated {len(update_dict)} setting(s)", 
        "success": True,
        "updated": update_dict
    }

# ========== Save All Settings (V2 - New Format) ==========
@router.post("/save-all")
async def save_all_mini_settings(settings: CompleteMiniSettings):
    """Legacy: Save all mini settings in old format (single school type)."""
    if settings.theme not in VALID_THEMES:
        raise HTTPException(status_code=400, detail=f"Theme must be one of: {VALID_THEMES}")
    
    valid_types = ["JHS", "SHS", "Basic School"]
    if settings.schoolType not in valid_types:
        raise HTTPException(
            status_code=400, 
            detail=f"School type must be one of: {valid_types}"
        )
    
    # Convert to new format
    type_mapping = {
        "JHS": "jhs",
        "SHS": "shs",
        "Basic School": "primary"
    }
    
    # Save all settings in new format
    all_settings = {
        "hasSeenMiniSettings": settings.hasSeenMiniSettings,
        "theme": settings.theme,
        "screensaver": settings.screensaver,
        "schoolTypes": [type_mapping.get(settings.schoolType, settings.schoolType.lower())],
        "assessmentTypes": ["GPA"],  # Default
        "loginConfigs": ["student", "teachers"],  # Default
        "version": "2.0.0"
    }
    
    mini_settings_service.save_all_settings(all_settings)
    
    return {
        "message": "All mini settings saved successfully",
        "success": True,
        "settings": all_settings
    }

# ========== Save All Settings (V3 - New Format with Arrays) ==========
@router.post("/save-all-v2")
async def save_all_mini_settings_v2(settings: CompleteMiniSettingsV2):
    """Save all mini settings in new format with arrays."""
    # Validate theme
    if settings.theme not in VALID_THEMES:
        raise HTTPException(status_code=400, detail=f"Theme must be one of: {VALID_THEMES}")
    
    # Validate school types
    if len(settings.schoolTypes) > MAX_SCHOOL_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {MAX_SCHOOL_TYPES} school types allowed"
        )
    invalid_school_types = [t for t in settings.schoolTypes if t.lower() not in VALID_SCHOOL_TYPES]
    if invalid_school_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid school types: {invalid_school_types}"
        )
    
    # Validate assessment types
    if len(settings.assessmentTypes) > MAX_ASSESSMENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {MAX_ASSESSMENT_TYPES} assessment types allowed"
        )
    invalid_assessment_types = [t for t in settings.assessmentTypes if t.lower() not in [at.lower() for at in VALID_ASSESSMENT_TYPES]]
    if invalid_assessment_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid assessment types: {invalid_assessment_types}"
        )
    
    # Validate login configs
    invalid_login_roles = [r for r in settings.loginConfigs if r.lower() not in [role.lower() for role in VALID_LOGIN_ROLES]]
    if invalid_login_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid login roles: {invalid_login_roles}"
        )
    
    # Save all settings
    all_settings = {
        "hasSeenMiniSettings": settings.hasSeenMiniSettings,
        "theme": settings.theme,
        "screensaver": settings.screensaver,
        "schoolTypes": settings.schoolTypes,
        "assessmentTypes": settings.assessmentTypes,
        "loginConfigs": settings.loginConfigs,
        "version": "3.0.0"
    }
    
    mini_settings_service.save_all_settings(all_settings)
    
    return {
        "message": "All mini settings saved successfully",
        "success": True,
        "settings": all_settings
    }

# ========== Reset Endpoint ==========
@router.delete("/reset")
async def reset_mini_settings():
    """Reset mini settings to defaults."""
    mini_settings_service.reset_mini_settings()
    return {"message": "Mini settings reset to defaults", "success": True}

# ========== Debug Endpoint ==========
@router.get("/file-path")
async def get_settings_file_path():
    """Get the path to the settings file (for debugging)."""
    return {"path": mini_settings_service.get_settings_file_path()}