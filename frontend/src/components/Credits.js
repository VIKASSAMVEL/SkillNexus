import React, { useState, useEffect } from 'react';
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
  Divider
} from '@mui/material';
import { AccountBalanceWallet, Add, History } from '@mui/icons-material';
import PropTypes from 'prop-types';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';

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
        <Typography>Loading credits...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccountBalanceWallet />
        Credit Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Current Balance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Current Balance
              </Typography>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                {formatCurrency(credits?.balance)}
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                <Chip
                  label={`Earned: ${formatCurrency(credits?.total_earned)}`}
                  color="success"
                  variant="outlined"
                />
                <Chip
                  label={`Spent: ${formatCurrency(credits?.total_spent)}`}
                  color="error"
                  variant="outlined"
                />
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddDialogOpen(true)}
                sx={{ mt: 2 }}
                fullWidth
              >
                Add Credits
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Add Options */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
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
                  >
                    ${amt}
                  </Button>
                ))}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Credits are used to book skill sessions with teachers.
                You'll earn credits when others book your skills.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Transaction History */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <History />
                Recent Transactions
              </Typography>
              {transactions.length > 0 ? (
                <List>
                  {transactions.slice(0, 10).map((transaction, index) => (
                    <React.Fragment key={transaction.id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={transaction.transaction_type}
                                color={getTransactionColor(transaction.transaction_type)}
                                size="small"
                              />
                              <Typography variant="body1">
                                {transaction.description}
                              </Typography>
                            </Box>
                          }
                          secondary={formatDate(transaction.created_at)}
                        />
                        <Typography
                          variant="h6"
                          color={transaction.transaction_type === 'spent' ? 'error' : 'success'}
                        >
                          {transaction.transaction_type === 'spent' ? '-' : '+'}{formatCurrency(transaction.amount)}
                        </Typography>
                      </ListItem>
                      {index < transactions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No transactions yet. Start by booking a skill session or adding credits!
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Credits Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Credits</DialogTitle>
        <DialogContent>
          <TextField
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
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Enter the amount of credits you want to add to your account.
            This is a demo system, so credits will be added instantly.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddCredits}
            variant="contained"
            disabled={addingCredits || !amount}
          >
            {addingCredits ? 'Adding...' : 'Add Credits'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Credits;

Credits.propTypes = {
  // No props required for this component
};