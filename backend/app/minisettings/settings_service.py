# settings_service.py (Updated - Simplified)
import json
import os
from pathlib import Path
from typing import Any, Dict
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
                default_settings = {
                    "hasSeenMiniSettings": False,
                    "theme": "light",  # "light" or "dark"
                    "screensaver": False,
                    "schoolType": "SHS",  # "JHS", "SHS", "Basic School"
                    "lastUpdated": None,
                    "version": "1.0.0"
                }
                self.save_all_settings(default_settings)
                logger.info(f"Created mini settings file at {self.settings_file}")
        except Exception as e:
            logger.error(f"Error creating mini settings file: {e}")
    
    def load_settings(self) -> Dict[str, Any]:
        """Load mini settings from the JSON file."""
        try:
            if self.settings_file.exists():
                with open(self.settings_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            return self.get_default_settings()
        except json.JSONDecodeError:
            logger.error("Settings file is corrupted. Creating new one.")
            return self.get_default_settings()
        except Exception as e:
            logger.error(f"Error loading settings: {e}")
            return self.get_default_settings()
    
    def get_default_settings(self) -> Dict[str, Any]:
        """Get default mini settings."""
        return {
            "hasSeenMiniSettings": False,
            "theme": "light",
            "screensaver": False,
            "schoolType": "SHS",
            "lastUpdated": None,
            "version": "1.0.0"
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
    
    # Specific mini settings methods
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
    
    def get_school_type(self) -> str:
        """Get school type."""
        settings = self.load_settings()
        return settings.get("schoolType", "SHS")
    
    def set_school_type(self, school_type: str) -> None:
        """Set school type."""
        valid_types = ["JHS", "SHS", "Basic School"]
        if school_type not in valid_types:
            raise ValueError(f"School type must be one of: {valid_types}")
        
        settings = self.load_settings()
        settings["schoolType"] = school_type
        self.save_all_settings(settings)
    
    def get_all_mini_settings(self) -> Dict[str, Any]:
        """Get all mini settings."""
        return self.load_settings()
    
    def update_mini_settings(self, updates: Dict[str, Any]) -> None:
        """Update multiple mini settings at once."""
        settings = self.load_settings()
        settings.update(updates)
        self.save_all_settings(settings)
    
    def get_settings_file_path(self) -> str:
        """Get the path to the settings file."""
        return str(self.settings_file)
    
    def reset_mini_settings(self) -> None:
        """Reset mini settings to defaults."""
        default_settings = self.get_default_settings()
        self.save_all_settings(default_settings)

# Create a global instance
mini_settings_service = MiniSettingsService()