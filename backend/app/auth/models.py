# # from pydantic import BaseModel, Field
# # from enum import Enum
# # from datetime import datetime
# # from typing import Literal


# # class Role(str, Enum):
# #     SUPER_ADMIN = "SUPER_ADMIN"
# #     ADMIN = "ADMIN"
# #     STAFF = "STAFF"
# #     STUDENT = "STUDENT"


# # class User(BaseModel):
# #     id: int
# #     username: str
# #     password_hash: str
# #     role: Role
# #     status: Literal["active", "inactive", "suspended", "pending"] = "active"
# #     created_at: datetime

# #     @property
# #     def is_active(self) -> bool:
# #         return self.status == "active"


# # class UserPublic(BaseModel):
# #     id: int
# #     username: str
# #     role: Role
# #     status: str  # or keep as Literal if you want strict typing

# # app/models.py - Fix the UserPublic model
# from pydantic import BaseModel
# from enum import Enum
# from datetime import datetime
# from typing import Optional


# class Role(str, Enum):
#     SUPER_ADMIN = "SUPER_ADMIN"
#     ADMIN = "ADMIN"
#     STAFF = "STAFF"
#     STUDENT = "STUDENT"


# class UserStatus(str, Enum):
#     ACTIVE = "active"
#     INACTIVE = "inactive"
#     SUSPENDED = "suspended"
#     PENDING = "pending"


# class User(BaseModel):
#     id: int
#     username: str
#     password_hash: str
#     role: Role
#     status: UserStatus = UserStatus.ACTIVE  # Changed from is_active to status
#     created_at: datetime

#     # Optional: Keep a computed property for backward compatibility
#     @property
#     def is_active(self) -> bool:
#         """Returns True if the user has an active status."""
#         return self.status == UserStatus.ACTIVE


# class UserPublic(BaseModel):
#     id: int
#     username: str
#     role: Role
#     # REMOVE status field from UserPublic if you don't want to expose it
#     # Or make it optional if you want to include it sometimes
#     status: Optional[UserStatus] = None  # Make it optional


# # Alternative: If you want a simpler public model without status
# class UserSimplePublic(BaseModel):
#     id: int
#     username: str
#     role: Role
#     # Status is excluded from this public view


# app/auth/models.py
from pydantic import BaseModel
from enum import Enum
from datetime import datetime
from typing import Optional


class Role(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    STAFF = "STAFF"
    STUDENT = "STUDENT"


class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING = "pending"


class User(BaseModel):
    id: int
    username: str
    password_hash: str
    role: Role
    status: UserStatus = UserStatus.ACTIVE
    created_at: datetime

    @property
    def is_active(self) -> bool:
        return self.status == UserStatus.ACTIVE


class UserPublic(BaseModel):
    id: int
    username: str
    role: Role
    status: Optional[UserStatus] = None  # Make it optional


# OR if you want a simpler version without status:
class UserSimplePublic(BaseModel):
    id: int
    username: str
    role: Role
    # No status field