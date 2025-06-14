import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [input, setInput] = useState('');
  const [testCases, setTestCases] = useState([]);
  const [error, setError] = useState('');

  const generateTestCases = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/generate`, {
        user_message: input
      });
      setTestCases(response.data);
      setError('');
    } catch (error) {
      console.error('Error generating test cases:', error);
      if (error.response && error.response.status === 400) {
        setError(error.response.data.detail);
      } else {
        setError('Something went wrong. Please try again later.');
      }
    }
  };

  const resetForm = () => {
    setInput('');
    setError('');
    setTestCases([]);
  };

  return (
    <div className="App" style={{ padding: 20 }}>
      <h2>Smart AI Test Case Generator</h2>

      <textarea
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setError('');
        }}
        rows={6}
        cols={60}
        placeholder="Enter user story..."
      />
      <br />
      <button onClick={generateTestCases}>Generate</button>

      {error && (
        <>
          <div style={{ color: 'red', marginTop: 10 }}>{error}</div>
          <button
            onClick={resetForm}
            style={{
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              marginTop: 10,
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            Reset
          </button>
        </>
      )}

      <h3>Generated Test Cases:</h3>
      <ul>
        {testCases.map((tc, index) => (
          <li key={index}>
            <strong>{tc.title}</strong>
            <ul>
              {tc.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ul>
            <em>Expected: {tc.expectedResults.join(', ')}</em>
            <p>Priority: {tc.priority}</p>
            <p>Area Path: {tc.areaPath}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
