# # # settings_service.py (Updated - Simplified)
# # import json
# # import os
# # from pathlib import Path
# # from typing import Any, Dict
# # import logging

# # logger = logging.getLogger(__name__)

# # class MiniSettingsService:
# #     def __init__(self, app_name: str = "SchoolManagementApp"):
# #         """Initialize for mini settings only."""
# #         self.app_name = app_name
# #         self.settings_dir = self.get_settings_dir()
# #         self.settings_file = self.settings_dir / "mini_settings.json"
# #         self.ensure_settings_file()
    
# #     def get_settings_dir(self) -> Path:
# #         """Get the appropriate directory for storing settings."""
# #         # Get the user's home directory
# #         home = Path.home()
        
# #         # Platform-specific settings directories
# #         if os.name == 'nt':  # Windows
# #             app_data = os.getenv('APPDATA')
# #             if app_data:
# #                 return Path(app_data) / self.app_name
# #             else:
# #                 return home / "AppData" / "Roaming" / self.app_name
# #         else:  # Linux/Mac
# #             # Use .config directory for Linux/Mac
# #             config_home = os.getenv('XDG_CONFIG_HOME')
# #             if config_home:
# #                 return Path(config_home) / self.app_name
# #             else:
# #                 return home / ".config" / self.app_name
    
# #     def ensure_settings_file(self) -> None:
# #         """Create settings file if it doesn't exist with default mini settings."""
# #         try:
# #             # Create directory if it doesn't exist
# #             self.settings_dir.mkdir(parents=True, exist_ok=True)
            
# #             # Create default mini settings file if it doesn't exist
# #             if not self.settings_file.exists():
# #                 default_settings = {
# #                     "hasSeenMiniSettings": False,
# #                     "theme": "light",  # "light" or "dark"
# #                     "screensaver": False,
# #                     "schoolType": "SHS",  # "JHS", "SHS", "Basic School"
# #                     "lastUpdated": None,
# #                     "version": "1.0.0"
# #                 }
# #                 self.save_all_settings(default_settings)
# #                 logger.info(f"Created mini settings file at {self.settings_file}")
# #         except Exception as e:
# #             logger.error(f"Error creating mini settings file: {e}")
    
# #     def load_settings(self) -> Dict[str, Any]:
# #         """Load mini settings from the JSON file."""
# #         try:
# #             if self.settings_file.exists():
# #                 with open(self.settings_file, 'r', encoding='utf-8') as f:
# #                     return json.load(f)
# #             return self.get_default_settings()
# #         except json.JSONDecodeError:
# #             logger.error("Settings file is corrupted. Creating new one.")
# #             return self.get_default_settings()
# #         except Exception as e:
# #             logger.error(f"Error loading settings: {e}")
# #             return self.get_default_settings()
    
# #     def get_default_settings(self) -> Dict[str, Any]:
# #         """Get default mini settings."""
# #         return {
# #             "hasSeenMiniSettings": False,
# #             "theme": "light",
# #             "screensaver": False,
# #             "schoolType": "SHS",
# #             "lastUpdated": None,
# #             "version": "1.0.0"
# #         }
    
# #     def save_all_settings(self, settings: Dict[str, Any]) -> None:
# #         """Save complete settings dictionary to file."""
# #         try:
# #             # Add timestamp
# #             settings["lastUpdated"] = self.get_current_timestamp()
            
# #             with open(self.settings_file, 'w', encoding='utf-8') as f:
# #                 json.dump(settings, f, indent=2, ensure_ascii=False)
# #             logger.debug(f"Settings saved to {self.settings_file}")
# #         except Exception as e:
# #             logger.error(f"Error writing settings file: {e}")
    
# #     def get_current_timestamp(self) -> str:
# #         """Get current timestamp string."""
# #         from datetime import datetime
# #         return datetime.now().isoformat()
    
# #     # Specific mini settings methods
# #     def has_seen_mini_settings(self) -> bool:
# #         """Check if user has seen mini settings."""
# #         settings = self.load_settings()
# #         return settings.get("hasSeenMiniSettings", False)
    
# #     def set_seen_mini_settings(self, seen: bool = True) -> None:
# #         """Set that user has seen mini settings."""
# #         settings = self.load_settings()
# #         settings["hasSeenMiniSettings"] = seen
# #         self.save_all_settings(settings)
    
