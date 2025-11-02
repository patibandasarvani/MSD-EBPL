import React, { useEffect, useState } from 'react';
import api from './api';

function App() {
  const [status, setStatus] = useState('Checking...');
  const [error, setError] = useState(null);

  useEffect(() => {
    api.health()
      .then((data) => setStatus(`${data.status}: ${data.message}`))
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <h1>EBPL Compiler</h1>
      <p><strong>Backend health</strong>: {error ? `Error - ${error}` : status}</p>
    </div>
  );
}

export default App;
