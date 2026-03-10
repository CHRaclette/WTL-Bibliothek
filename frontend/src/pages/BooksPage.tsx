import { useState, useEffect } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Container,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { BookCard } from '../components/BookCard';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/books'); 
        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const problem = await res.json();
            msg = problem?.error?.message || msg;
          } catch {}
          throw new Error(msg);
        }
        const data: Book[] = await res.json();
        if (!cancelled) setBooks(data);
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

  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 3 }}>
          Bücher
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <>
            {books.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                Keine Bücher vorhanden.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {books.map((book) => (
                  <Grid key={book.id} item xs={12} sm={6} md={4} lg={3}>
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