import { Box, Typography } from "@mui/material";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const palette = {
    primary: "#3D5A80",
    accent: "#98C1D9",
    soft: "#E0FBFC",
  };

  return (
    <Box
      sx={{
        width: "100%",
        mt: 6,
        py: 3,
        textAlign: "center",
        background: `linear-gradient(160deg, ${palette.accent}, ${palette.primary})`,
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
        boxShadow: "0 -4px 14px rgba(0,0,0,0.25)",
      }}
    >
      <Typography
        variant="body2"
        sx={{
          color: "#fff",
          fontWeight: 600,
          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
          letterSpacing: 0.3,
        }}
      >
        © {currentYear} Bibliothek – All rights reserved.
      </Typography>
    </Box>
  );
}