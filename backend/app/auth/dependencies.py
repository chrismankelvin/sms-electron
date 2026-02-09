
# // ---------------- CHATGPT ----------------
# // ---------------- CHATGPT ----------------
# // ---------------- CHATGPT ----------------
# // ---------------- CHATGPT ----------------
# // ---------------- CHATGPT ----------------
# from fastapi import Cookie, HTTPException, status, Depends
# from typing import Optional
# from .auth_service import get_user_from_session
# from .models import Role


# def require_authenticated_user(
#     session_id: Optional[str] = Cookie(default=None)
# ):
#     if not session_id:
#         raise HTTPException(status_code=401, detail="Not authenticated")

#     user = get_user_from_session(session_id)
#     if not user:
#         raise HTTPException(status_code=401, detail="Invalid session")

#     return user


# def require_roles(*allowed_roles: Role):
#     def checker(user=Depends(require_authenticated_user)):
#         if user.role not in allowed_roles:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="Insufficient permissions"
#             )
#         return user

#     return checker





# // ---------------- DEEPSEEK ----------------
# // ---------------- DEEPSEEK ----------------
# // ---------------- DEEPSEEK ----------------
# // ---------------- DEEPSEEK ----------------

from fastapi import Depends, HTTPException, Request
from .auth_service import get_user_from_session

def require_authenticated_user(request: Request):
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    user = get_user_from_session(session_id)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    return user