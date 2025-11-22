import os
import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import gridfs

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    try:
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code}")
        return response
    except Exception as e:
        logger.error(f"Request failed: {str(e)}")
        raise

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("MONGODB_URI environment variable is not set")

client = MongoClient(MONGODB_URI)
db = client["thestudentopinion"]
articles_collection = db["articles"]
fs = gridfs.GridFS(db)


def format_article(article):
    """Format article data for API response"""
    created_at = article.get("created_at")
    if isinstance(created_at, datetime):
        created_at_display = created_at.strftime("%b %d, %Y %H:%M UTC")
    else:
        created_at_display = str(created_at) if created_at else ""
    
    pdf_file_id = article.get("pdf_file_id")
    pdf_url = f"/api/pdf/{pdf_file_id}" if pdf_file_id else None
    
    return {
        "id": str(article.get("_id", "")),
        "title": article.get("title", ""),
        "author": article.get("author", ""),
        "abstract": article.get("abstract", ""),
        "approved": article.get("approved", False),
        "created_at": created_at.isoformat() if isinstance(created_at, datetime) else str(created_at),
        "created_at_display": created_at_display,
        "pdf_file_id": str(pdf_file_id) if pdf_file_id else None,
        "pdf_url": pdf_url
    }


@app.get("/")
def read_root():
    return {"message": "The Student Opinion API - use /articles to list articles"}


@app.get("/api/articles")
@app.get("/articles")
def get_articles():
    """Get all approved articles"""
    logger.info("Fetching articles from MongoDB")
    try:
        # Find all approved articles, sorted by creation date (newest first)
        articles = list(articles_collection.find(
            {"approved": True}
        ).sort("created_at", -1))
        
        logger.info(f"Found {len(articles)} approved articles")
        return [format_article(article) for article in articles]
    except Exception as e:
        logger.error(f"Database error in get_articles: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/pdf/{file_id}")
@app.get("/pdf/{file_id}")
def get_pdf(file_id: str):
    """Stream PDF file from GridFS"""
    logger.info(f"Fetching PDF with ID: {file_id}")
    try:
        # Convert string to ObjectId
        object_id = ObjectId(file_id)
        
        # Check if file exists
        if not fs.exists(object_id):
            logger.warning(f"PDF not found: {file_id}")
            raise HTTPException(status_code=404, detail="PDF not found")
        
        # Get the file from GridFS
        grid_out = fs.get(object_id)
        logger.info(f"Streaming PDF: {grid_out.filename}")
        
        # Stream the file
        return StreamingResponse(
            grid_out,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'inline; filename="{grid_out.filename or "article.pdf"}"'
            }
        )
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        logger.error(f"Error retrieving PDF {file_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving PDF: {str(e)}")


# Vercel serverless function handler
def handler(request):
    """Entry point for Vercel serverless functions"""
    return app(request)
