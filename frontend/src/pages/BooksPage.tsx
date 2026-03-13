import { useState, useEffect, useMemo } from 'react';
import AlertTitle from '@mui/material/AlertTitle';
import Snackbar from '@mui/material/Snackbar';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Typography,
  TextField,
  Paper,
  Stack,
  Autocomplete,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { BookCard } from '../components/BookCard';
import { Navigate, useNavigate } from 'react-router-dom';
import React from 'react';
type Author = {
  id: number;
  name: string;
};

type Book = {
  id: number;
  title: string;
  year: number;
  isbn: string;
  authorIds: number[];
  authors?: Author[];
};


function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterTitle, setFilterTitle] = useState('');
  const [filterAuthor, setFilterAuthor] = useState<Author | null>(null);
  const [user, setUser] = React.useState<{ id: string; role: string } | null>(null);
  const isLoggedIn = user?.role != null;
  if (isLoggedIn) {
    return <Navigate to="/" />;
  }

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const bRes = await fetch('/api/books');
        const aRes = await fetch('/api/authors');

        if (!bRes.ok || !aRes.ok) throw new Error('Backend Error');

        const booksData = await bRes.json();
        const authorsData = await aRes.json();

        if (!cancelled) {
          setBooks(booksData);
          setAuthors(authorsData);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? 'Unknown error');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredBooks = books.filter(b => {
    if (filterTitle.trim() !== "" &&
        !b.title.toLowerCase().includes(filterTitle.toLowerCase())) {
      return false;
    }
  
    if (filterAuthor) {
      const hasAuthor = Array.isArray(b.authors)
        ? b.authors.some(a => a.id === filterAuthor.id)
        : (b.authorIds?.includes(filterAuthor.id) ?? false);
  
      if (!hasAuthor) return false;
    }
  
    return true;
  });
  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
          Bücher Übersicht
        </Typography>

  
        <Paper sx={{ p: 2, mb: 3}}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Titel suchen"
              value={filterTitle}
              onChange={(e) => setFilterTitle(e.target.value)}
            />

            <Autocomplete
              options={authors}
              value={filterAuthor}
              onChange={(_, author) => setFilterAuthor(author)}
              getOptionLabel={(a) => a.name}
              renderInput={(params) => (
                <TextField {...params} label="Autor wählen" />
              )}
              fullWidth
            />
          </Stack>
        </Paper>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>Fehler</AlertTitle>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
            {filteredBooks.length === 0 ? (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <AlertTitle>Hinweis</AlertTitle>
                Keine Bücher gefunden.
              </Alert>
            ) : (
              <Grid container spacing={2}>
                {filteredBooks.map((book) => (
                  <Grid key={book.id}>
                    <BookCard book={book} />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Container>
    </>
  );
}

export default BooksPage;