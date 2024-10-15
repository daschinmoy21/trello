import React from 'react';
import Board from './components/Board';  // Adjust the import path as necessary

function App() {
  console.log("App component rendered");
  return (
    <div className="App">
      <h1>Trello Clone</h1>
      {Board ? <Board /> : <p>Board component not found</p>}
    </div>
  );
}

export default App;
