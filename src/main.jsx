import React from 'react';
import ReactDOM from 'react-dom/client';
import Root from './App.jsx'; // The component we just pasted into App.jsx
import './index.css';     // We will configure this for Tailwind CSS

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
