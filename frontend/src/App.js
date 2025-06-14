import React, { useState, useRef } from 'react';
import axios from 'axios';

function App() {
  const [input, setInput] = useState('');
  const [testCases, setTestCases] = useState([]);
  const [error, setError] = useState('');
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null); // Create a ref for the file input

  const generateTestCases = async () => {
    if (!input) {
      setError('Please enter a user story');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('user_story', input);
      if (image) {
        formData.append('screenshot', image);
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/generate-with-image`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      setTestCases(response.data.response || []);
    } catch (error) {
      console.error('Error generating test cases:', error);
      if (error.response && error.response.status === 400) {
        setError(error.response.data.error || 'Invalid input');
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setInput('');
    setError('');
    setTestCases([]);
    setImage(null);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        placeholder="Enter user story (must start with 'As a...')"
      />
      <br />
      
      <div style={{ margin: '10px 0' }}>
        <label htmlFor="screenshot-upload" style={{ marginRight: '10px' }}>
          Upload System Screenshot for the tool to learn (optional):
        </label>
        <input
          id="screenshot-upload"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          ref={fileInputRef} // Attach the ref to the file input
        />
      </div>
      
      <button 
        onClick={generateTestCases} 
        disabled={isLoading}
      >
        {isLoading ? 'Generating...' : 'Generate'}
      </button>
      <button 
        onClick={resetForm}
        style={{ marginLeft: '10px' }}
      >
        Reset
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: 10 }}>{error}</div>
      )}

      <h3>Generated Test Cases:</h3>
      {testCases.length > 0 ? (
        <ul>
          {Array.isArray(testCases) ? (
            testCases.map((tc, index) => (
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
            ))
          ) : (
            <div style={{ whiteSpace: 'pre-line' }}>{testCases}</div>
          )}
        </ul>
      ) : (
        <p>No test cases generated yet</p>
      )}
    </div>
  );
}

export default App;