# #     def get_theme(self) -> str:
# #         """Get current theme."""
# #         settings = self.load_settings()
# #         return settings.get("theme", "light")
    
# #     def set_theme(self, theme: str) -> None:
# #         """Set theme ('light' or 'dark')."""
# #         if theme not in ["light", "dark"]:
# #             raise ValueError("Theme must be 'light' or 'dark'")
        
# #         settings = self.load_settings()
# #         settings["theme"] = theme
# #         self.save_all_settings(settings)
    
# #     def get_screensaver(self) -> bool:
# #         """Get screensaver setting."""
# #         settings = self.load_settings()
# #         return settings.get("screensaver", False)
    
# #     def set_screensaver(self, enabled: bool) -> None:
# #         """Set screensaver enabled/disabled."""
# #         settings = self.load_settings()
# #         settings["screensaver"] = enabled
# #         self.save_all_settings(settings)
    
# #     def get_school_type(self) -> str:
# #         """Get school type."""
# #         settings = self.load_settings()
# #         return settings.get("schoolType", "SHS")
    
# #     def set_school_type(self, school_type: str) -> None:
# #         """Set school type."""
# #         valid_types = ["JHS", "SHS", "Basic School"]
# #         if school_type not in valid_types:
# #             raise ValueError(f"School type must be one of: {valid_types}")
        
# #         settings = self.load_settings()
# #         settings["schoolType"] = school_type
# #         self.save_all_settings(settings)
    
# #     def get_all_mini_settings(self) -> Dict[str, Any]:
# #         """Get all mini settings."""
# #         return self.load_settings()
    
# #     def update_mini_settings(self, updates: Dict[str, Any]) -> None:
# #         """Update multiple mini settings at once."""
# #         settings = self.load_settings()
# #         settings.update(updates)
# #         self.save_all_settings(settings)
    
# #     def get_settings_file_path(self) -> str:
# #         """Get the path to the settings file."""
# #         return str(self.settings_file)
    
# #     def reset_mini_settings(self) -> None:
# #         """Reset mini settings to defaults."""
# #         default_settings = self.get_default_settings()
# #         self.save_all_settings(default_settings)

# # # Create a global instance
# # mini_settings_service = MiniSettingsService()






# # settings_service.py (Updated with new features)
# import json
# import os
# from pathlib import Path
# from typing import Any, Dict, List
# import logging

# logger = logging.getLogger(__name__)

# class MiniSettingsService:
#     def __init__(self, app_name: str = "SchoolManagementApp"):
#         """Initialize for mini settings only."""
#         self.app_name = app_name
#         self.settings_dir = self.get_settings_dir()
#         self.settings_file = self.settings_dir / "mini_settings.json"
#         self.ensure_settings_file()
    
#     def get_settings_dir(self) -> Path:
#         """Get the appropriate directory for storing settings."""
#         # Get the user's home directory
#         home = Path.home()
        
#         # Platform-specific settings directories
#         if os.name == 'nt':  # Windows
#             app_data = os.getenv('APPDATA')
#             if app_data:
#                 return Path(app_data) / self.app_name
#             else:
#                 return home / "AppData" / "Roaming" / self.app_name
#         else:  # Linux/Mac
#             # Use .config directory for Linux/Mac
#             config_home = os.getenv('XDG_CONFIG_HOME')
#             if config_home:
#                 return Path(config_home) / self.app_name
#             else:
#                 return home / ".config" / self.app_name
    
#     def ensure_settings_file(self) -> None:
#         """Create settings file if it doesn't exist with default mini settings."""
#         try:
#             # Create directory if it doesn't exist
#             self.settings_dir.mkdir(parents=True, exist_ok=True)
            
#             # Create default mini settings file if it doesn't exist
#             if not self.settings_file.exists():
#                 default_settings = self.get_default_settings()
#                 self.save_all_settings(default_settings)
#                 logger.info(f"Created mini settings file at {self.settings_file}")
#         except Exception as e:
#             logger.error(f"Error creating mini settings file: {e}")
    
#     def load_settings(self) -> Dict[str, Any]:
#         """Load mini settings from the JSON file."""
#         try:
#             if self.settings_file.exists():
#                 with open(self.settings_file, 'r', encoding='utf-8') as f:
#                     settings = json.load(f)
#                     # Migrate old settings format if needed
#                     return self.migrate_settings_if_needed(settings)
#             return self.get_default_settings()
#         except json.JSONDecodeError:
#             logger.error("Settings file is corrupted. Creating new one.")
#             return self.get_default_settings()
#         except Exception as e:
#             logger.error(f"Error loading settings: {e}")
#             return self.get_default_settings()
    
