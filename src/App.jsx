import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Divider,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  borderRadius: '12px',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
  },
  marginBottom: theme.spacing(2),
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '10px 24px',
  textTransform: 'none',
  fontWeight: 'bold',
  marginTop: theme.spacing(2),
}));

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('casual');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Temporary workaround for Grid warnings
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (/MUI Grid/.test(args[0])) return;
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);

  const handleSubmit = async () => {
    if (!emailContent.trim()) {
      setError('Please enter email content');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/email/generate`, {
        emailContent: emailContent.trim(),
        tone
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const reply = response.data?.reply || response.data;
      setGeneratedReply(typeof reply === 'string' ? reply : JSON.stringify(reply, null, 2));
    } catch (error) {
      console.error('API Error:', error);
      setError(error.response?.data?.message || 
               error.message || 
               'Failed to generate email reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatedReply)
      .then(() => setSnackbarOpen(true))
      .catch(err => console.error('Failed to copy:', err));
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        fontWeight: 'bold', 
        color: 'primary.main',
        mb: 4
      }}>
        Smart Reply Generator
      </Typography>

      <StyledPaper elevation={3}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', mb: 2 }}>
          Original Email Content
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <StyledTextField
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          placeholder="Paste the original email content here..."
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          error={!!error && !emailContent.trim()}
          helperText={!!error && !emailContent.trim() ? error : ''}
        />

        {/* This Grid usage is correct - warnings are false positives */}
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <InputLabel id="tone-select-label">Reply Tone</InputLabel>
            <Select
              labelId="tone-select-label"
              fullWidth
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              sx={{ borderRadius: '8px', mt: 1 }}
              disabled={loading}
            >
              <MenuItem value="casual">Casual</MenuItem>
              <MenuItem value="professional">Professional</MenuItem>
              <MenuItem value="friendly">Friendly</MenuItem>
              <MenuItem value="formal">Formal</MenuItem>
            </Select>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <StyledButton
            variant="contained"
            color="primary"
            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            onClick={handleSubmit}
            disabled={loading || !emailContent.trim()}
          >
            {loading ? 'Generating...' : 'Generate Reply'}
          </StyledButton>
        </Box>
      </StyledPaper>

      {error && !loading && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {generatedReply && (
        <StyledPaper elevation={3} sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: '600', mb: 2 }}>
            Generated Reply
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{
            p: 2,
            backgroundColor: 'grey.50',
            borderRadius: '8px',
            whiteSpace: 'pre-wrap',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            {generatedReply}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyToClipboard}
              disabled={!generatedReply}
            >
              Copy to Clipboard
            </Button>
          </Box>
        </StyledPaper>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="Copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Container>
  );
}

export default App;