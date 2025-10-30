import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Fab,
} from '@mui/material';
import {
  AccountCircle,
  Add,
  Logout,
  Settings,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import AccountCard from './AccountCard';
import AddAccountDialog from './AddAccountDialog';
import axios from 'axios';

interface Account {
  id: string;
  serviceName: string;
  accountName: string;
  issuer?: string;
  digits: number;
  period: number;
  algorithm: string;
  icon: string;
  color: string;
  order: number;
  currentCode: string;
  timeRemaining: number;
  createdAt: string;
}

export default function Dashboard() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);

  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const fetchAccounts = async () => {
    try {
      const response = await axios.get('/accounts');
      setAccounts(response.data.accounts);
    } catch (error: any) {
      console.error('Erro ao buscar contas:', error);
      showToast('Erro ao carregar contas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshCodes = async () => {
    try {
      const response = await axios.get('/accounts/codes');
      const updatedCodes = response.data.codes;
      
      setAccounts(prevAccounts => 
        prevAccounts.map(account => {
          const updatedCode = updatedCodes.find((code: any) => code.id === account.id);
          return updatedCode 
            ? { ...account, currentCode: updatedCode.currentCode, timeRemaining: updatedCode.timeRemaining }
            : account;
        })
      );
    } catch (error: any) {
      console.error('Erro ao atualizar códigos:', error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    // Atualizar códigos a cada segundo
    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          refreshCodes();
          return 30; // Reset para 30 segundos
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    showToast('Logout realizado com sucesso', 'success');
  };

  const handleDeleteAccount = async (accountId: string) => {
    try {
      await axios.delete(`/accounts/${accountId}`);
      setAccounts(prev => prev.filter(account => account.id !== accountId));
      showToast('Conta removida com sucesso', 'success');
    } catch (error: any) {
      console.error('Erro ao remover conta:', error);
      showToast('Erro ao remover conta', 'error');
    }
  };

  const handleAddAccount = (newAccount: Account) => {
    setAccounts(prev => [...prev, newAccount]);
    setAddDialogOpen(false);
    showToast('Conta adicionada com sucesso', 'success');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🔐 Password Authenticator
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              Atualização em: {timeRemaining}s
            </Typography>
            <IconButton color="inherit" onClick={refreshCodes}>
              <Refresh />
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>
                <Typography variant="body2">
                  {user?.username} ({user?.email})
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleMenuClose}>
                <Settings sx={{ mr: 1 }} />
                Configurações
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Sair
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {accounts.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography variant="h5" gutterBottom color="text.secondary">
              Nenhuma conta configurada
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Adicione sua primeira conta para começar a gerar códigos de autenticação
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddDialogOpen(true)}
              size="large"
            >
              Adicionar Primeira Conta
            </Button>
          </Box>
        ) : (
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h4" component="h1">
                Suas Contas ({accounts.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setAddDialogOpen(true)}
              >
                Adicionar Conta
              </Button>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
              }}
            >
              {accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  timeRemaining={timeRemaining}
                  onDelete={() => handleDeleteAccount(account.id)}
                />
              ))}
            </Box>
          </>
        )}

        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => setAddDialogOpen(true)}
        >
          <Add />
        </Fab>
      </Container>

      <AddAccountDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddAccount}
      />
    </>
  );
}