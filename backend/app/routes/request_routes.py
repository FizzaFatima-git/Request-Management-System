
from pathlib import Path
from uuid import uuid4

from fastapi import (
    APIRouter, Depends, HTTPException,
    UploadFile, File, Form
)
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, ServiceRequest, RequestHistory
from app.schemas import (
    RequestResponse,
    RequestAssign,
    RequestStatusUpdate,
    RequestDecision,
    RequestHistoryResponse
)
from app.auth import get_current_user, require_roles


router = APIRouter(prefix="/requests", tags=["Requests"])

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_PRIORITIES = {"Low", "Medium", "High", "Critical"}
MAX_FILE_SIZE = 5 * 1024 * 1024


def add_history(
    db,
    request,
    actor,
    action,
    old_status=None,
    new_status=None,
    comment=None
):
    history = RequestHistory(
        request_id=request.id,
        actor_id=actor.user_id,
        action=action,
        old_status=old_status,
        new_status=new_status,
        comment=comment
    )
    db.add(history)


# EMPLOYEE: CREATE REQUEST

@router.post("/", response_model=RequestResponse, status_code=201)
async def create_request(
    category: str = Form(...),
    priority: str = Form(...),
    description: str = Form(...),
    attachment: UploadFile | None = File(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not category.strip():
        raise HTTPException(400, "Category is required")

    if not description.strip():
        raise HTTPException(400, "Description is required")

    if priority not in ALLOWED_PRIORITIES:
        raise HTTPException(
            400,
            "Priority must be Low, Medium, High or Critical"
        )

    attachment_path = None

    if attachment and attachment.filename:
        content = await attachment.read()

        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                400,
                "Attachment must be 5 MB or smaller"
            )

        extension = Path(attachment.filename).suffix.lower()
        saved_name = f"{uuid4().hex}{extension}"

        destination = UPLOAD_DIR / saved_name
        destination.write_bytes(content)

        attachment_path = f"/uploads/{saved_name}"

    request_code = f"REQ-{uuid4().hex[:10].upper()}"

    new_request = ServiceRequest(
        request_code=request_code,
        user_id=current_user.user_id,
        category=category.strip(),
        priority=priority,
        description=description.strip(),
        attachment_path=attachment_path,
        status="Pending"
    )

    db.add(new_request)
    db.flush()

    add_history(
        db,
        new_request,
        current_user,
        "Request created",
        new_status="Pending"
    )

    db.commit()
    db.refresh(new_request)

    return new_request


# EMPLOYEE: VIEW OWN REQUESTS

@router.get("/", response_model=list[RequestResponse])
def get_my_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return (
        db.query(ServiceRequest)
        .filter(ServiceRequest.user_id == current_user.user_id)
        .order_by(ServiceRequest.id.desc())
        .all()
    )


# ADMIN: VIEW ALL REQUESTS

@router.get("/admin/all", response_model=list[RequestResponse])
def get_all_requests(
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("Admin"))
):
    return (
        db.query(ServiceRequest)
        .order_by(ServiceRequest.id.desc())
        .all()
    )


# SUPPORT STAFF: VIEW ASSIGNED REQUESTS

@router.get("/support/assigned", response_model=list[RequestResponse])
def get_assigned_requests(
    db: Session = Depends(get_db),
    staff: User = Depends(require_roles("Support Staff"))
):
    return (
        db.query(ServiceRequest)
        .filter(ServiceRequest.assigned_to == staff.user_id)
        .order_by(ServiceRequest.id.desc())
        .all()
    )


# ADMIN: ASSIGN REQUEST TO SUPPORT STAFF

@router.post("/{request_id}/assign", response_model=RequestResponse)
def assign_request(
    request_id: int,
    data: RequestAssign,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("Admin"))
):
    request = db.query(ServiceRequest).filter(
        ServiceRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(404, "Request not found")

    staff = db.query(User).filter(
        User.user_id == data.support_staff_id,
        User.role == "Support Staff"
    ).first()

    if not staff:
        raise HTTPException(
            404,
            "Support Staff account not found"
        )

    if request.status in {"Approved", "Rejected", "Resolved"}:
        raise HTTPException(
            400,
            "This request can no longer be assigned"
        )

    old_status = request.status
    request.assigned_to = staff.user_id
    request.status = "Assigned"

    add_history(
        db,
        request,
        admin,
        f"Assigned to {staff.full_name}",
        old_status=old_status,
        new_status="Assigned"
    )

    db.commit()
    db.refresh(request)

    return request


# SUPPORT STAFF: UPDATE REQUEST PROGRESS

@router.patch("/{request_id}/status", response_model=RequestResponse)
def update_request_status(
    request_id: int,
    data: RequestStatusUpdate,
    db: Session = Depends(get_db),
    staff: User = Depends(require_roles("Support Staff"))
):
    request = db.query(ServiceRequest).filter(
        ServiceRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(404, "Request not found")

    if request.assigned_to != staff.user_id:
        raise HTTPException(
            403,
            "This request is not assigned to you"
        )

    if request.status not in {"Assigned", "In Progress"}:
        raise HTTPException(
            400,
            "This request cannot be updated in its current status"
        )

    old_status = request.status
    request.status = data.status

    add_history(
        db,
        request,
        staff,
        f"Status changed to {data.status}",
        old_status=old_status,
        new_status=data.status,
        comment=data.comment
    )

    db.commit()
    db.refresh(request)

    return request


# ADMIN: APPROVE OR REJECT REQUEST

@router.patch("/{request_id}/decision", response_model=RequestResponse)
def decide_request(
    request_id: int,
    data: RequestDecision,
    db: Session = Depends(get_db),
    admin: User = Depends(require_roles("Admin"))
):
    request = db.query(ServiceRequest).filter(
        ServiceRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(404, "Request not found")

    if request.status in {"Approved", "Rejected"}:
        raise HTTPException(
            400,
            "A final decision has already been made"
        )

    if data.decision == "Approved" and request.status != "Resolved":
        raise HTTPException(
            400,
            "Only resolved requests can be approved"
        )

    old_status = request.status
    request.status = data.decision

    add_history(
        db,
        request,
        admin,
        f"Request {data.decision.lower()}",
        old_status=old_status,
        new_status=data.decision,
        comment=data.comment
    )

    db.commit()
    db.refresh(request)

    return request


# EMPLOYEE / ADMIN / ASSIGNED STAFF: VIEW REQUEST HISTORY

@router.get(
    "/{request_id}/history",
    response_model=list[RequestHistoryResponse]
)
def get_request_history(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    request = db.query(ServiceRequest).filter(
        ServiceRequest.id == request_id
    ).first()

    if not request:
        raise HTTPException(404, "Request not found")

    is_owner = request.user_id == current_user.user_id
    is_admin = current_user.role == "Admin"
    is_assigned_staff = request.assigned_to == current_user.user_id

    if not (is_owner or is_admin or is_assigned_staff):
        raise HTTPException(
            403,
            "You do not have permission to view this request history"
        )

    return (
        db.query(RequestHistory)
        .filter(RequestHistory.request_id == request_id)
        .order_by(RequestHistory.id.asc())
        .all()
    )
