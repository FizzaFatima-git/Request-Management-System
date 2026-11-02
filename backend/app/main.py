
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app import models
from app.routes import auth_routes, request_routes


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Request Management System",
    description="RMS API - User Authentication and Request Management",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(request_routes.router)

app.mount(
    "/uploads",
    StaticFiles(directory=request_routes.UPLOAD_DIR),
    name="uploads"
)


@app.get("/")
def home():
    return {
        "message": "Request Management System API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }
