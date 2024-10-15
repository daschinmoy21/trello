from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from pydantic import BaseModel
from typing import List as TypeList  # Rename to avoid conflict
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
import socketio
import os

# Database connection
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:demos@localhost/trello_test")
engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI()

# Database models
class Board(Base):
    __tablename__ = "boards"
    board_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    lists = relationship("List", back_populates="board")

class List(Base):
    __tablename__ = "lists"
    list_id = Column(Integer, primary_key=True, index=True)
    board_id = Column(Integer, ForeignKey("boards.board_id"))
    title = Column(String, index=True)
    position = Column(Integer)
    board = relationship("Board", back_populates="lists")
    cards = relationship("Card", back_populates="list")

class Card(Base):
    __tablename__ = "cards"
    card_id = Column(Integer, primary_key=True, index=True)
    list_id = Column(Integer, ForeignKey("lists.list_id"))
    title = Column(String, index=True)
    description = Column(String)
    position = Column(Integer)
    list = relationship("List", back_populates="cards")

# Create tables
Base.metadata.create_all(bind=engine)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a Socket.IO server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
socket_app = socketio.ASGIApp(sio, app)

# Pydantic models for Board, List, and Card
class CardSchema(BaseModel):
    card_id: int
    title: str
    description: str
    position: int

class ListSchema(BaseModel):
    list_id: int
    title: str
    position: int
    cards: TypeList[CardSchema]  # Use TypeList instead of List

class BoardSchema(BaseModel):
    board_id: int
    title: str
    lists: TypeList[ListSchema]  # Use TypeList instead of List

# Helper function
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API routes
@app.get("/api/board", response_model=BoardSchema)
async def get_board(db: SessionLocal = Depends(get_db)):
    board = db.query(Board).first()
    if not board:
        board = Board(title="My First Board")
        db.add(board)
        db.commit()
        db.refresh(board)
    return board

@app.post("/api/board/update")
async def update_board(board: BoardSchema, db: SessionLocal = Depends(get_db)):
    db_board = db.query(Board).first()
    if not db_board:
        raise HTTPException(status_code=404, detail="Board not found")
    
    for list_data in board.lists:
        db_list = db.query(List).filter(List.list_id == list_data.list_id).first()
        if not db_list:
            db_list = List(board_id=db_board.board_id, title=list_data.title, position=list_data.position)
            db.add(db_list)
        else:
            db_list.title = list_data.title
            db_list.position = list_data.position
        
        for card_data in list_data.cards:
            db_card = db.query(Card).filter(Card.card_id == card_data.card_id).first()
            if not db_card:
                db_card = Card(list_id=db_list.list_id, title=card_data.title, description=card_data.description, position=card_data.position)
                db.add(db_card)
            else:
                db_card.title = card_data.title
                db_card.description = card_data.description
                db_card.position = card_data.position
                db_card.list_id = db_list.list_id
    
    db.commit()
    await sio.emit('updateBoard', board.dict())
    return {"message": "Board updated successfully"}

# Socket.IO event handlers
@sio.on('connect')
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.on('disconnect')
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.on('updateBoard')
async def update_board_socket(sid, data):
    await sio.emit('updateBoard', data, skip_sid=sid)

@sio.on('newChatMessage')
async def new_chat_message(sid, data):
    await sio.emit('newChatMessage', data, skip_sid=sid)

# Update the main FastAPI app to use the Socket.IO app
app = socketio.ASGIApp(sio, app)
