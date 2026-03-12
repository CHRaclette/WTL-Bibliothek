import { AppRoutes } from "./router/router";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { Box } from "@mui/material";

export default function App() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header />
      <Box sx={{ flexGrow: 1 }}>
        <AppRoutes />
      </Box>
      <Footer />
    </Box>
  );
}