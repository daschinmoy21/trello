-- Users table
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    profile_picture VARCHAR(255)
);

-- Boards table
CREATE TABLE boards (
    board_id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lists table
CREATE TABLE lists (
    list_id SERIAL PRIMARY KEY,
    board_id INTEGER REFERENCES boards(board_id),
    title VARCHAR(100) NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cards table
CREATE TABLE cards (
    card_id SERIAL PRIMARY KEY,
    list_id INTEGER REFERENCES lists(list_id),
    title VARCHAR(100) NOT NULL,
    description TEXT,
    position INTEGER NOT NULL,
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Board Members table
CREATE TABLE board_members (
    board_member_id SERIAL PRIMARY KEY,
    board_id INTEGER REFERENCES boards(board_id),
    user_id INTEGER REFERENCES users(user_id),
    role VARCHAR(50) NOT NULL,
    UNIQUE (board_id, user_id)
);

-- Card Comments table
CREATE TABLE card_comments (
    comment_id SERIAL PRIMARY KEY,
    card_id INTEGER REFERENCES cards(card_id),
    user_id INTEGER REFERENCES users(user_id),
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Board Chat Messages table
CREATE TABLE board_chat_messages (
    chat_message_id SERIAL PRIMARY KEY,
    board_id INTEGER REFERENCES boards(board_id),
    user_id INTEGER REFERENCES users(user_id),
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add default user (with hashed password)
INSERT INTO users (username, email, hashed_password) 
VALUES ('user', 'user@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW');
