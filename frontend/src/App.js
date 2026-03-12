import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(null);

  const fetchOptions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/options`);
      const data = await res.json();
      setOptions(data);
    } catch (err) {
      console.error('Failed to fetch options:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOptions(); }, []);

  const vote = async (id) => {
    setVoting(id);
    try {
      await fetch(`${API_URL}/api/vote/${id}`, { method: 'POST' });
      await fetchOptions();
    } catch (err) {
      console.error('Vote failed:', err);
    } finally {
      setVoting(null);
    }
  };

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);
  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <h1>🗳️ Cloud Voting App</h1>
      <p className="subtitle">Cast your vote!</p>
      <div className="options">
        {options.map(option => {
          const percentage = totalVotes > 0 ? (option.votes / totalVotes * 100).toFixed(1) : 0;
          return (
            <div key={option.id} className="option">
              <div className="option-header">
                <span className="option-name">{option.name}</span>
                <span className="option-votes">{option.votes} votes ({percentage}%)</span>
              </div>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${percentage}%` }}></div>
              </div>
              <button onClick={() => vote(option.id)} disabled={voting === option.id}>
                {voting === option.id ? 'Voting...' : 'Vote'}
              </button>
            </div>
          );
        })}
      </div>
      <p className="total">Total votes: {totalVotes}</p>
    </div>
  );
}

export default App;