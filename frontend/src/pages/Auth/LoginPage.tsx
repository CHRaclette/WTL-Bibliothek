import * as React from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPwd, setShowPwd] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg("Bitte Benutzername und Passwort eingeben.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          json?.error?.message ||
          json?.message ||
          (res.status === 401
            ? "Ungültige Anmeldedaten."
            : "Login fehlgeschlagen.");
        setErrorMsg(msg);
        return;
      }

      const { role } = json || {};

      if (role === "admin") navigate("/admin");
      else navigate("/Home");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Serverfehler beim Login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
       
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 420,
          borderRadius: 5,
          backgroundColor: "#E0FBFC",
          boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
          position: "relative",
          overflow: "hidden",
        }}
      >

        <Typography
          variant="h4"
          fontWeight={900}
          textAlign="center"
          sx={{
            mb: 1,
            color: "#3D5A80",
            textShadow: "0px 1px 2px rgba(0,0,0,0.3)",
          }}
        >
          Login
        </Typography>

        <Typography
          textAlign="center"
          sx={{ mb: 3, opacity: 0.8, color: "#3D5A80" }}
        >
          Wake up the system with your credentials!
        </Typography>

        {errorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMsg}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoFocus
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
          />

          <TextField
            label="Password"
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="new-password"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPwd ? "Passwort ausblenden" : "Passwort anzeigen"
                    }
                    onClick={() => setShowPwd((s) => !s)}
                    edge="end"
                  >
                    {showPwd ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              mt: 3,
              py: 1.2,
              fontSize: "1.1rem",
              fontWeight: 700,
              borderRadius: 3,
              backgroundColor: "#3D5A80",
              "&:hover": { backgroundColor: "#293C55" },
              transition: "0.2s",
            }}
          >
            {loading ? "Wird angemeldet…" : "Login"}
          </Button>
        </form>

      
        <Box
          sx={{
            position: "absolute",
            bottom: -20,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "4rem",
            opacity: 0.25,
          }}
        >
          💤
        </Box>
      </Paper>
    </Box>
  );
}