#     def migrate_settings_if_needed(self, settings: Dict[str, Any]) -> Dict[str, Any]:
#         """Migrate old settings format to new format."""
#         needs_save = False
        
#         # Check if old single schoolType exists and new schoolTypes doesn't
#         if "schoolType" in settings and "schoolTypes" not in settings:
#             # Convert old schoolType to new schoolTypes array
#             old_type = settings["schoolType"]
#             # Map old values to new format
#             type_mapping = {
#                 "JHS": "jhs",
#                 "SHS": "shs", 
#                 "Basic School": "primary"
#             }
#             new_type = type_mapping.get(old_type, old_type.lower())
#             settings["schoolTypes"] = [new_type]
#             needs_save = True
        
#         # Add default assessmentTypes if missing
#         if "assessmentTypes" not in settings:
#             settings["assessmentTypes"] = ["GPA"]
#             needs_save = True
        
#         # Add default loginConfigs if missing
#         if "loginConfigs" not in settings:
#             settings["loginConfigs"] = ["student", "teachers"]
#             needs_save = True
        
#         # Update version if needed
#         if settings.get("version") != "2.0.0":
#             settings["version"] = "2.0.0"
#             needs_save = True
        
#         # Save migrated settings if changes were made
#         if needs_save:
#             self.save_all_settings(settings)
#             logger.info("Migrated settings to new format")
        
#         return settings
    
#     def get_default_settings(self) -> Dict[str, Any]:
#         """Get default mini settings with all new fields."""
#         return {
#             "hasSeenMiniSettings": False,
#             "theme": "light",  # "light" or "dark"
#             "screensaver": False,
#             "schoolTypes": ["shs"],  # Array of school types (up to 4)
#             "assessmentTypes": ["GPA"],  # Array of assessment types (up to 2)
#             "loginConfigs": ["student", "teachers"],  # Array of login roles
#             "lastUpdated": None,
#             "version": "2.0.0"
#         }
    
#     def save_all_settings(self, settings: Dict[str, Any]) -> None:
#         """Save complete settings dictionary to file."""
#         try:
#             # Add timestamp
#             settings["lastUpdated"] = self.get_current_timestamp()
            
#             with open(self.settings_file, 'w', encoding='utf-8') as f:
#                 json.dump(settings, f, indent=2, ensure_ascii=False)
#             logger.debug(f"Settings saved to {self.settings_file}")
#         except Exception as e:
#             logger.error(f"Error writing settings file: {e}")
    
#     def get_current_timestamp(self) -> str:
#         """Get current timestamp string."""
#         from datetime import datetime
#         return datetime.now().isoformat()
    
#     # ========== LEGACY METHODS (for backward compatibility) ==========
#     def has_seen_mini_settings(self) -> bool:
#         """Check if user has seen mini settings."""
#         settings = self.load_settings()
#         return settings.get("hasSeenMiniSettings", False)
    
#     def set_seen_mini_settings(self, seen: bool = True) -> None:
#         """Set that user has seen mini settings."""
#         settings = self.load_settings()
#         settings["hasSeenMiniSettings"] = seen
#         self.save_all_settings(settings)
    
#     def get_theme(self) -> str:
#         """Get current theme."""
#         settings = self.load_settings()
#         return settings.get("theme", "light")
    
#     def set_theme(self, theme: str) -> None:
#         """Set theme ('light' or 'dark')."""
#         if theme not in ["light", "dark"]:
#             raise ValueError("Theme must be 'light' or 'dark'")
        
#         settings = self.load_settings()
#         settings["theme"] = theme
#         self.save_all_settings(settings)
    
#     def get_screensaver(self) -> bool:
#         """Get screensaver setting."""
#         settings = self.load_settings()
#         return settings.get("screensaver", False)
    
#     def set_screensaver(self, enabled: bool) -> None:
#         """Set screensaver enabled/disabled."""
#         settings = self.load_settings()
#         settings["screensaver"] = enabled
#         self.save_all_settings(settings)
    
