import { useState } from "react";
import { Container, Tabs, Tab, Box, Paper } from "@mui/material";

import AdminBooksPage from "./BooksAdmin";
import AdminAuthorsPage from "./AuthorsAdmin";
import AdminUsersPage from "./UsersAdmin";

export default function AdminPage() {
  const [tab, setTab] = useState(0);

  const palette = {
    primary: "#3D5A80",
    accent: "#98C1D9",
    soft: "#E0FBFC",
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(160deg, ${palette.accent}, ${palette.primary})`,
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={4}
          sx={{
            borderRadius: 4,
            p: 3,
            bgcolor: palette.soft,
            boxShadow: "0 10px 28px rgba(0,0,0,0.25)",
          }}
        >
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              mb: 3,
              "& .MuiTab-root": {
                fontWeight: 700,
                borderRadius: 2,
                textTransform: "none",
                mx: 0.5,
                color: palette.primary,
              },
              "& .Mui-selected": {
                backgroundColor: `${palette.accent}66`,
                color: palette.primary,
              },
              "& .MuiTabs-indicator": {
                height: 0,
              },
            }}
          >
            <Tab label="Bücher" />
            <Tab label="Autoren" />
            <Tab label="Benutzer" />
          </Tabs>

          <Box hidden={tab !== 0}>
            <AdminBooksPage />
          </Box>
          <Box hidden={tab !== 1}>
            <AdminAuthorsPage />
          </Box>
          <Box hidden={tab !== 2}>
            <AdminUsersPage />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}