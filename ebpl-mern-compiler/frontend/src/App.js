import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

function App() {
  return (
    <Router basename="/MSD-EBPL">
      <div className="App">
        <h1>EBPL Compiler</h1>
        {/* Add your components here */}
      </div>
    </Router>
  );
}

export default App;