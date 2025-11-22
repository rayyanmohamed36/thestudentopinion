import os
import logging
from datetime import datetime

import gridfs
from bson import ObjectId
from bson.errors import InvalidId
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from gridfs.errors import NoFile
from pymongo import MongoClient

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

MONGODB_DB_NAME = os.getenv("MONGODB_DB_NAME", "journal")
MONGODB_COLLECTION_NAME = os.getenv("MONGODB_COLLECTION_NAME", "articles")
GRIDFS_BUCKET_NAME = os.getenv("GRIDFS_BUCKET_NAME", "article_pdfs")
logger.info(
    "Connecting to MongoDB database '%s' collection '%s'",
    MONGODB_DB_NAME,
    MONGODB_COLLECTION_NAME,
)

client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB_NAME]
articles_collection = db[MONGODB_COLLECTION_NAME]
gridfs_bucket = gridfs.GridFSBucket(db, bucket_name=GRIDFS_BUCKET_NAME)


def parse_object_id(identifier: str) -> ObjectId:
    try:
        return ObjectId(identifier)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=404, detail="Invalid PDF identifier.")


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
    object_id = parse_object_id(file_id)

    try:
        grid_out = gridfs_bucket.open_download_stream(object_id)
    except NoFile:
        logger.warning(f"PDF not found: {file_id}")
        raise HTTPException(status_code=404, detail="PDF not found")
    except Exception as exc:
        logger.error(f"Unexpected GridFS error for {file_id}: {exc}")
        raise HTTPException(status_code=500, detail="Error retrieving PDF.")

    logger.info(f"Streaming PDF: {grid_out.filename}")
    headers = {"Content-Disposition": f'inline; filename="{grid_out.filename or "article.pdf"}"'}
    return StreamingResponse(grid_out, media_type="application/pdf", headers=headers)
