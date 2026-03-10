import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  }));
  
  const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }));
  
  const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
      padding: theme.spacing(1, 1, 1, 0),
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create('width'),
      [theme.breakpoints.up('sm')]: {
        width: '12ch',
        '&:focus': {
          width: '20ch',
        },
      },
    },
  }));

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
          sx={{ flexGrow: 1, fontWeight: 700 }}
        >
          Bibliothek
        </Typography>
    
        <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Suchen..."
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button color="inherit" onClick={goHome}>Home</Button>
          <Button color="inherit" onClick={goBooks}>Bücher</Button>
          <Button color="inherit" onClick={goAdmin}>Admin</Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}