import { useState, useEffect, useMemo } from "react";
import {
  Typography,
  Paper,
  TextField,
  Autocomplete,
  Stack,
  Box,
  CircularProgress,
  Alert,
  AlertTitle,
  Container,
  InputAdornment
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SearchIcon from "@mui/icons-material/Search";
import { Navigate } from "react-router-dom";
import { BookCard } from "../components/BookCard";

type Author = { id: number; name: string };
type Book = { id: number; title: string; year: number; isbn: string; authorIds: number[]; authors?: Author[] };

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterTitle, setFilterTitle] = useState("");
  const [filterAuthor, setFilterAuthor] = useState<Author | null>(null);

  const [user, setUser] = useState<{ id: string; role: string } | null>(null);
  const [checking, setChecking] = useState(true);

  const palette = {
    primary: "#3D5A80",
    accent: "#98C1D9",
    soft: "#E0FBFC",
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/login/me", { credentials: "include" });
        if (res.ok) setUser(await res.json());
        else setUser(null);
      } catch {
        setUser(null);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (checking) return;
    if (!user) return;

    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const bRes = await fetch("/api/books", { credentials: "include" });
        const aRes = await fetch("/api/authors", { credentials: "include" });

        if (!bRes.ok || !aRes.ok) throw new Error("Backend Error");

        const booksData = await bRes.json();
        const authorsData = await aRes.json();

        if (!cancelled) {
          setBooks(booksData);
          setAuthors(authorsData);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Unknown error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [checking, user]);

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      if (filterTitle.trim() && !b.title.toLowerCase().includes(filterTitle.toLowerCase()))
        return false;

      if (filterAuthor) {
        const has = Array.isArray(b.authors)
          ? b.authors.some((a) => a.id === filterAuthor.id)
          : b.authorIds?.includes(filterAuthor.id);

        if (!has) return false;
      }
      return true;
    });
  }, [books, filterTitle, filterAuthor]);

  if (checking) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(160deg, ${palette.accent}, ${palette.primary})`,
        py: { xs: 4, md: 7 },
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            bgcolor: palette.soft,
            borderRadius: 5,
            p: { xs: 3, md: 5 },
            boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Typography
            variant="h3"
            fontWeight={900}
            color={palette.primary}
            sx={{ mb: 2 }}
          >
            Alle Bücher
          </Typography>

          <Paper sx={{ p: 2, mb: 2 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Titel suchen"
                value={filterTitle}
                onChange={(e) => setFilterTitle(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ opacity: 0.7 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Autocomplete
                options={authors}
                value={filterAuthor}
                onChange={(_, v) => setFilterAuthor(v)}
                getOptionLabel={(a) => a.name}
                renderInput={(params) => (
                  <TextField {...params} label="Autor wählen" />
                )}
                fullWidth
              />
            </Stack>
          </Paper>
        </Box>

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            <AlertTitle>Fehler</AlertTitle>
            {error}
          </Alert>
        )}

        {!loading && !error && filteredBooks.length === 0 && (
          <Alert severity="warning" sx={{ mt: 3 }}>
            <AlertTitle>Keine Treffer</AlertTitle>
            Kein Buch passt zur Suche.
          </Alert>
        )}

        {!loading && !error && (
          <Grid container spacing={3} sx={{ mt: 3 }}>
            {filteredBooks.map((book) => (
              <Grid key={book.id}>
                <BookCard book={book} />
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}