# # settings_api.py
# from flask import Blueprint, request, jsonify
# from fastapi import APIRouter, HTTPException
# from flask_cors import cross_origin
# import logging
# from .settings_service import mini_settings_service

# logger = logging.getLogger(__name__)

# # Create blueprint
# settings_bp = APIRouter(prefix="/api/settings", tags=['settings'])


# @settings_bp.route('/all', methods=['GET'])
# @cross_origin()
# def get_all_settings():
#     """Get all settings including General and Configuration"""
#     try:
#         frontend_data = mini_settings_service.get_frontend_format()
        
#         return jsonify({
#             "success": True,
#             "data": frontend_data
#         }), 200
        
#     except Exception as e:
#         logger.error(f"Error loading settings: {e}")
#         return jsonify({"success": False, "error": str(e)}), 500

# @settings_bp.route('/general', methods=['GET'])
# @cross_origin()
# def get_general_settings():
#     """Get only General settings"""
#     try:
#         frontend_data = mini_settings_service.get_frontend_format()
        
#         return jsonify({
#             "success": True,
#             "data": frontend_data["general"]
#         }), 200
        
#     except Exception as e:
#         logger.error(f"Error loading general settings: {e}")
#         return jsonify({"success": False, "error": str(e)}), 500

# @settings_bp.route('/general', methods=['POST'])
# @cross_origin()
# def update_general_settings():
#     """Update General settings"""
#     try:
#         data = request.json
#         mini_settings_service.update_from_frontend_general(data)
        
#         return jsonify({
#             "success": True,
#             "message": "General settings updated successfully"
#         }), 200
        
#     except Exception as e:
#         logger.error(f"Error updating general settings: {e}")
#         return jsonify({"success": False, "error": str(e)}), 500

# @settings_bp.route('/config/login', methods=['GET'])
# @cross_origin()
# def get_login_config():
#     """Get login configuration"""
#     try:
#         login_config = mini_settings_service.transform_login_configs_for_frontend()
        
#         return jsonify({
#             "success": True,
#             "data": login_config
#         }), 200
        
#     except Exception as e:
#         logger.error(f"Error loading login config: {e}")
#         return jsonify({"success": False, "error": str(e)}), 500

# @settings_bp.route('/config/login', methods=['POST'])
# @cross_origin()
# def update_login_config():
#     """Update login configuration"""
#     try:
#         data = request.json
#         mini_settings_service.update_from_frontend_login_config(data)
        
#         return jsonify({
#             "success": True,
#             "message": "Login configuration updated successfully"
#         }), 200
        
#     except Exception as e:
#         logger.error(f"Error updating login config: {e}")
#         return jsonify({"success": False, "error": str(e)}), 500

# @settings_bp.route('/config/school-types', methods=['GET'])
# @cross_origin()
# def get_school_types():
#     """Get school types configuration"""
#     try:
#         school_types = mini_settings_service.transform_school_types_for_frontend()
        
#         return jsonify({
#             "success": True,
#             "data": school_types
#         }), 200
        
#     except Exception as e:
#         logger.error(f"Error loading school types: {e}")
#         return jsonify({"success": False, "error": str(e)}), 500

# @settings_bp.route('/config/school-types', methods=['POST'])
# @cross_origin()
# def update_school_types():
#     """Update school types configuration"""
#     try:
#         data = request.json
#         mini_settings_service.update_from_frontend_school_types(data)
        
#         return jsonify({
#             "success": True,
#             "message": "School types updated successfully"
#         }), 200
        
#     except Exception as e:
#         logger.error(f"Error updating school types: {e}")
#         return jsonify({"success": False, "error": str(e)}), 500

# @settings_bp.route('/config/assessment-types', methods=['GET'])
# @cross_origin()
# def get_assessment_types():
#     """Get assessment types configuration"""
#     try:
#         assessment_types = mini_settings_service.transform_assessment_types_for_frontend()
        
#         return jsonify({
#             "success": True,
#             "data": assessment_types
#         }), 200
        
#     except Exception as e:
#         logger.error(f"Error loading assessment types: {e}")
#         return jsonify({"success": False, "error": str(e)}), 500

# @settings_bp.route('/config/assessment-types', methods=['POST'])
# @cross_origin()
# def update_assessment_types():
#     """Update assessment types configuration (max 2)"""
#     try:
#         data = request.json
#         mini_settings_service.update_from_frontend_assessment_types(data)
        
#         return jsonify({
#             "success": True,
#             "message": "Assessment types updated successfully"
#         }), 200
        
#     except ValueError as e:
#         return jsonify({"success": False, "error": str(e)}), 400
#     except Exception as e:
#         logger.error(f"Error updating assessment types: {e}")
#         return jsonify({"success": False, "error": str(e)}), 500

# @settings_bp.route('/config/all', methods=['POST'])
# @cross_origin()
# def update_all_config():
#     """Update all configuration settings at once"""
#     try:
#         data = request.json
        
#         # Update login config
#         if 'loginConfig' in data:
#             mini_settings_service.update_from_frontend_login_config(data['loginConfig'])
        
