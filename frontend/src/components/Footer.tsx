import { Box, Typography } from "@mui/material";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    
<Box

  sx={{
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    py: 2,
    textAlign: "center",
    borderTop: "1px solid",
    borderColor: "divider",
    backgroundColor: "background.paper",
    zIndex: 1000
  }}
>
  <Typography variant="body2" color="text.secondary">
    © {currentYear} Bibliothek - All rights reserved.
  </Typography>
</Box>

)
}