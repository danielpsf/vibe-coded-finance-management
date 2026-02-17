import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from logger import setup_logging, get_logger
from database import init_db
from routes import transactions, reports

# Setup logging
setup_logging(level=logging.INFO)
logger = get_logger(__name__)

app = FastAPI(
    title="Finance Manager API",
    description="API for managing personal finances",
    version="1.0.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Middleware to log all HTTP requests."""
    start_time = time.time()
    
    # Log request
    logger.info(
        f"Request: {request.method} {request.url.path} | "
        f"Client: {request.client.host if request.client else 'unknown'} | "
        f"User-Agent: {request.headers.get('user-agent', 'unknown')}"
    )
    logger.debug(f"Request headers: {dict(request.headers)}")
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log response
        logger.info(
            f"Response: {request.method} {request.url.path} | "
            f"Status: {response.status_code} | "
            f"Duration: {process_time:.3f}s"
        )
        logger.debug(f"Response headers: {dict(response.headers)}")
        
        return response
    except Exception as e:
        process_time = time.time() - start_time
        logger.error(
            f"Error: {request.method} {request.url.path} | "
            f"Duration: {process_time:.3f}s | "
            f"Error: {str(e)}",
            exc_info=True
        )
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )

# Initialize database
logger.info("Initializing database...")
init_db()
logger.info("Database initialized successfully")

# Include routers
logger.info("Registering API routes...")
app.include_router(transactions.router)
app.include_router(reports.router)
logger.info("API routes registered successfully")

@app.get("/")
def root():
    logger.debug("Root endpoint accessed")
    return {"message": "Finance Manager API is running"}

@app.get("/api/health")
def health_check():
    logger.debug("Health check endpoint accessed")
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Finance Manager API server...")
    # nosec B104: Binding to all interfaces is intentional for Docker containerization
    uvicorn.run(app, host="0.0.0.0", port=8000)