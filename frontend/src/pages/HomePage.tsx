import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Typography, CircularProgress, Box } from "@mui/material";

import { Alert, AlertTitle } from "@mui/material";
type Book = {
  id: number;
  title: string;
};

export function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  
    const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(query.toLowerCase())
  );
  
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/books");
        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const problem = await res.json();
            msg = problem?.error?.message || msg;
          } catch {}
          throw new Error(msg);
        }
        const data: Book[] = await res.json();
        setBooks(data);
      } catch (e: any) {
        setError(e.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );


    if (error)
        return (
          <Container sx={{ py: 3 }}>
            <Alert severity="error">
            <AlertTitle>Fehler</AlertTitle>
            {error}
            </Alert>
            
          </Container>
        );
      

  return (
    <Container sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
        Bücher Übersicht
      </Typography>
      
      {books.length === 0 && (
  <>

    <Alert severity="warning" sx={{ mt: 2 }}>
      <AlertTitle>Hinweis</AlertTitle>
      Es sind aktuell keine Bücher vorhanden.
    </Alert>
  </>
)}
      {books.length > 0 &&
        books.map((book) => (
          <Typography
            key={book.id}
            component={Link}
            to={`/books/${book.id}`}
            sx={{
              fontSize: "1.2rem",
              mb: 2,
              display: "block",
              width: "fit-content",
              textDecoration: "none",
              color: "primary.main",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {book.title}
          </Typography>
        ))}
    </Container>
  );
}