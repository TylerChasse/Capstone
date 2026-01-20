"""
Run the FastAPI backend server.
Usage: python run_api.py
"""

import uvicorn
from backend.api import app

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
