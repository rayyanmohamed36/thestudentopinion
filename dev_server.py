import sys
import os

# Add the parent directory to the path so we can import from api
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Import and run the FastAPI app
from api.index import app
import uvicorn

if __name__ == "__main__":
    print("🚀 Starting FastAPI server on http://localhost:8000")
    print("📖 API Documentation: http://localhost:8000/docs")
    print("📋 Articles endpoint: http://localhost:8000/api/articles")
    print("\nPress CTRL+C to stop the server\n")
    
    uvicorn.run("api.index:app", host="0.0.0.0", port=8000, reload=True)
