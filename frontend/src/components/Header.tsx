import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import GitHubIcon from "@mui/icons-material/GitHub";
import BugReportIcon from "@mui/icons-material/BugReport";

export function Header() {
  const navigate = useNavigate();

  const goHome = () => navigate("/");
  const goBooks = () => navigate("/books");
  const goAdmin = () => navigate("/admin");

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar sx={{ display: "flex", alignItems: "center" }}>
        
        <Typography
          variant="h6"
          onClick={goHome}
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            cursor: "pointer",
            userSelect: "none",
          }}
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
            rel="noopener noreferrer"
            sx={{
              borderColor: "rgba(255,255,255,0.5)",
              "&:hover": { borderColor: "white", backgroundColor: "rgba(255,255,255,0.1)" }
            }}
          >
            Repo
          </Button>

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<BugReportIcon />}
            href="https://github.com/CHRaclette/WTL-Bibliothek/issues"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              borderColor: "rgba(255,255,255,0.5)",
              "&:hover": { borderColor: "white", backgroundColor: "rgba(255,255,255,0.1)" }
            }}
          >
            Bugs
          </Button>

          <Button color="inherit" onClick={goHome}>Home</Button>
          <Button color="inherit" onClick={goBooks}>Bücher</Button>
          <Button color="inherit" onClick={goAdmin}>Admin</Button>
        </Box>

      </Toolbar>
    </AppBar>
  );
}