#     def get_school_type(self) -> str:
#         """Legacy: Get first school type for backward compatibility."""
#         settings = self.load_settings()
#         school_types = settings.get("schoolTypes", ["shs"])
#         # Map back to old format for compatibility
#         type_mapping = {
#             "jhs": "JHS",
#             "shs": "SHS",
#             "primary": "Basic School",
#             "kindergarten": "Kindergarten",
#             "institute": "Institute"
#         }
#         first_type = school_types[0] if school_types else "shs"
#         return type_mapping.get(first_type, first_type.upper())
    
#     def set_school_type(self, school_type: str) -> None:
#         """Legacy: Set single school type (replaces array with single value)."""
#         valid_types = ["JHS", "SHS", "Basic School", "kindergarten", "primary", "jhs", "shs", "institute"]
#         if school_type not in valid_types:
#             raise ValueError(f"School type must be one of: {valid_types}")
        
#         # Map to new format
#         type_mapping = {
#             "JHS": "jhs",
#             "SHS": "shs",
#             "Basic School": "primary",
#             "Kindergarten": "kindergarten",
#             "Institute": "institute"
#         }
#         new_type = type_mapping.get(school_type, school_type.lower())
        
#         settings = self.load_settings()
#         settings["schoolTypes"] = [new_type]
#         self.save_all_settings(settings)
    
#     # ========== NEW METHODS ==========
#     def get_school_types(self) -> List[str]:
#         """Get selected school types as array."""
#         settings = self.load_settings()
#         return settings.get("schoolTypes", ["shs"])
    
#     def set_school_types(self, school_types: List[str]) -> None:
#         """Set school types array (max 4)."""
#         if len(school_types) > 4:
#             raise ValueError("Maximum 4 school types allowed")
        
#         valid_types = ["kindergarten", "primary", "jhs", "shs", "institute"]
#         for school_type in school_types:
#             if school_type.lower() not in valid_types:
#                 raise ValueError(f"Invalid school type: {school_type}. Must be one of: {valid_types}")
        
#         settings = self.load_settings()
#         # Normalize to lowercase
#         settings["schoolTypes"] = [t.lower() for t in school_types]
#         self.save_all_settings(settings)
    
#     def get_assessment_types(self) -> List[str]:
#         """Get selected assessment types as array."""
#         settings = self.load_settings()
#         return settings.get("assessmentTypes", ["GPA"])
    
#     def set_assessment_types(self, assessment_types: List[str]) -> None:
#         """Set assessment types array (max 2)."""
#         if len(assessment_types) > 2:
#             raise ValueError("Maximum 2 assessment types allowed")
        
#         valid_types = ["montessori", "international (ib/cambridge)", "gpa"]
#         normalized_types = []
#         for atype in assessment_types:
#             normalized = atype.lower()
#             if normalized not in valid_types:
#                 raise ValueError(f"Invalid assessment type: {atype}. Must be one of: montessori, international (IB/Cambridge), GPA")
#             # Store with proper capitalization
#             if normalized == "international (ib/cambridge)":
#                 normalized_types.append("international (IB/Cambridge)")
#             elif normalized == "montessori":
#                 normalized_types.append("montessori")
#             elif normalized == "gpa":
#                 normalized_types.append("GPA")
#             else:
#                 normalized_types.append(atype)
        
#         settings = self.load_settings()
#         settings["assessmentTypes"] = normalized_types
#         self.save_all_settings(settings)
    
#     def get_login_configs(self) -> List[str]:
#         """Get selected login configurations as array."""
#         settings = self.load_settings()
#         return settings.get("loginConfigs", ["student", "teachers"])
    
#     def set_login_configs(self, login_configs: List[str]) -> None:
#         """Set login configurations array."""
#         valid_roles = ["student", "teachers", "parent", "non-staff", "ta", "accountant"]
#         normalized_roles = []
#         for role in login_configs:
#             normalized = role.lower()
#             if normalized not in valid_roles:
#                 raise ValueError(f"Invalid login role: {role}. Must be one of: student, teachers, parent, non-staff, TA, accountant")
            
#             # Store with proper formatting
#             if normalized == "ta":
#                 normalized_roles.append("TA")
#             elif normalized == "non-staff":
#                 normalized_roles.append("non-staff")
#             else:
#                 normalized_roles.append(normalized)
        
#         settings = self.load_settings()
#         settings["loginConfigs"] = normalized_roles
#         self.save_all_settings(settings)
    
#     def get_all_mini_settings(self) -> Dict[str, Any]:
#         """Get all mini settings with all fields."""
#         return self.load_settings()
    
