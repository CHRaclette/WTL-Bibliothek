import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useNavigate, useLocation } from "react-router-dom";
import GitHubIcon from "@mui/icons-material/GitHub";
import BugReportIcon from "@mui/icons-material/BugReport";
import React from "react";

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = React.useState<{ id: string; role: string } | null>(null);

  const palette = {
    primary: "#3D5A80",
    accent: "#98C1D9",
    soft: "#E0FBFC",
    ink: "#2B2D42",
  };

  const loadMe = React.useCallback(async () => {
    try {
      const res = await fetch("/api/login/me", { credentials: "include" });
      setUser(res.ok ? await res.json() : null);
    } catch {
      setUser(null);
    }
  }, []);

  React.useEffect(() => {
    loadMe();
  }, [loadMe]);

  React.useEffect(() => {
    loadMe();
  }, [location.pathname, loadMe]);

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    await fetch("/api/login", { method: "DELETE", credentials: "include" });
    setUser(null);
    navigate("/");
  };

  const goHome = () => navigate("/home");
  const goBooks = () => navigate("/books");
  const goAdmin = () => navigate("/admin");
  const goLogin = () => navigate("/");

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        mb: 3,
        background: `linear-gradient(160deg, ${palette.accent}, ${palette.primary})`,
        paddingY: 1,
        boxShadow: "0 4px 18px rgba(0,0,0,0.25)",
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h5"
          onClick={goHome}
          sx={{
            flexGrow: 1,
            fontWeight: 900,
            cursor: "pointer",
            userSelect: "none",
            color: "#fff",
            textShadow: "0 1px 2px rgba(0,0,0,0.3)",
            letterSpacing: 0.5,
            transition: "0.2s",
            "&:hover": {
              opacity: 0.85,
            },
          }}
        >
          Bibliothek
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<GitHubIcon />}
            href="https://github.com/CHRaclette/WTL-Bibliothek"
            target="_blank"
            sx={{
              color: "#fff",
              borderColor: "#ffffffAA",
              borderRadius: 3,
              textTransform: "none",
              "&:hover": {
                borderColor: "#fff",
                backgroundColor: "rgba(255,255,255,0.12)",
              },
            }}
          >
            Repo
          </Button>

          <Button
            variant="outlined"
            startIcon={<BugReportIcon />}
            href="https://github.com/CHRaclette/WTL-Bibliothek/issues"
            target="_blank"
            sx={{
              color: "#fff",
              borderColor: "#ffffffAA",
              borderRadius: 3,
              textTransform: "none",
              "&:hover": {
                borderColor: "#fff",
                backgroundColor: "rgba(255,255,255,0.12)",
              },
            }}
          >
            Bugs
          </Button>

          <Button
            onClick={goHome}
            sx={{
              color: "#fff",
              textTransform: "none",
              borderRadius: 3,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
            }}
          >
            Home
          </Button>

          <Button
            onClick={goBooks}
            sx={{
              color: "#fff",
              textTransform: "none",
              borderRadius: 3,
              "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
            }}
          >
            Bücher
          </Button>

          {isAdmin && (
            <Button
              onClick={goAdmin}
              sx={{
                color: "#fff",
                textTransform: "none",
                borderRadius: 3,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
              }}
            >
              Admin
            </Button>
          )}

          {isLoggedIn ? (
            <Button
              onClick={handleLogout}
              sx={{
                color: "#fff",
                textTransform: "none",
                borderRadius: 3,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
              }}
            >
              Logout
            </Button>
          ) : (
            <Button
              onClick={goLogin}
              sx={{
                color: "#fff",
                textTransform: "none",
                borderRadius: 3,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
              }}
            >
              Login
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}