import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';


export function Header() {
  const navigate = useNavigate();

  const goHome = () => navigate("/");
  const goBooks = () => navigate("/books");
  const goAdmin = () => navigate("/admin");

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      
      <Toolbar>
    
        <Typography
          variant="h6"
          onClick={goHome}
         
          sx={{ flexGrow: 1, fontWeight: 700, cursor: "pointer" }}
        >
          Bibliothek
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button color="inherit" onClick={goHome}>Home</Button>
          <Button color="inherit" onClick={goBooks}>Bücher</Button>
          <Button color="inherit" onClick={goAdmin}>Admin</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}