#     def update_mini_settings(self, updates: Dict[str, Any]) -> None:
#         """Update multiple mini settings at once."""
#         settings = self.load_settings()
        
#         # Handle special cases for array fields
#         if "schoolTypes" in updates:
#             self.set_school_types(updates["schoolTypes"])
#             del updates["schoolTypes"]
#         if "assessmentTypes" in updates:
#             self.set_assessment_types(updates["assessmentTypes"])
#             del updates["assessmentTypes"]
#         if "loginConfigs" in updates:
#             self.set_login_configs(updates["loginConfigs"])
#             del updates["loginConfigs"]
        
#         # Update remaining fields
#         settings.update(updates)
#         self.save_all_settings(settings)
    
#     def get_settings_file_path(self) -> str:
#         """Get the path to the settings file."""
#         return str(self.settings_file)
    
#     def reset_mini_settings(self) -> None:
#         """Reset mini settings to defaults with new fields."""
#         default_settings = self.get_default_settings()
#         self.save_all_settings(default_settings)
#         logger.info("Mini settings reset to defaults")

# # Create a global instance
# mini_settings_service = MiniSettingsService()









# settings_service.py (Fully Integrated)
import json
import os
from pathlib import Path
from typing import Any, Dict, List
import logging

logger = logging.getLogger(__name__)

