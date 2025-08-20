import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Shortener from './components/Shortener';
import Statistics from './components/Statistics';
import Redirect from './components/Redirect';
import { CssBaseline } from '@mui/material';

function App() {
  return (
    <Router>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<Shortener />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/:shortcode" element={<Redirect />} />
      </Routes>
    </Router>
  );
}

export default App;