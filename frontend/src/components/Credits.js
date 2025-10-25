import React, { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import { AccountBalanceWallet, Add, History } from '@mui/icons-material';
import PropTypes from 'prop-types';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: '#1A2332 !important',
  borderColor: '#1E293B',
  border: '1px solid #1E293B',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '& .MuiCardContent-root': {
    backgroundColor: '#1A2332 !important',
  },
  '&:hover': {
    boxShadow: '0 20px 40px rgba(20, 184, 166, 0.15)',
    borderColor: '#14B8A6',
    transform: 'translateY(-2px)',
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#1A2332 !important',
    borderColor: '#1E293B',
    border: '1px solid #1E293B',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#0F172A',
    color: '#E2E8F0',
    '& fieldset': {
      borderColor: '#1E293B',
    },
    '&:hover fieldset': {
      borderColor: '#14B8A6',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#14B8A6',
    },
  },
  '& .MuiInputBase-input::placeholder': {
    color: '#94A3B8',
    opacity: 1,
  },
}));

const Credits = () => {
  const [credits, setCredits] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addingCredits, setAddingCredits] = useState(false);

  useEffect(() => {
    fetchCredits();
    fetchTransactions();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await api.get('/auth/credits');
      setCredits(response.data);
    } catch (error) {
      console.error('Error fetching credits:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/auth/credits/transactions');
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleAddCredits = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setAddingCredits(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/auth/credits/add', {
        amount: parseFloat(amount),
        payment_method: 'demo'
      });

      setSuccess(`Successfully added $${amount} to your account!`);
      setAmount('');
      setAddDialogOpen(false);
      fetchCredits();
      fetchTransactions();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add credits');
    } finally {
      setAddingCredits(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'earned': return 'success';
      case 'spent': return 'error';
      case 'bonus': return 'info';
      case 'refund': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress sx={{ color: '#14B8A6' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%',
      backgroundColor: '#0F172A !important', 
      minHeight: '100vh',
      py: 4,
      px: 2
    }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#E2E8F0' }}>
          <AccountBalanceWallet sx={{ color: '#14B8A6' }} />
          Credit Management
        </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2, backgroundColor: '#7F1D1D', color: '#FCA5A5', border: '1px solid #DC2626' }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2, backgroundColor: '#064E3B', color: '#86EFAC', border: '1px solid #10B981' }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Current Balance */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent sx={{ backgroundColor: '#1A2332 !important', p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#E2E8F0' }}>
                Current Balance
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#14B8A6' }}>
                {formatCurrency(credits?.balance)}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`Earned: ${formatCurrency(credits?.total_earned)}`}
                  sx={{ backgroundColor: '#064E3B', color: '#86EFAC', border: '1px solid #10B981' }}
                />
                <Chip
                  label={`Spent: ${formatCurrency(credits?.total_spent)}`}
                  sx={{ backgroundColor: '#7F1D1D', color: '#FCA5A5', border: '1px solid #DC2626' }}
                />
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddDialogOpen(true)}
                sx={{ mt: 2, fullWidth: true, backgroundColor: '#14B8A6', color: '#0F172A', '&:hover': { backgroundColor: '#0F766E' } }}
              >
                Add Credits
              </Button>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Quick Add Options */}
        <Grid item xs={12} md={6}>
          <StyledCard>
            <CardContent sx={{ backgroundColor: '#1A2332 !important', p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#E2E8F0' }}>
                Quick Add
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[10, 25, 50, 100].map((amt) => (
                  <Button
                    key={amt}
                    variant="outlined"
                    onClick={() => {
                      setAmount(amt.toString());
                      setAddDialogOpen(true);
                    }}
                    sx={{ borderColor: '#14B8A6', color: '#14B8A6', '&:hover': { backgroundColor: 'rgba(20, 184, 166, 0.1)', borderColor: '#0F766E', color: '#0F766E' } }}
                  >
                    ${amt}
                  </Button>
                ))}
              </Box>
              <Typography variant="body2" sx={{ mt: 2, color: '#CBD5E1' }}>
                Credits are used to book skill sessions with teachers.
                You'll earn credits when others book your skills.
              </Typography>
            </CardContent>
          </StyledCard>
        </Grid>

        {/* Transaction History */}
        <Grid item xs={12}>
          <StyledCard>
            <CardContent sx={{ backgroundColor: '#1A2332 !important', p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#E2E8F0' }}>
                <History sx={{ color: '#14B8A6' }} />
                Recent Transactions
              </Typography>
              {transactions.length > 0 ? (
                <List>
                  {transactions.slice(0, 10).map((transaction, index) => (
                    <React.Fragment key={transaction.id}>
                      <ListItem sx={{ py: 2 }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={transaction.transaction_type}
                                size="small"
                                sx={{
                                  backgroundColor: transaction.transaction_type === 'spent' ? '#7F1D1D' : transaction.transaction_type === 'earned' ? '#064E3B' : '#1E40AF',
                                  color: transaction.transaction_type === 'spent' ? '#FCA5A5' : transaction.transaction_type === 'earned' ? '#86EFAC' : '#93C5FD',
                                }}
                              />
                              <Typography variant="body1" sx={{ color: '#E2E8F0' }}>
                                {transaction.description}
                              </Typography>
                            </Box>
                          }
                          secondary={<Typography sx={{ color: '#94A3B8' }}>{formatDate(transaction.created_at)}</Typography>}
                        />
                        <Typography
                          variant="h6"
                          sx={{ color: transaction.transaction_type === 'spent' ? '#FCA5A5' : '#86EFAC' }}
                        >
                          {transaction.transaction_type === 'spent' ? '-' : '+'}{formatCurrency(transaction.amount)}
                        </Typography>
                      </ListItem>
                      {index < transactions.length - 1 && <Divider sx={{ backgroundColor: '#1E293B' }} />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ color: '#CBD5E1' }}>
                  No transactions yet. Start by booking a skill session or adding credits!
                </Typography>
              )}
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Add Credits Dialog */}
      <StyledDialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ backgroundColor: '#1A2332 !important', color: '#E2E8F0', borderBottom: '1px solid #1E293B' }}>Add Credits</DialogTitle>
        <DialogContent sx={{ backgroundColor: '#1A2332 !important' }}>
          <StyledTextField
            autoFocus
            margin="dense"
            label="Amount ($)"
            type="number"
            fullWidth
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputProps={{ min: 1, step: 0.01 }}
            sx={{ mt: 1 }}
            InputLabelProps={{ sx: { color: '#CBD5E1' } }}
          />
          <Typography variant="body2" sx={{ mt: 1, color: '#CBD5E1' }}>
            Enter the amount of credits you want to add to your account.
            This is a demo system, so credits will be added instantly.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#1A2332 !important', borderTop: '1px solid #1E293B' }}>
          <Button onClick={() => setAddDialogOpen(false)} sx={{ color: '#CBD5E1' }}>Cancel</Button>
          <Button
            onClick={handleAddCredits}
            variant="contained"
            disabled={addingCredits || !amount}
            sx={{ backgroundColor: '#14B8A6', color: '#0F172A', '&:hover': { backgroundColor: '#0F766E' } }}
          >
            {addingCredits ? 'Adding...' : 'Add Credits'}
          </Button>
        </DialogActions>
      </StyledDialog>
      </Box>
    </Box>
  );
};

export default Credits;

Credits.propTypes = {
  // No props required for this component
};