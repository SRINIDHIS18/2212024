import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Container, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';
import { getMappings } from '../utils/storage';

const Statistics = () => {
  const navigate = useNavigate();
  const [mappings, setMappings] = useState({});

  useEffect(() => {
    const data = getMappings();
    setMappings(data);
    logger('info', 'Loaded statistics page');
  }, []);

  const entries = Object.entries(mappings);

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>URL Shortener Statistics</Typography>
      <Button variant="outlined" onClick={() => navigate('/')}>Back to Shortener</Button>
      {entries.length === 0 ? (
        <Typography>No shortened URLs yet.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Shortened URL</TableCell>
                <TableCell>Creation Date</TableCell>
                <TableCell>Expiry Date</TableCell>
                <TableCell>Total Clicks</TableCell>
                <TableCell>Click Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map(([shortcode, data]) => (
                <TableRow key={shortcode}>
                  <TableCell>http://localhost:3000/{shortcode}</TableCell>
                  <TableCell>{new Date(data.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{new Date(data.expiresAt).toLocaleString()}</TableCell>
                  <TableCell>{data.clicks.length}</TableCell>
                  <TableCell>
                    {data.clicks.map((click, idx) => (
                      <div key={idx}>
                        {new Date(click.timestamp).toLocaleString()} - Source: {click.source} - Geo: {click.geo}
                      </div>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Statistics;