class MiniSettingsService:
    def __init__(self, app_name: str = "SchoolManagementApp"):
        """Initialize for mini settings only."""
        self.app_name = app_name
        self.settings_dir = self.get_settings_dir()
        self.settings_file = self.settings_dir / "mini_settings.json"
        self.ensure_settings_file()
    
    def get_settings_dir(self) -> Path:
        """Get the appropriate directory for storing settings."""
        # Get the user's home directory
        home = Path.home()
        
        # Platform-specific settings directories
        if os.name == 'nt':  # Windows
            app_data = os.getenv('APPDATA')
            if app_data:
                return Path(app_data) / self.app_name
            else:
                return home / "AppData" / "Roaming" / self.app_name
        else:  # Linux/Mac
            # Use .config directory for Linux/Mac
            config_home = os.getenv('XDG_CONFIG_HOME')
            if config_home:
                return Path(config_home) / self.app_name
            else:
                return home / ".config" / self.app_name
    
    def ensure_settings_file(self) -> None:
        """Create settings file if it doesn't exist with default mini settings."""
        try:
            # Create directory if it doesn't exist
            self.settings_dir.mkdir(parents=True, exist_ok=True)
            
            # Create default mini settings file if it doesn't exist
            if not self.settings_file.exists():
                default_settings = self.get_default_settings()
                self.save_all_settings(default_settings)
                logger.info(f"Created mini settings file at {self.settings_file}")
        except Exception as e:
            logger.error(f"Error creating mini settings file: {e}")
    
    def load_settings(self) -> Dict[str, Any]:
        """Load mini settings from the JSON file."""
        try:
            if self.settings_file.exists():
                with open(self.settings_file, 'r', encoding='utf-8') as f:
                    settings = json.load(f)
                    # Migrate old settings format if needed
                    return self.migrate_settings_if_needed(settings)
            return self.get_default_settings()
        except json.JSONDecodeError:
            logger.error("Settings file is corrupted. Creating new one.")
            return self.get_default_settings()
        except Exception as e:
            logger.error(f"Error loading settings: {e}")
            return self.get_default_settings()
    
    def migrate_settings_if_needed(self, settings: Dict[str, Any]) -> Dict[str, Any]:
        """Migrate old settings format to new format."""
        needs_save = False
        
        # Check if old single schoolType exists and new schoolTypes doesn't
        if "schoolType" in settings and "schoolTypes" not in settings:
            # Convert old schoolType to new schoolTypes array
            old_type = settings["schoolType"]
            # Map old values to new format
            type_mapping = {
                "JHS": "jhs",
                "SHS": "shs", 
                "Basic School": "primary"
            }
            new_type = type_mapping.get(old_type, old_type.lower())
            settings["schoolTypes"] = [new_type]
            needs_save = True
        
        # Add default assessmentTypes if missing
        if "assessmentTypes" not in settings:
            settings["assessmentTypes"] = ["GPA"]
            needs_save = True
        
        # Add default loginConfigs if missing
        if "loginConfigs" not in settings:
            settings["loginConfigs"] = ["student", "teachers"]
            needs_save = True
        
        # Add peakMode if missing
        if "peakMode" not in settings:
            settings["peakMode"] = False
            needs_save = True
        
        # Update version if needed
        if settings.get("version") != "2.0.0":
            settings["version"] = "2.0.0"
            needs_save = True
        
        # Save migrated settings if changes were made
        if needs_save:
            self.save_all_settings(settings)
            logger.info("Migrated settings to new format")
        
        return settings
    
    def get_default_settings(self) -> Dict[str, Any]:
        """Get default mini settings with all new fields."""
        return {
            "hasSeenMiniSettings": False,
            "theme": "light",  # "light" or "dark"
            "screensaver": False,
            "peakMode": False,  # NEW: Peak mode setting
            "schoolTypes": ["shs"],  # Array of school types (up to 4)
            "assessmentTypes": ["GPA"],  # Array of assessment types (up to 2)
            "loginConfigs": ["student", "teachers"],  # Array of login roles
            "lastUpdated": None,
            "version": "2.0.0"
        }
    
    def save_all_settings(self, settings: Dict[str, Any]) -> None:
        """Save complete settings dictionary to file."""
        try:
            # Add timestamp
            settings["lastUpdated"] = self.get_current_timestamp()
            
            with open(self.settings_file, 'w', encoding='utf-8') as f:
                json.dump(settings, f, indent=2, ensure_ascii=False)
            logger.debug(f"Settings saved to {self.settings_file}")
        except Exception as e:
            logger.error(f"Error writing settings file: {e}")
    
    def get_current_timestamp(self) -> str:
        """Get current timestamp string."""
        from datetime import datetime
        return datetime.now().isoformat()
    
    # ========== LEGACY METHODS (for backward compatibility) ==========
    def has_seen_mini_settings(self) -> bool:
        """Check if user has seen mini settings."""
        settings = self.load_settings()
        return settings.get("hasSeenMiniSettings", False)
    
    def set_seen_mini_settings(self, seen: bool = True) -> None:
        """Set that user has seen mini settings."""
        settings = self.load_settings()
        settings["hasSeenMiniSettings"] = seen
        self.save_all_settings(settings)
    
    def get_theme(self) -> str:
        """Get current theme."""
        settings = self.load_settings()
        return settings.get("theme", "light")
    
    def set_theme(self, theme: str) -> None:
        """Set theme ('light' or 'dark')."""
        if theme not in ["light", "dark"]:
            raise ValueError("Theme must be 'light' or 'dark'")
        
        settings = self.load_settings()
        settings["theme"] = theme
        self.save_all_settings(settings)
    
    def get_screensaver(self) -> bool:
        """Get screensaver setting."""
        settings = self.load_settings()
        return settings.get("screensaver", False)
    
    def set_screensaver(self, enabled: bool) -> None:
        """Set screensaver enabled/disabled."""
        settings = self.load_settings()
        settings["screensaver"] = enabled
        self.save_all_settings(settings)
    
    def get_peak_mode(self) -> bool:
        """Get peak mode setting."""
        settings = self.load_settings()
        return settings.get("peakMode", False)
    
    def set_peak_mode(self, enabled: bool) -> None:
        """Set peak mode enabled/disabled."""
        settings = self.load_settings()
        settings["peakMode"] = enabled
        self.save_all_settings(settings)
    
    def get_school_type(self) -> str:
        """Legacy: Get first school type for backward compatibility."""
        settings = self.load_settings()
        school_types = settings.get("schoolTypes", ["shs"])
        # Map back to old format for compatibility
        type_mapping = {
            "jhs": "JHS",
            "shs": "SHS",
            "primary": "Basic School",
            "kindergarten": "Kindergarten",
            "institute": "Institute"
        }
        first_type = school_types[0] if school_types else "shs"
        return type_mapping.get(first_type, first_type.upper())
    
    def set_school_type(self, school_type: str) -> None:
        """Legacy: Set single school type (replaces array with single value)."""
        valid_types = ["JHS", "SHS", "Basic School", "kindergarten", "primary", "jhs", "shs", "institute"]
        if school_type not in valid_types:
            raise ValueError(f"School type must be one of: {valid_types}")
        
        # Map to new format
        type_mapping = {
            "JHS": "jhs",
            "SHS": "shs",
            "Basic School": "primary",
            "Kindergarten": "kindergarten",
            "Institute": "institute"
        }
        new_type = type_mapping.get(school_type, school_type.lower())
        
        settings = self.load_settings()
        settings["schoolTypes"] = [new_type]
        self.save_all_settings(settings)
    
    # ========== NEW METHODS ==========
    def get_school_types(self) -> List[str]:
        """Get selected school types as array."""
        settings = self.load_settings()
        return settings.get("schoolTypes", ["shs"])
    
    def set_school_types(self, school_types: List[str]) -> None:
        """Set school types array (max 4)."""
        if len(school_types) > 4:
            raise ValueError("Maximum 4 school types allowed")
        
        valid_types = ["kindergarten", "primary", "jhs", "shs", "institute"]
        for school_type in school_types:
            if school_type.lower() not in valid_types:
                raise ValueError(f"Invalid school type: {school_type}. Must be one of: {valid_types}")
        
        settings = self.load_settings()
        # Normalize to lowercase
        settings["schoolTypes"] = [t.lower() for t in school_types]
        self.save_all_settings(settings)
    
    def get_assessment_types(self) -> List[str]:
        """Get selected assessment types as array."""
        settings = self.load_settings()
        return settings.get("assessmentTypes", ["GPA"])
    
    def set_assessment_types(self, assessment_types: List[str]) -> None:
        """Set assessment types array (max 2)."""
        if len(assessment_types) > 2:
            raise ValueError("Maximum 2 assessment types allowed")
        
        valid_types = ["montessori", "international (ib/cambridge)", "gpa"]
        normalized_types = []
        for atype in assessment_types:
            normalized = atype.lower()
            if normalized not in valid_types:
                raise ValueError(f"Invalid assessment type: {atype}. Must be one of: montessori, international (IB/Cambridge), GPA")
            # Store with proper capitalization
            if normalized == "international (ib/cambridge)":
                normalized_types.append("international (IB/Cambridge)")
            elif normalized == "montessori":
                normalized_types.append("montessori")
            elif normalized == "gpa":
                normalized_types.append("GPA")
            else:
                normalized_types.append(atype)
        
        settings = self.load_settings()
        settings["assessmentTypes"] = normalized_types
        self.save_all_settings(settings)
    
    def get_login_configs(self) -> List[str]:
        """Get selected login configurations as array."""
        settings = self.load_settings()
        return settings.get("loginConfigs", ["student", "teachers"])
    
    def set_login_configs(self, login_configs: List[str]) -> None:
        """Set login configurations array."""
        valid_roles = ["student", "teachers", "parent", "non-staff", "ta", "accountant"]
        normalized_roles = []
        for role in login_configs:
            normalized = role.lower()
            if normalized not in valid_roles:
                raise ValueError(f"Invalid login role: {role}. Must be one of: student, teachers, parent, non-staff, TA, accountant")
            
            # Store with proper formatting
            if normalized == "ta":
                normalized_roles.append("TA")
            elif normalized == "non-staff":
                normalized_roles.append("non-staff")
            else:
                normalized_roles.append(normalized)
        
        settings = self.load_settings()
        settings["loginConfigs"] = normalized_roles
        self.save_all_settings(settings)
    
    def get_all_mini_settings(self) -> Dict[str, Any]:
        """Get all mini settings with all fields."""
        return self.load_settings()
    
    def update_mini_settings(self, updates: Dict[str, Any]) -> None:
        """Update multiple mini settings at once."""
        settings = self.load_settings()
        
        # Handle special cases for array fields
        if "schoolTypes" in updates:
            self.set_school_types(updates["schoolTypes"])
            del updates["schoolTypes"]
        if "assessmentTypes" in updates:
            self.set_assessment_types(updates["assessmentTypes"])
            del updates["assessmentTypes"]
        if "loginConfigs" in updates:
            self.set_login_configs(updates["loginConfigs"])
            del updates["loginConfigs"]
        
        # Handle peakMode
        if "peakMode" in updates:
            self.set_peak_mode(updates["peakMode"])
            del updates["peakMode"]
        
        # Update remaining fields
        settings.update(updates)
        self.save_all_settings(settings)
    
    def get_settings_file_path(self) -> str:
        """Get the path to the settings file."""
        return str(self.settings_file)
    
    def reset_mini_settings(self) -> None:
        """Reset mini settings to defaults with new fields."""
        default_settings = self.get_default_settings()
        self.save_all_settings(default_settings)
        logger.info("Mini settings reset to defaults")
    
    # ========== TRANSFORMATION METHODS FOR FRONTEND ==========
    def transform_login_configs_for_frontend(self, login_array: List[str] = None) -> Dict[str, bool]:
        """Transform login array to frontend object format."""
        if login_array is None:
            login_array = self.get_login_configs()
        
        return {
            "student": "student" in login_array,
            "teachers": "teachers" in login_array,
            "ta": "TA" in login_array or "ta" in login_array,
            "parent": "parent" in login_array,
            "nonStaff": "non-staff" in login_array,
            "accountant": "accountant" in login_array
        }
    
    def transform_school_types_for_frontend(self, school_array: List[str] = None) -> Dict[str, bool]:
        """Transform school types array to frontend object format."""
        if school_array is None:
            school_array = self.get_school_types()
        
        return {
            "kindergarten": "kindergarten" in school_array,
            "primary": "primary" in school_array,
            "jhs": "jhs" in school_array,
            "shs": "shs" in school_array,
            "institute": "institute" in school_array
        }
    
    def transform_assessment_types_for_frontend(self, assessment_array: List[str] = None) -> Dict[str, bool]:
        """Transform assessment types array to frontend object format."""
        if assessment_array is None:
            assessment_array = self.get_assessment_types()
        
        return {
            "montessori": "montessori" in assessment_array,
            "internationalIbCambridge": "international (IB/Cambridge)" in assessment_array,
            "gpa": "GPA" in assessment_array
        }
    
    def get_frontend_format(self) -> Dict[str, Any]:
        """Get all settings in frontend-friendly format."""
        settings = self.load_settings()
        
        return {
            "general": {
                "screensaver": settings.get("screensaver", False),
                "peakMode": settings.get("peakMode", False),
                "theme": settings.get("theme", "light")
            },
            "config": {
                "loginConfig": self.transform_login_configs_for_frontend(),
                "schoolTypes": self.transform_school_types_for_frontend(),
                "assessmentTypes": self.transform_assessment_types_for_frontend()
            },
            "system": {
                "lastUpdated": settings.get("lastUpdated"),
                "version": settings.get("version", "2.0.0")
            }
        }
    
    def update_from_frontend_general(self, general_data: Dict[str, Any]) -> None:
        """Update general settings from frontend format."""
        if "screensaver" in general_data:
            self.set_screensaver(general_data["screensaver"])
        if "peakMode" in general_data:
            self.set_peak_mode(general_data["peakMode"])
        if "theme" in general_data:
            self.set_theme(general_data["theme"])
    
    def update_from_frontend_login_config(self, login_data: Dict[str, bool]) -> None:
        """Update login config from frontend object format."""
        login_array = []
        if login_data.get("student"): login_array.append("student")
        if login_data.get("teachers"): login_array.append("teachers")
        if login_data.get("ta"): login_array.append("TA")
        if login_data.get("parent"): login_array.append("parent")
        if login_data.get("nonStaff"): login_array.append("non-staff")
        if login_data.get("accountant"): login_array.append("accountant")
        
        self.set_login_configs(login_array)
    
    def update_from_frontend_school_types(self, school_data: Dict[str, bool]) -> None:
        """Update school types from frontend object format."""
        school_array = []
        if school_data.get("kindergarten"): school_array.append("kindergarten")
        if school_data.get("primary"): school_array.append("primary")
        if school_data.get("jhs"): school_array.append("jhs")
        if school_data.get("shs"): school_array.append("shs")
        if school_data.get("institute"): school_array.append("institute")
        
        self.set_school_types(school_array)
    
    def update_from_frontend_assessment_types(self, assessment_data: Dict[str, bool]) -> None:
        """Update assessment types from frontend object format."""
        # Count selected
        selected_count = sum([
            assessment_data.get("montessori", False),
            assessment_data.get("internationalIbCambridge", False),
            assessment_data.get("gpa", False)
        ])
        
        if selected_count > 2:
            raise ValueError("Maximum 2 assessment types allowed")
        
        assessment_array = []
        if assessment_data.get("montessori"): assessment_array.append("montessori")
        if assessment_data.get("internationalIbCambridge"): assessment_array.append("international (IB/Cambridge)")
        if assessment_data.get("gpa"): assessment_array.append("GPA")
        
        self.set_assessment_types(assessment_array)

# Create a global instance
mini_settings_service = MiniSettingsService()