from fastapi.concurrency import asynccontextmanager
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, engine
import models


origins = [
    "http://localhost:5173"
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("Database sync complete")

    yield

    engine.dispose()
    print("Shut down database sync")

app = FastAPI(lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
