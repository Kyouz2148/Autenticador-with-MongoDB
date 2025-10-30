import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Card,
  CardContent,
  CircularProgress,
} from '@mui/material';
import { QrCodeScanner, Key, Settings } from '@mui/icons-material';
import { useToast } from '../contexts/ToastContext';
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

interface AddAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (account: Account) => void;
}

const steps = ['Informações Básicas', 'Secret TOTP', 'Configurações Avançadas'];

const serviceColors = [
  '#1976d2', '#dc004e', '#388e3c', '#f57c00',
  '#7b1fa2', '#d32f2f', '#0288d1', '#5d4037',
  '#616161', '#303f9f', '#c62828', '#2e7d32'
];

export default function AddAccountDialog({ open, onClose, onAdd }: AddAccountDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form data
  const [serviceName, setServiceName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [issuer, setIssuer] = useState('');
  const [secret, setSecret] = useState('');
  const [digits, setDigits] = useState(6);
  const [period, setPeriod] = useState(30);
  const [algorithm, setAlgorithm] = useState('sha1');
  const [color, setColor] = useState('#1976d2');

  // QR Code generation
  const [generatedSecret, setGeneratedSecret] = useState<any>(null);

  const { showToast } = useToast();

  const handleNext = () => {
    if (activeStep === 0) {
      if (!serviceName.trim() || !accountName.trim()) {
        setError('Nome do serviço e da conta são obrigatórios');
        return;
      }
    }
    
    if (activeStep === 1) {
      if (!secret.trim()) {
        setError('Secret TOTP é obrigatório');
        return;
      }
    }

    setError('');
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleGenerateSecret = async () => {
    if (!serviceName.trim() || !accountName.trim()) {
      setError('Preencha o nome do serviço e da conta primeiro');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/accounts/generate-secret', {
        serviceName,
        accountName,
        issuer: issuer || 'Password Authenticator'
      });

      setGeneratedSecret(response.data);
      setSecret(response.data.secret);
      setError('');
      showToast('Secret gerado com sucesso!', 'success');
    } catch (error: any) {
      console.error('Erro ao gerar secret:', error);
      setError('Erro ao gerar secret');
      showToast('Erro ao gerar secret', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/accounts', {
        serviceName: serviceName.trim(),
        accountName: accountName.trim(),
        secret: secret.trim(),
        issuer: issuer.trim() || undefined,
        digits,
        period,
        algorithm,
        color
      });

      onAdd(response.data.account);
      handleReset();
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      setError(error.response?.data?.message || 'Erro ao criar conta');
      showToast('Erro ao criar conta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setServiceName('');
    setAccountName('');
    setIssuer('');
    setSecret('');
    setDigits(6);
    setPeriod(30);
    setAlgorithm('sha1');
    setColor('#1976d2');
    setGeneratedSecret(null);
    setError('');
    setLoading(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              autoFocus
              margin="dense"
              label="Nome do Serviço"
              fullWidth
              variant="outlined"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="Ex: Google, GitHub, Microsoft"
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Nome da Conta"
              fullWidth
              variant="outlined"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Ex: seuemail@gmail.com, username"
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              label="Emissor (Opcional)"
              fullWidth
              variant="outlined"
              value={issuer}
              onChange={(e) => setIssuer(e.target.value)}
              placeholder="Ex: Minha Empresa"
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Escolha uma cor para identificar esta conta:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {serviceColors.map((serviceColor) => (
                <Box
                  key={serviceColor}
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: serviceColor,
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: color === serviceColor ? '3px solid #000' : '1px solid #ddd',
                  }}
                  onClick={() => setColor(serviceColor)}
                />
              ))}
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Adicione o secret TOTP da sua conta:
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Key />}
                onClick={handleGenerateSecret}
                disabled={loading || !serviceName.trim() || !accountName.trim()}
                fullWidth
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={20} /> : 'Gerar Novo Secret'}
              </Button>
              
              {generatedSecret && (
                <Card sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      QR Code Gerado
                    </Typography>
                    <Box textAlign="center" mb={2}>
                      <Box
                        component="img"
                        src={generatedSecret.qr_code} 
                        alt="QR Code"
                        sx={{ maxWidth: '200px', height: 'auto' }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Escaneie este QR Code com outro app autenticador ou use o secret manual abaixo.
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Box>

            <TextField
              margin="dense"
              label="Secret TOTP"
              fullWidth
              variant="outlined"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Insira o secret de 32 caracteres"
              helperText="Cole o secret fornecido pelo serviço ou use o botão acima para gerar um novo"
              multiline
              rows={3}
            />
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="body1" gutterBottom>
              Configurações avançadas (opcional):
            </Typography>
            
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Número de Dígitos</InputLabel>
              <Select
                value={digits}
                label="Número de Dígitos"
                onChange={(e) => setDigits(Number(e.target.value))}
              >
                <MenuItem value={6}>6 dígitos</MenuItem>
                <MenuItem value={8}>8 dígitos</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Período de Renovação</InputLabel>
              <Select
                value={period}
                label="Período de Renovação"
                onChange={(e) => setPeriod(Number(e.target.value))}
              >
                <MenuItem value={30}>30 segundos</MenuItem>
                <MenuItem value={60}>60 segundos</MenuItem>
                <MenuItem value={120}>120 segundos</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Algoritmo</InputLabel>
              <Select
                value={algorithm}
                label="Algoritmo"
                onChange={(e) => setAlgorithm(e.target.value)}
              >
                <MenuItem value="sha1">SHA1</MenuItem>
                <MenuItem value="sha256">SHA256</MenuItem>
                <MenuItem value="sha512">SHA512</MenuItem>
              </Select>
            </FormControl>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        <Typography variant="h6">
          Adicionar Nova Conta
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>

      <DialogContent sx={{ flexGrow: 1 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={handleClose}>
          Cancelar
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep !== 0 && (
          <Button onClick={handleBack}>
            Voltar
          </Button>
        )}
        {activeStep === steps.length - 1 ? (
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Criar Conta'}
          </Button>
        ) : (
          <Button onClick={handleNext} variant="contained">
            Próximo
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}