import { useEffect, useMemo, useState } from "react";
import { Navigate, redirect, Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  TextField,
  Alert,
  AlertTitle,
  InputAdornment,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  Chip,
  Tooltip,
  Skeleton,
  Stack,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import React from "react";

type Book = {
  id: number;
  title: string;
};

export function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const navigate = useNavigate();
  const [user, setUser] = React.useState<{ id: string; role: string } | null>(null);
  const isLoggedIn = user?.role != null;
  if (isLoggedIn) {
    return <Navigate to="/" />;
  }
  
  async function checkLogin() {
    try {
      const res = await fetch("/api/login/", { credentials: "include" });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }



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
        setBooks(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter((b) => b.title.toLowerCase().includes(q));
  }, [books, query]);


  if (loading) {
    return (
      <Container sx={{ py: 3 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
          Titel Übersicht
        </Typography>

        <TextField
          fullWidth
          label="Nach Titel suchen"
          placeholder="Titel Suchen"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="disabled" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        <Stack spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Skeleton variant="text" width="70%" height={28} />
                <Skeleton variant="text" width="40%" />
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 3 }}>
        <Alert severity="error">
          <AlertTitle>Fehler</AlertTitle>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 3 }}>
   
      <Box
        sx={{
          mb: 2.5,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Titel Übersicht
        </Typography>

        <Chip
          label={
            books.length > 0
              ? `${filteredBooks.length} von ${books.length} Titel`
              : "0 Titel"
          }
          color="default"
          size="small"
          sx={{ alignSelf: "center" }}
        />
      </Box>

   
      <TextField
        fullWidth
        label="Nach Titel suchen"
        placeholder="Titel Suchen"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
         
        }}
        sx={{ mb: 3 }}
      />

    
      {books.length === 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <AlertTitle>Hinweis</AlertTitle>
          Es sind aktuell keine Bücher vorhanden.
        </Alert>
      )}

      {filteredBooks.length > 0 && (
        <Stack spacing={1.5}>
          {filteredBooks.map((book) => {
            const title = book.title ?? "";
        
            const Title = (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {title}
              </Typography>
            );

            return (
              <Card
                key={book.id}
                elevation={2}
                sx={{
                  borderRadius: 2,
                  transition: "transform 0.18s ease, box-shadow 0.18s ease",
                  "&:hover": { transform: "translateY(-2px)", boxShadow: 4 },
                }}
              >
                <CardActionArea
                  component={RouterLink}
                  to={`/books/${book.id}`}
                  sx={{ p: 2 }}
                >
                  <Tooltip title={title} placement="top" enterDelay={500}>
                    <Box>{Title}</Box>
                  </Tooltip>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Weitere Details ansehen →
                  </Typography>
                </CardActionArea>

                <Divider sx={{ opacity: 0.3 }} />
              </Card>
            );
          })}
        </Stack>
      )}

      {filteredBooks.length === 0 && books.length > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <AlertTitle>Keine Treffer</AlertTitle>
          Kein Buch passt zu deiner Suche.
        </Alert>
      )}
    </Container>
  );
}
