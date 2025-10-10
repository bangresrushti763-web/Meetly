import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import "../App.css";
import Footer from '../components/Footer';

// Custom theme to match the professional design
const theme = createTheme({
  palette: {
    primary: {
      main: '#38bdf8',
    },
    secondary: {
      main: '#0ea5e9',
    },
    background: {
      default: '#0f172a',
      paper: 'rgba(15, 23, 42, 0.8)',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(56, 189, 248, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#38bdf8',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          background: 'linear-gradient(45deg, #38bdf8, #0ea5e9)',
          boxShadow: '0 4px 20px rgba(56, 189, 248, 0.3)',
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '&:hover': {
            boxShadow: '0 6px 25px rgba(56, 189, 248, 0.5)',
          },
        },
      },
    },
  },
});

export default function Authentication() {

    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [error, setError] = React.useState('');
    const [message, setMessage] = React.useState('');

    const [formState, setFormState] = React.useState(0);

    const [open, setOpen] = React.useState(false)

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    let handleAuth = async () => {
        try {
            setError('');
            if (formState === 0) {
                await handleLogin(username, password);
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                setMessage(result);
                setOpen(true);
                setFormState(0);
                setName('');
                setUsername('');
                setPassword('');
            }
        } catch (err) {
            console.log(err);
            let errorMessage = "An error occurred";
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            setError(errorMessage);
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <div style={{ 
                minHeight: '100vh', 
                display: 'flex', 
                flexDirection: 'column',
                background: 'linear-gradient(135deg, #0f172a, #1e293b)'
            }}>
                <Grid container component="main" sx={{ flex: 1 }} className="authContainer">
                    <CssBaseline />
                    <Grid
                        item
                        xs={false}
                        sm={4}
                        md={7}
                        sx={{
                            backgroundImage: 'url(https://source.unsplash.com/random/1600x900/?meeting,conference)',
                            backgroundRepeat: 'no-repeat',
                            backgroundColor: (t) =>
                                t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'relative',
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(30, 41, 59, 0.5))',
                        }} />
                    </Grid>
                    <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                        <Box
                            sx={{
                                my: 8,
                                mx: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                                <LockOutlinedIcon />
                            </Avatar>

                            <Typography component="h1" variant="h5" sx={{ mb: 3, color: 'white' }}>
                                Professional Meeting Platform
                            </Typography>

                            <div style={{ display: 'flex', marginBottom: '20px', justifyContent: 'center', alignItems: 'center' }}>
                                <Button 
                                    variant={formState === 0 ? "contained" : "outlined"} 
                                    onClick={() => { setFormState(0) }}
                                    sx={{ mr: 1 }}
                                >
                                    Sign In
                                </Button>
                                <Button 
                                    variant={formState === 1 ? "contained" : "outlined"} 
                                    onClick={() => { setFormState(1) }}
                                >
                                    Sign Up
                                </Button>
                            </div>

                            <Box component="form" noValidate sx={{ mt: 1 }}>
                                {formState === 1 ? (
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="name"
                                        label="Full Name"
                                        name="name"
                                        value={name}
                                        autoFocus
                                        onChange={(e) => setName(e.target.value)}
                                        InputProps={{
                                            style: { color: 'white' }
                                        }}
                                        InputLabelProps={{
                                            style: { color: 'rgba(255, 255, 255, 0.7)' }
                                        }}
                                    />
                                ) : null}

                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="username"
                                    label="Username"
                                    name="username"
                                    value={username}
                                    autoFocus={formState === 0}
                                    onChange={(e) => setUsername(e.target.value)}
                                    InputProps={{
                                        style: { color: 'white' }
                                    }}
                                    InputLabelProps={{
                                        style: { color: 'rgba(255, 255, 255, 0.7)' }
                                    }}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    id="password"
                                    InputProps={{
                                        style: { color: 'white' }
                                    }}
                                    InputLabelProps={{
                                        style: { color: 'rgba(255, 255, 255, 0.7)' }
                                    }}
                                />

                                {error && (
                                    <Typography variant="body2" color="error" sx={{ mt: 2, mb: 2 }}>
                                        {error}
                                    </Typography>
                                )}

                                <Button
                                    type="button"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2, py: 1.5 }}
                                    onClick={handleAuth}
                                    disabled={!username.trim() || !password.trim() || (formState === 1 && !name.trim())}
                                >
                                    {formState === 0 ? "Login" : "Register"}
                                </Button>

                                <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                                        {formState === 0 
                                            ? "Don't have an account? " 
                                            : "Already have an account? "}
                                        <Link 
                                            href="#" 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setFormState(formState === 0 ? 1 : 0);
                                            }}
                                            sx={{ color: '#38bdf8' }}
                                        >
                                            {formState === 0 ? "Sign Up" : "Sign In"}
                                        </Link>
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>

                <Snackbar
                    open={open}
                    autoHideDuration={4000}
                    message={message}
                    ContentProps={{
                        style: {
                            background: 'rgba(15, 23, 42, 0.9)',
                            color: 'white',
                            borderRadius: '8px',
                        }
                    }}
                    onClose={() => setOpen(false)}
                />
                
                <Footer />
            </div>
        </ThemeProvider>
    );
}