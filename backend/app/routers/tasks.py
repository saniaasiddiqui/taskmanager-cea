from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import select

from app import models, schemas
from app.dependencies import CurrentUser, DbSession


router = APIRouter(prefix="/tasks", tags=["tasks"])


def owned_task_or_404(task_id: int, user_id: int, db: DbSession) -> models.Task:
    task = db.scalar(
        select(models.Task).where(
            models.Task.id == task_id, models.Task.owner_id == user_id
        )
    )
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("", response_model=list[schemas.TaskRead])
def list_tasks(db: DbSession, current_user: CurrentUser) -> list[models.Task]:
    return list(
        db.scalars(
            select(models.Task)
            .where(models.Task.owner_id == current_user.id)
            .order_by(models.Task.created_at.desc())
        )
    )


@router.get("/{task_id}", response_model=schemas.TaskRead)
def get_task(task_id: int, db: DbSession, current_user: CurrentUser) -> models.Task:
    return owned_task_or_404(task_id, current_user.id, db)


@router.post("", response_model=schemas.TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: schemas.TaskCreate, db: DbSession, current_user: CurrentUser
) -> models.Task:
    task = models.Task(**task_data.model_dump(), owner_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}", response_model=schemas.TaskRead)
def update_task(
    task_id: int,
    task_data: schemas.TaskUpdate,
    db: DbSession,
    current_user: CurrentUser,
) -> models.Task:
    task = owned_task_or_404(task_id, current_user.id, db)
    for field, value in task_data.model_dump().items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int, db: DbSession, current_user: CurrentUser
) -> Response:
    task = owned_task_or_404(task_id, current_user.id, db)
    db.delete(task)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
