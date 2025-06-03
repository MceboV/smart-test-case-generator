import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [input, setInput] = useState('');
  const [testCases, setTestCases] = useState([]);

  const generateTestCases = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/generate`, {
        user_message: input
      });
      setTestCases(response.data);
    } catch (error) {
      console.error('Error generating test cases:', error);
    }
  };

  return (
    <div className="App" style={{ padding: 20 }}>
      <h2>Smart AI Test Case Generator</h2>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={6}
        cols={60}
        placeholder="Enter acceptance criteria..."
      />
      <br />
      <button onClick={generateTestCases}>Generate</button>

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
