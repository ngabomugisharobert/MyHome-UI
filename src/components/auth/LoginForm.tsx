import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types';
import ThemeToggle from '../common/ThemeToggle';

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      await login(data);
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const fillCredentials = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <ThemeToggle />
          </Box>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom>
              MyHome Healthcare
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to your account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              fullWidth
              label="Email"
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
              sx={{ mb: 2 }}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', mb: 1 }}>
              Test Credentials:
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, textAlign: 'left' }}>
              <Box 
                sx={{ 
                  cursor: 'pointer', 
                  p: 1, 
                  borderRadius: 1, 
                  '&:hover': { backgroundColor: 'action.hover' } 
                }}
                onClick={() => fillCredentials('admin@myhome.com', 'password123')}
              >
                <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                  Admin:
                </Typography>
                <Typography variant="caption" display="block">
                  admin@myhome.com
                </Typography>
                <Typography variant="caption" display="block">
                  password123
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  cursor: 'pointer', 
                  p: 1, 
                  borderRadius: 1, 
                  '&:hover': { backgroundColor: 'action.hover' } 
                }}
                onClick={() => fillCredentials('doctor@myhome.com', 'password123')}
              >
                <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                  Doctor:
                </Typography>
                <Typography variant="caption" display="block">
                  doctor@myhome.com
                </Typography>
                <Typography variant="caption" display="block">
                  password123
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  cursor: 'pointer', 
                  p: 1, 
                  borderRadius: 1, 
                  '&:hover': { backgroundColor: 'action.hover' } 
                }}
                onClick={() => fillCredentials('caregiver@myhome.com', 'password123')}
              >
                <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                  Caregiver:
                </Typography>
                <Typography variant="caption" display="block">
                  caregiver@myhome.com
                </Typography>
                <Typography variant="caption" display="block">
                  password123
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  cursor: 'pointer', 
                  p: 1, 
                  borderRadius: 1, 
                  '&:hover': { backgroundColor: 'action.hover' } 
                }}
                onClick={() => fillCredentials('supervisor@myhome.com', 'password123')}
              >
                <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                  Supervisor:
                </Typography>
                <Typography variant="caption" display="block">
                  supervisor@myhome.com
                </Typography>
                <Typography variant="caption" display="block">
                  password123
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  cursor: 'pointer', 
                  p: 1, 
                  borderRadius: 1, 
                  '&:hover': { backgroundColor: 'action.hover' } 
                }}
                onClick={() => fillCredentials('owner@myhome.com', 'password123')}
              >
                <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                  Facility Owner:
                </Typography>
                <Typography variant="caption" display="block">
                  owner@myhome.com
                </Typography>
                <Typography variant="caption" display="block">
                  password123
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  cursor: 'pointer', 
                  p: 1, 
                  borderRadius: 1, 
                  '&:hover': { backgroundColor: 'action.hover' } 
                }}
                onClick={() => fillCredentials('caregiver2@myhome.com', 'password123')}
              >
                <Typography variant="caption" display="block" sx={{ fontWeight: 'bold' }}>
                  Caregiver 2:
                </Typography>
                <Typography variant="caption" display="block">
                  caregiver2@myhome.com
                </Typography>
                <Typography variant="caption" display="block">
                  password123
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginForm;
