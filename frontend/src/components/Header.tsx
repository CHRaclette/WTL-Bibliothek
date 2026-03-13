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
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar sx={{ display: "flex", alignItems: "center" }}>
        <Typography
          variant="h6"
          onClick={goHome}
          sx={{ flexGrow: 1, fontWeight: 700, cursor: "pointer", userSelect: "none" }}
        >
          Bibliothek
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<GitHubIcon />}
            href="https://github.com/CHRaclette/WTL-Bibliothek"
            target="_blank"

          >
            Repo
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<BugReportIcon />}
            href="https://github.com/CHRaclette/WTL-Bibliothek/issues"
            target="_blank"
          >
            Bugs
          </Button>

          <Button color="inherit" onClick={goHome}>Home</Button>
          <Button color="inherit" onClick={goBooks}>Bücher</Button>

          {isAdmin && (
            <Button color="inherit" onClick={goAdmin}>Admin</Button>
          )}

          {isLoggedIn ? (
            <Button color="inherit" onClick={handleLogout}>Logout</Button>
          ) : (
            <Button color="inherit" onClick={goLogin}>Login</Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
