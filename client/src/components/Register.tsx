import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Link,
  Container,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock, 
  Person 
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: string[] = [];

    if (username.length < 3) {
      newErrors.push('Username deve ter pelo menos 3 caracteres');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      newErrors.push('Username deve conter apenas letras, números, _ ou -');
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.push('Email inválido');
    }

    if (password.length < 6) {
      newErrors.push('Senha deve ter pelo menos 6 caracteres');
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      newErrors.push('Senha deve conter pelo menos uma letra minúscula, maiúscula e um número');
    }

    if (password !== confirmPassword) {
      newErrors.push('Senhas não coincidem');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(username, email, password);
      showToast('Conta criada com sucesso!', 'success');
      navigate('/dashboard');
    } catch (error: any) {
      const errorMessage = error.message;
      setErrors([errorMessage]);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%', mt: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography component="h1" variant="h4" color="primary" gutterBottom>
                🔐 Password Authenticator
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Crie sua conta para começar a usar o autenticador
              </Typography>
            </Box>

            {errors.length > 0 && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Box component="ul" sx={{ margin: 0, paddingLeft: '1rem' }}>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </Box>
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirmar Senha"
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={loading}
                size="large"
              >
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                  type="button"
                >
                  Já tem uma conta? Faça login
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}