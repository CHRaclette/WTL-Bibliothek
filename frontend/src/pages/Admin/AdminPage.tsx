import { useState } from "react";
import { Container, Tabs, Tab, Box } from "@mui/material";

import AdminBooksPage from "./BooksAdmin";
import AdminAuthorsPage from "./AuthorsAdmin";
import AdminUsersPage from "./UsersAdmin";
import { Navigate } from "react-router-dom";

export default function AdminPage() {
  const [tab, setTab] = useState(0);


  return (
    <Container sx={{ py: 4 }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
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
    </Container>
  );
}