#         # Update school types
#         if 'schoolTypes' in data:
#             mini_settings_service.update_from_frontend_school_types(data['schoolTypes'])
        
#         # Update assessment types
#         if 'assessmentTypes' in data:
#             mini_settings_service.update_from_frontend_assessment_types(data['assessmentTypes'])
        
#         return jsonify({
#             "success": True,
#             "message": "All configuration settings updated successfully"
#         }), 200
        
#     except ValueError as e:
#         return jsonify({"success": False, "error": str(e)}), 400
#     except Exception as e:
#         logger.error(f"Error updating all config: {e}")
#         return jsonify({"success": False, "error": str(e)}), 500

# @settings_bp.route('/reset', methods=['POST'])
# @cross_origin()
# def reset_settings():
#     """Reset all settings to defaults"""
#     try:
#         mini_settings_service.reset_mini_settings()
        
#         return jsonify({
#             "success": True,
#             "message": "All settings have been reset to defaults"
#         }), 200
        
#     except Exception as e:
#         logger.error(f"Error resetting settings: {e}")
#         return jsonify({"success": False, "error": str(e)}), 500

# settings_api.py - FASTAPI VERSION
from fastapi import APIRouter, HTTPException
# from fastapi.responses import JSONResponse
import logging
from .settings_service import mini_settings_service

logger = logging.getLogger(__name__)

# Create router
settings_router = APIRouter(prefix="/api/settings", tags=['settings'])

@settings_router.get('/all')
async def get_all_settings():
    """Get all settings including General and Configuration"""
    try:
        frontend_data = mini_settings_service.get_frontend_format()
        
        return {
            "success": True,
            "data": frontend_data
        }
        
    except Exception as e:
        logger.error(f"Error loading settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@settings_router.get('/general')
async def get_general_settings():
    """Get only General settings"""
    try:
        frontend_data = mini_settings_service.get_frontend_format()
        
        return {
            "success": True,
            "data": frontend_data["general"]
        }
        
    except Exception as e:
        logger.error(f"Error loading general settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@settings_router.post('/general')
async def update_general_settings(data: dict):
    """Update General settings"""
    try:
        mini_settings_service.update_from_frontend_general(data)
        
        return {
            "success": True,
            "message": "General settings updated successfully"
        }
        
    except Exception as e:
        logger.error(f"Error updating general settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@settings_router.get('/config/login')
async def get_login_config():
    """Get login configuration"""
    try:
        login_config = mini_settings_service.transform_login_configs_for_frontend()
        
        return {
            "success": True,
            "data": login_config
        }
        
    except Exception as e:
        logger.error(f"Error loading login config: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@settings_router.post('/config/login')
async def update_login_config(data: dict):
    """Update login configuration"""
    try:
        mini_settings_service.update_from_frontend_login_config(data)
        
        return {
            "success": True,
            "message": "Login configuration updated successfully"
        }
        
    except Exception as e:
        logger.error(f"Error updating login config: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@settings_router.get('/config/school-types')
async def get_school_types():
    """Get school types configuration"""
    try:
        school_types = mini_settings_service.transform_school_types_for_frontend()
        
        return {
            "success": True,
            "data": school_types
        }
        
    except Exception as e:
        logger.error(f"Error loading school types: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@settings_router.post('/config/school-types')
async def update_school_types(data: dict):
    """Update school types configuration"""
    try:
        mini_settings_service.update_from_frontend_school_types(data)
        
        return {
            "success": True,
            "message": "School types updated successfully"
        }
        
    except Exception as e:
        logger.error(f"Error updating school types: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@settings_router.get('/config/assessment-types')
async def get_assessment_types():
    """Get assessment types configuration"""
    try:
        assessment_types = mini_settings_service.transform_assessment_types_for_frontend()
        
        return {
            "success": True,
            "data": assessment_types
        }
        
    except Exception as e:
        logger.error(f"Error loading assessment types: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@settings_router.post('/config/assessment-types')
async def update_assessment_types(data: dict):
    """Update assessment types configuration (max 2)"""
    try:
        mini_settings_service.update_from_frontend_assessment_types(data)
        
        return {
            "success": True,
            "message": "Assessment types updated successfully"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating assessment types: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@settings_router.post('/config/all')
async def update_all_config(data: dict):
    """Update all configuration settings at once"""
    try:
        # Update login config
        if 'loginConfig' in data:
            mini_settings_service.update_from_frontend_login_config(data['loginConfig'])
        
        # Update school types
        if 'schoolTypes' in data:
            mini_settings_service.update_from_frontend_school_types(data['schoolTypes'])
        
        # Update assessment types
        if 'assessmentTypes' in data:
            mini_settings_service.update_from_frontend_assessment_types(data['assessmentTypes'])
        
        return {
            "success": True,
            "message": "All configuration settings updated successfully"
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error updating all config: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@settings_router.post('/reset')
async def reset_settings():
    """Reset all settings to defaults"""
    try:
        mini_settings_service.reset_mini_settings()
        
        return {
            "success": True,
            "message": "All settings have been reset to defaults"
        }
        
    except Exception as e:
        logger.error(f"Error resetting settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))