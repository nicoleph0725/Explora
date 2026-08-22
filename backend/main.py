import os
import sys
from pathlib import Path

# Ensure working directory is backend/ so uvicorn can find main:app from anywhere
backend_dir = Path(__file__).resolve().parent
os.chdir(backend_dir)
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from fastapi.concurrency import asynccontextmanager

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import models  # Must import models first so SQLModel registers tables into metadata
from database import init_db, engine
from auth.sign_up import router as auth_router
from journals import router as journals_router


origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("Database sync complete")

    yield

    engine.dispose()
    print("Shut down database sync")

app = FastAPI(lifespan=lifespan)
app.include_router(auth_router)
app.include_router(journals_router)    


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#example endpoint:
@app.get("/test/{item_id}/")
async def test(item_id: str):
    return {"hello": item_id}


if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

