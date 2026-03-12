import { Box, Typography, Link } from "@mui/material";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      sx={{
        width: "100%",
        py: 2,
        mt: "auto",
        textAlign: "center",
        borderTop: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {currentYear} Bibliothek – All rights reserved.
      </Typography>
    </Box>
  );
}