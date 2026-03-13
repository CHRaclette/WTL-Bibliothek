import * as React from "react";
import { useEffect, useMemo, useState } from "react";
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
  Grid,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocalLibraryIcon from "@mui/icons-material/LocalLibrary";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import { Link as RouterLink } from "react-router-dom";

type Book = {
  id: number;
  title: string;
};

export function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/books", { credentials: "include" });
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

  const palette = {
    primary: "#3D5A80",     
    accent: "#98C1D9",    
    soft: "#E0FBFC",        
    pop: "#EE6C4D",         
    ink: "#2B2D42",         
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(160deg, ${palette.accent} 0%, ${palette.primary} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              bgcolor: palette.soft,
              borderRadius: 4,
              p: 4,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            <Typography variant="h4" fontWeight={900} color={palette.primary} sx={{ mb: 2 }}>
              😴 Bibliothek lädt…
            </Typography>
            <Stack spacing={2}>
              <Skeleton variant="rounded" height={52} />
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} elevation={2} sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={28} />
                    <Skeleton variant="text" width="40%" />
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(160deg, ${palette.accent} 0%, ${palette.primary} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Container maxWidth="sm">
          <Box
            sx={{
              bgcolor: palette.soft,
              p: 4,
              borderRadius: 4,
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            }}
          >
            <Alert severity="error">
              <AlertTitle>Fehler</AlertTitle>
              {error}
            </Alert>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(160deg, ${palette.accent} 0%, ${palette.primary} 100%)`,
        py: { xs: 4, md: 8 },
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        {/* Hero */}
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
          <Box
            sx={{
              position: "absolute",
              right: -20,
              bottom: -20,
              fontSize: { xs: "3.5rem", md: "5rem" },
              opacity: 0.18,
              userSelect: "none",
            }}
          >
            💤
          </Box>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography
                variant="h3"
                fontWeight={900}
                color={palette.primary}
                sx={{ textShadow: "0 1px 2px rgba(0,0,0,0.2)" }}
              >
                Bibliothek
              </Typography>
              <Typography variant="subtitle1" color={alpha(palette.ink, 0.8)}>
                Finde schnell deine Titel.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Chip
                icon={<LocalLibraryIcon />}
                label={`${books.length} Titel`}
                sx={{
                  bgcolor: alpha(palette.primary, 0.08),
                  color: palette.primary,
                  borderRadius: 2,
                  fontWeight: 700,
                }}
              />
              <Chip
                icon={<StarRoundedIcon />}
                label={`${filteredBooks.length} sichtbar`}
                sx={{
                  bgcolor: alpha(palette.pop, 0.12),
                  color: palette.pop,
                  borderRadius: 2,
                  fontWeight: 700,
                }}
              />
              <Chip
                icon={<FavoriteRoundedIcon />}
                label="Leselaune: hoch"
                sx={{
                  bgcolor: alpha(palette.accent, 0.2),
                  color: palette.primary,
                  borderRadius: 2,
                  fontWeight: 700,
                }}
              />
            </Stack>
          </Stack>

          <TextField
            fullWidth
            placeholder="Nach Titel suchen…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            sx={{
              mt: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: "#fff",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                "&:hover fieldset": { borderColor: alpha(palette.primary, 0.4) },
                "&.Mui-focused fieldset": { borderColor: palette.primary, borderWidth: 2 },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon htmlColor={alpha(palette.primary, 0.9)} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Liste */}
        <Box sx={{ mt: 4 }}>
          {books.length === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <AlertTitle>Hinweis</AlertTitle>
              Es sind aktuell keine Bücher vorhanden.
            </Alert>
          )}

          {filteredBooks.length > 0 && (
            <Grid container spacing={2}>
              {filteredBooks.map((book) => {
                const title = book.title ?? "";
                return (
                  <Grid key={book.id}>
                    <Card
                      elevation={0}
                      sx={{
                        borderRadius: 4,
                        backgroundColor: "#fff",
                        boxShadow:
                          "0 2px 8px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
                        transition: "transform 0.18s ease, box-shadow 0.18s ease",
                        "&:hover": {
                          transform: "translateY(-3px)",
                          boxShadow:
                            "0 10px 24px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.08)",
                        },
                      }}
                    >
                      <CardActionArea
                        component={RouterLink}
                        to={`/books/${book.id}`}
                        sx={{ p: 2.25 }}
                      >
                        <Tooltip title={title} placement="top" enterDelay={500}>
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 800,
                                minHeight: 56,
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                color: palette.primary,
                              }}
                            >
                              {title}
                            </Typography>
                          </Box>
                        </Tooltip>

                        <Typography
                          variant="body2"
                          color={alpha(palette.ink, 0.7)}
                          sx={{ mt: 0.5 }}
                        >
                          Weitere Details ansehen →
                        </Typography>
                      </CardActionArea>

                      <Divider sx={{ opacity: 0.25 }} />
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {filteredBooks.length === 0 && books.length > 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <AlertTitle>Keine Treffer</AlertTitle>
              Kein Buch passt zu deiner Suche.
            </Alert>
          )}
        </Box>
      </Container>
    </Box>
  );
}
