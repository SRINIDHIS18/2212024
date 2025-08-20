import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Container } from '@mui/material';
import logger from '../utils/logger';
import { getMappings, addClick } from '../utils/storage';

const Redirect = () => {
  const { shortcode } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const mappings = getMappings();
    const entry = mappings[shortcode];

    if (!entry) {
      setError('Shortened URL not found.');
      logger('warn', `Redirect failed: Shortcode not found - ${shortcode}`);
      return;
    }

    const now = new Date().getTime();
    if (now > entry.expiresAt) {
      setError('This shortened URL has expired.');
      logger('warn', `Redirect failed: Expired - ${shortcode}`);
      return;
    }

    
    fetch('https://ipapi.co/json/')
      .then((res) => res.json())
      .then((data) => {
        const geo = data.error ? 'Unknown' : `${data.city || 'Unknown'}, ${data.country_name || 'Unknown'}`;
        const clickData = {
          timestamp: now,
          source: document.referrer || 'direct',
          geo,
        };
        addClick(shortcode, clickData);
        logger('info', `Redirecting from ${shortcode} to ${entry.originalURL}`);
        window.location.href = entry.originalURL; 
      })
      .catch((err) => {
        logger('error', `Geo fetch failed: ${err.message}`);
        
        const clickData = {
          timestamp: now,
          source: document.referrer || 'direct',
          geo: 'Unknown',
        };
        addClick(shortcode, clickData);
        window.location.href = entry.originalURL;
      });
  }, [shortcode, navigate]);

  if (error) {
    return (
      <Container>
        <Typography variant="h6" color="error">{error}</Typography>
      </Container>
    );
  }

  return <Typography>Redirecting...</Typography>;
};

export default Redirect;