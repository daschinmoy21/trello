import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import {
  CssBaseline, AppBar, Toolbar, Typography, Button, Card, CardContent,
  TextField, Paper, IconButton, Drawer, List, ListItem, ListItemText, Switch, Box
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ChatIcon from '@mui/icons-material/Chat';
import io from 'socket.io-client';

// Styled components for consistent theming
const StyledPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : theme.palette.background.paper,
  width: 280,
  marginRight: theme.spacing(2),
  padding: theme.spacing(1),
  height: 'fit-content',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : theme.palette.background.default,
  marginBottom: theme.spacing(1),
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
  },
}));

const AddListPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : theme.palette.background.paper,
  width: 280,
  padding: theme.spacing(1),
  height: 'fit-content',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

// Initialize socket connection
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const socket = io(BACKEND_URL);

function Board() {
  // State management
  const [darkMode, setDarkMode] = useState(false);
  const [lists, setLists] = useState([]);
  const [newListTitle, setNewListTitle] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Create theme based on dark mode state
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: darkMode ? '#000' : '#f5f5f5',
        paper: darkMode ? '#1a1a1a' : '#fff',
      },
    },
  });

  // Fetch initial board data and set up socket listeners
  useEffect(() => {
    fetchBoardData();

    socket.on('updateBoard', (updatedLists) => {
      setLists(updatedLists);
    });

    socket.on('newChatMessage', (message) => {
      setChatMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up socket listeners on component unmount
    return () => {
      socket.off('updateBoard');
      socket.off('newChatMessage');
    };
  }, []);

  // Fetch board data from the backend
  const fetchBoardData = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/board`);
      if (response.ok) {
        const data = await response.json();
        setLists(data.lists);
      }
    } catch (error) {
      console.error('Error fetching board data:', error);
    }
  };

  // Handle drag and drop of lists and cards
  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const updatedLists = [...lists];

    if (result.type === 'LIST') {
      // Reorder lists
      const [movedList] = updatedLists.splice(source.index, 1);
      updatedLists.splice(destination.index, 0, movedList);
    } else {
      // Move card between lists
      const sourceList = updatedLists.find(list => list.list_id.toString() === source.droppableId);
      const destList = updatedLists.find(list => list.list_id.toString() === destination.droppableId);
      const [movedCard] = sourceList.cards.splice(source.index, 1);
      destList.cards.splice(destination.index, 0, movedCard);
    }

    setLists(updatedLists);
    updateBackend(updatedLists);
  };

  // Update backend with new board state
  const updateBackend = async (updatedLists) => {
    try {
      await fetch(`${BACKEND_URL}/api/board/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lists: updatedLists }),
      });
      socket.emit('updateBoard', updatedLists);
    } catch (error) {
      console.error('Error updating board:', error);
    }
  };

  // Add a new list
  const addList = () => {
    if (newListTitle.trim()) {
      const newList = {
        list_id: Date.now(),
        title: newListTitle,
        cards: [],
      };
      setLists([...lists, newList]);
      setNewListTitle('');
      updateBackend([...lists, newList]);
    }
  };

  // Handle Enter key press for adding a new list
  const handleNewListKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addList();
    }
  };

  // Add a new card to a list
  const addCard = (listId, cardTitle) => {
    if (cardTitle && cardTitle.trim()) {
      const updatedLists = lists.map(list => {
        if (list.list_id === listId) {
          return {
            ...list,
            cards: [...list.cards, { card_id: Date.now(), title: cardTitle }],
          };
        }
        return list;
      });
      setLists(updatedLists);
      updateBackend(updatedLists);
    }
  };

  // Delete a list
  const deleteList = (listId) => {
    const updatedLists = lists.filter(list => list.list_id !== listId);
    setLists(updatedLists);
    updateBackend(updatedLists);
  };

  // Delete a card from a list
  const deleteCard = (listId, cardId) => {
    const updatedLists = lists.map(list => {
      if (list.list_id === listId) {
        return {
          ...list,
          cards: list.cards.filter(card => card.card_id !== cardId),
        };
      }
      return list;
    });
    setLists(updatedLists);
    updateBackend(updatedLists);
  };

  // Send a chat message
  const sendChatMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = { id: Date.now(), text: newMessage, user: 'User' };
      setChatMessages([...chatMessages, message]);
      setNewMessage('');
      socket.emit('newChatMessage', message);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: theme.palette.background.default }}>
        {/* App Bar */}
        <AppBar position="static" sx={{ backgroundColor: theme.palette.mode === 'dark' ? '#000' : theme.palette.primary.main }}>
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>Project Alpha</Typography>
            <Typography variant="subtitle1" sx={{ marginRight: 2 }}>John Doe</Typography>
            <Switch
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              color="default"
            />
            <IconButton color="inherit" onClick={() => setIsChatOpen(!isChatOpen)}>
              <ChatIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Main Board Area */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="LIST" direction="horizontal">
            {(provided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  display: 'flex',
                  overflowX: 'auto',
                  padding: theme.spacing(3),
                  flexGrow: 1,
                  alignItems: 'flex-start',
                }}
              >
                {/* Render Lists */}
                {lists.map((list, listIndex) => (
                  <Draggable key={list.list_id} draggableId={list.list_id.toString()} index={listIndex}>
                    {(provided) => (
                      <StyledPaper
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Typography variant="h6" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          {list.title}
                          <IconButton size="small" onClick={() => deleteList(list.list_id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Typography>
                        {/* Droppable area for cards */}
                        <Droppable droppableId={list.list_id.toString()} type="CARD">
                          {(provided, snapshot) => (
                            <Box
                              {...provided.droppableProps} 
                              ref={provided.innerRef}
                              sx={{
                                minHeight: '50px',
                                backgroundColor: snapshot.isDraggingOver ? theme.palette.action.hover : 'transparent',
                                transition: 'background-color 0.2s ease',
                                padding: theme.spacing(1, 0),
                              }}
                            >
                              {/* Render Cards */}
                              {list.cards.map((card, cardIndex) => (
                                <Draggable key={card.card_id} draggableId={card.card_id.toString()} index={cardIndex}>
                                  {(provided) => (
                                    <StyledCard
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <CardContent>
                                        <Typography sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          {card.title}
                                          <IconButton size="small" onClick={() => deleteCard(list.list_id, card.card_id)}>
                                            <DeleteIcon />
                                          </IconButton>
                                        </Typography>
                                      </CardContent>
                                    </StyledCard>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </Box>
                          )}
                        </Droppable>
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          placeholder="Enter card title..."
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCard(list.list_id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          sx={{ marginTop: 1 }}
                        />
                      </StyledPaper>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                
                {/* Add New List */}
                <AddListPaper>
                  <TextField
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder="Enter list title..."
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    onKeyPress={handleNewListKeyPress}
                    sx={{ marginBottom: 1 }}
                  />
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addList}
                    variant="contained"
                    fullWidth
                  >
                    Add List
                  </Button>
                </AddListPaper>
              </Box>
            )}
          </Droppable>
        </DragDropContext>

        {/* Chat Drawer */}
        <Drawer anchor="right" open={isChatOpen} onClose={() => setIsChatOpen(false)}>
          <Box sx={{ width: 300, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
              {chatMessages.map((message) => (
                <ListItem key={message.id}>
                  <ListItemText primary={message.user} secondary={message.text} />
                </ListItem>
              ))}
            </List>
            <form onSubmit={sendChatMessage} style={{ padding: theme.spacing(2) }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                sx={{ marginBottom: 1 }}
              />
              <Button type="submit" fullWidth variant="contained" color="primary">
                Send
              </Button>
            </form>
          </Box>
        </Drawer>
      </div>
    </ThemeProvider>
  );
}

export default Board;