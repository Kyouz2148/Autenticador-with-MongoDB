import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  LinearProgress,
  Tooltip,
  Button,
} from '@mui/material';
import {
  MoreVert,
  ContentCopy,
  Delete,
  Edit,
  QrCode,
} from '@mui/icons-material';
import { useToast } from '../contexts/ToastContext';

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

interface AccountCardProps {
  account: Account;
  timeRemaining: number;
  onDelete: () => void;
}

export default function AccountCard({ account, timeRemaining, onDelete }: AccountCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { showToast } = useToast();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(account.currentCode);
      showToast('Código copiado para a área de transferência', 'success');
    } catch (error) {
      console.error('Erro ao copiar código:', error);
      showToast('Erro ao copiar código', 'error');
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja remover a conta ${account.serviceName}?`)) {
      onDelete();
    }
    handleMenuClose();
  };

  const formatCode = (code: string) => {
    // Formatar código em grupos de 3 dígitos
    return code.replace(/(\d{3})(\d{3})/, '$1 $2');
  };

  const getProgressValue = () => {
    return ((account.period - timeRemaining) / account.period) * 100;
  };

  const getProgressColor = () => {
    if (timeRemaining <= 5) return 'error';
    if (timeRemaining <= 10) return 'warning';
    return 'primary';
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderLeft: `4px solid ${account.color}`,
        '&:hover': {
          boxShadow: 3,
        },
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" component="h2" gutterBottom>
              {account.serviceName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {account.accountName}
            </Typography>
            {account.issuer && (
              <Chip 
                label={account.issuer} 
                size="small" 
                variant="outlined" 
                sx={{ mt: 1 }}
              />
            )}
          </Box>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ mt: -1 }}
          >
            <MoreVert />
          </IconButton>
        </Box>

        <Box textAlign="center" mb={2}>
          <Typography 
            variant="h4" 
            component="div" 
            sx={{ 
              fontFamily: 'monospace',
              letterSpacing: 2,
              fontWeight: 'bold',
              color: timeRemaining <= 5 ? 'error.main' : 'primary.main',
            }}
          >
            {formatCode(account.currentCode)}
          </Typography>
        </Box>

        <Box mb={2}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="caption" color="text.secondary">
              Renovação em {timeRemaining}s
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {account.digits} dígitos • {account.period}s
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={getProgressValue()} 
            color={getProgressColor()}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<ContentCopy />}
          onClick={handleCopyCode}
          size="small"
        >
          Copiar Código
        </Button>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <Edit sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <QrCode sx={{ mr: 1 }} />
          Ver QR Code
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Remover
        </MenuItem>
      </Menu>
    </Card>
  );
}