import React, { useState } from 'react';
import { TextField, Button, Typography, Container } from '@material-ui/core';

function Login({ setIsAuthenticated }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('handleSubmit called');
    console.log('Login attempt with:', username, password);
    try {
      console.log('Sending request to:', 'http://localhost:8000/token');
      const response = await fetch('http://localhost:8000/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'username': username,
          'password': password,
        }),
      });
      console.log('Response received:', response);
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        console.log('Login successful, token:', data.access_token);
        localStorage.setItem('token', data.access_token);
        setIsAuthenticated(true);
      } else {
        console.error('Login failed:', responseText);
        setError(`Login failed: ${responseText}`);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError(`Network error: ${error.message}. Please check your connection and try again.`);
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4">Login</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          margin="normal"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" fullWidth variant="contained" color="primary">
          Login
        </Button>
      </form>
      {error && <Typography color="error">{error}</Typography>}
    </Container>
  );
}

export default Login;
