# // ---------------- CHATGPT ----------------
# // ---------------- CHATGPT ----------------
# // ---------------- CHATGPT ----------------
# // ---------------- CHATGPT ----------------
# // ---------------- CHATGPT ----------------


# from fastapi import APIRouter, HTTPException, Response, Depends
# from pydantic import BaseModel
# from .auth_service import (
#     authenticate_user,
#     create_session,
#     clear_session,
#     bootstrap_super_admin
# )
# from .dependencies import require_authenticated_user
# from .models import UserPublic

# router = APIRouter(prefix="/auth", tags=["Auth"])


# class LoginRequest(BaseModel):
#     username: str
#     password: str


# class BootstrapRequest(BaseModel):
#     username: str
#     password: str


# @router.post("/bootstrap")
# def bootstrap(data: BootstrapRequest):
#     try:
#         user = bootstrap_super_admin(data.username, data.password)
#     except RuntimeError:
#         raise HTTPException(status_code=400, detail="Already initialized")

#     return {
#         "user": UserPublic(
#             id=user.id,
#             username=user.username,
#             role=user.role
#         )
#     }


# @router.post("/login")
# def login(data: LoginRequest, response: Response):
#     user = authenticate_user(data.username, data.password)
#     if not user:
#         raise HTTPException(status_code=401, detail="Invalid credentials")

#     session_id = create_session(user.id)
#     response.set_cookie("session_id", session_id, httponly=True)

#     return {
#         "user": UserPublic(
#             id=user.id,
#             username=user.username,
#             role=user.role
#         )
#     }


# @router.get("/session")
# def session(user=Depends(require_authenticated_user)):
#     return {
#         "user": UserPublic(
#             id=user.id,
#             username=user.username,
#             role=user.role
#         )
#     }


# @router.post("/logout")
# def logout(response: Response, session_id: str | None = None):
#     if session_id:
#         clear_session(session_id)
#     response.delete_cookie("session_id")
#     return {"success": True}





# // ---------------- DEEPSEEK ----------------
# // ---------------- DEEPSEEK ----------------
# // ---------------- DEEPSEEK ----------------
# // ---------------- DEEPSEEK ----------------


# app/auth/routes.py
from fastapi import APIRouter, HTTPException, Response, Depends, Request
from pydantic import BaseModel
from typing import Optional

# Import the service functions directly
from .auth_service import (
    authenticate_user,
    create_session,
    clear_session,
    bootstrap_super_admin,
    get_user_from_session
)
from .dependencies import require_authenticated_user

router = APIRouter(prefix="/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    username: str
    password: str
    role: Optional[str] = None


class BootstrapRequest(BaseModel):
    username: str
    password: str


# Define the response models here to avoid circular imports
class UserPublicResponse(BaseModel):
    id: int
    username: str
    role: str
    status: Optional[str] = None


class LoginResponse(BaseModel):
    user: UserPublicResponse


@router.post("/bootstrap")
def bootstrap(data: BootstrapRequest):
    try:
        user = bootstrap_super_admin(data.username, data.password)
    except RuntimeError:
        raise HTTPException(status_code=400, detail="Already initialized")

    return LoginResponse(
        user=UserPublicResponse(
            id=user.id,
            username=user.username,
            role=user.role.value,  # Convert enum to string
            status=user.status.value if hasattr(user, 'status') else None
        )
    )


@router.post("/login")
def login(data: LoginRequest, response: Response):
    user = authenticate_user(data.username, data.password, data.role)
    
    if not user:
        raise HTTPException(
            status_code=401, 
            detail="Invalid credentials or role mismatch"
        )

    session_id = create_session(user.id)
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        max_age=86400
    )

    return LoginResponse(
        user=UserPublicResponse(
            id=user.id,
            username=user.username,
            role=user.role.value,
            status=user.status.value if hasattr(user, 'status') else None
        )
    )


@router.get("/session")
def session(user=Depends(require_authenticated_user)):
    return LoginResponse(
        user=UserPublicResponse(
            id=user.id,
            username=user.username,
            role=user.role.value,
            status=user.status.value if hasattr(user, 'status') else None
        )
    )


@router.post("/logout")
def logout(request: Request, response: Response):
    session_id = request.cookies.get("session_id")
    
    if session_id:
        clear_session(session_id)
    
    response.delete_cookie("session_id")
    return {"success": True}