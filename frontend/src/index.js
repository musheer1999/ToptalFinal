// ============================================================
// index.js — The entry point of the React app
//
// This is the first file React reads. It mounts (attaches)
// the App component into the <div id="root"> in index.html.
// You almost never need to edit this file.
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Find the <div id="root"> in public/index.html and render our app there
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // StrictMode helps catch bugs during development (double-renders components)
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
