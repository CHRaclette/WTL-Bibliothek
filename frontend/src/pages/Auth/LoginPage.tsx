import * as React from "react";
import { Box, Button, TextField, Paper, Typography, Alert, IconButton, InputAdornment } from "@mui/material";
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
          (res.status === 401 ? "Ungültige Anmeldedaten." : "Login fehlgeschlagen.");
        setErrorMsg(msg);
        return;
      }

     
      const { id, role } = json || {};

      if (!role) {
        setErrorMsg("Unerwartete Antwort vom Server (keine Rolle).");
        return;
      }

      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/Home");
      }
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Netzwerk-/Serverfehler beim Login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
      }}
    >
      <Paper elevation={4} sx={{ p: 4, width: "100%", maxWidth: 400, borderRadius: 3 }}>
        <form  onSubmit={handleSubmit}>
          <Typography variant="h5" fontWeight={700} textAlign="center" mb={3}>
            Login
          </Typography>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <TextField
            label="Username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoFocus
          />

          <TextField
            label="Password"
            name="password"
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPwd ? "Passwort ausblenden" : "Passwort anzeigen"}
                    onClick={() => setShowPwd((s) => !s)}
                    edge="end"
                  >
                    {showPwd ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }} disabled={loading}>
            {loading ? "Wird angemeldet…" : "Login"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
