import React, { useState } from 'react';
import { Button, TextField, Typography, Container, Box, Snackbar, Alert, IconButton, Link } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';
import { getMappings, saveMappings } from '../utils/storage';

const MAX_URLS = 5;
const DEFAULT_VALIDITY = 30;
const SHORTCODE_LENGTH = 6;
const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

const generateShortcode = (existing) => {
  let code;
  do {
    code = '';
    for (let i = 0; i < SHORTCODE_LENGTH; i++) {
      code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
  } while (existing[code]);
  return code;
};

const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isValidShortcode = (code) => /^[a-zA-Z0-9]{4,12}$/.test(code);

const Shortener = () => {
  const navigate = useNavigate();
  const [urls, setUrls] = useState([{ url: '', validity: '', shortcode: '' }]);
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleAddField = () => {
    if (urls.length < MAX_URLS) {
      setUrls([...urls, { url: '', validity: '', shortcode: '' }]);
      logger('info', 'Added new URL field');
    } else {
      setError(`Cannot add more than ${MAX_URLS} URLs`);
      setOpenSnackbar(true);
    }
  };

  const handleRemoveField = (index) => {
    const newUrls = urls.filter((_, i) => i !== index);
    setUrls(newUrls);
    logger('info', `Removed URL field at index ${index}`);
  };

  const handleChange = (index, field, value) => {
    const newUrls = [...urls];
    newUrls[index][field] = value;
    setUrls(newUrls);
  };

  const handleSubmit = () => {
    setError('');
    setResults([]);
    const mappings = getMappings();
    const newResults = [];
    let hasError = false;

    urls.forEach((item, index) => {
      if (!item.url) {
        setError(`URL is required for entry ${index + 1}`);
        hasError = true;
        return;
      }
      if (!isValidURL(item.url)) {
        setError(`Invalid URL format for entry ${index + 1}`);
        hasError = true;
        return;
      }
      const validity = item.validity ? parseInt(item.validity, 10) : DEFAULT_VALIDITY;
      if (isNaN(validity) || validity <= 0) {
        setError(`Validity must be a positive integer for entry ${index + 1}`);
        hasError = true;
        return;
      }
      let shortcode = item.shortcode.trim();
      if (shortcode) {
        if (!isValidShortcode(shortcode)) {
          setError(`Shortcode must be alphanumeric (4-12 chars) for entry ${index + 1}`);
          hasError = true;
          return;
        }
        if (mappings[shortcode]) {
          setError(`Shortcode already exists for entry ${index + 1}`);
          hasError = true;
          return;
        }
      } else {
        shortcode = generateShortcode(mappings);
      }

      const createdAt = new Date().getTime();
      const expiresAt = createdAt + validity * 60 * 1000;
      mappings[shortcode] = {
        originalURL: item.url,
        createdAt,
        expiresAt,
        clicks: [],
      };
      newResults.push({ shortcode, expiresAt });
      logger('info', `Shortened URL: ${item.url} to ${shortcode} with expiry ${new Date(expiresAt)}`);
    });

    if (hasError) {
      setOpenSnackbar(true);
      return;
    }

    saveMappings(mappings);
    setResults(newResults);
    setUrls([{ url: '', validity: '', shortcode: '' }]); 
  };

  const handleCloseSnackbar = () => setOpenSnackbar(false);

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>URL Shortener</Typography>
      <Button variant="outlined" onClick={() => navigate('/statistics')}>Go to Statistics</Button>
      <Box mt={2}>
        {urls.map((item, index) => (
          <Box key={index} display="flex" alignItems="center" mb={2}>
            <TextField
              label="Original URL"
              value={item.url}
              onChange={(e) => handleChange(index, 'url', e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Validity (minutes)"
              value={item.validity}
              onChange={(e) => handleChange(index, 'validity', e.target.value)}
              type="number"
              margin="normal"
              sx={{ ml: 2, width: 150 }}
            />
            <TextField
              label="Preferred Shortcode"
              value={item.shortcode}
              onChange={(e) => handleChange(index, 'shortcode', e.target.value)}
              margin="normal"
              sx={{ ml: 2, width: 200 }}
            />
            {index > 0 && (
              <IconButton onClick={() => handleRemoveField(index)} sx={{ ml: 2 }}>
                <RemoveIcon />
              </IconButton>
            )}
          </Box>
        ))}
        <Button onClick={handleAddField} startIcon={<AddIcon />} disabled={urls.length >= MAX_URLS}>
          Add URL (up to {MAX_URLS})
        </Button>
      </Box>
      <Button variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 2 }}>
        Shorten URLs
      </Button>
      {results.length > 0 && (
        <Box mt={4}>
          <Typography variant="h6">Shortened URLs:</Typography>
          {results.map((res, idx) => (
            <Box key={idx}>
              <Link href={`/${res.shortcode}`}>{`http://localhost:3000/${res.shortcode}`}</Link>
              <Typography>Expiry: {new Date(res.expiresAt).toLocaleString()}</Typography>
            </Box>
          ))}
        </Box>
      )}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Shortener;