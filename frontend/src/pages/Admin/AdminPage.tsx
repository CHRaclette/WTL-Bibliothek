import { useState } from "react";
import { Container, Tabs, Tab, Box } from "@mui/material";

import AdminBooksPage from "./BooksAdmin";
import AdminAuthorsPage from "./AuthorsAdmin";

export default function AdminPage() {
  const [tab, setTab] = useState(0);

  return (
    <Container sx={{ py: 4 }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Bücher" />
        <Tab label="Autoren" />
      </Tabs>

      <Box hidden={tab !== 0}>
        <AdminBooksPage />
      </Box>

      <Box hidden={tab !== 1}>
        <AdminAuthorsPage />
      </Box>
    </Container>
  );
}