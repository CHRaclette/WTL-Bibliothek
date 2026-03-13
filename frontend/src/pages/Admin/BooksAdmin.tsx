import { useEffect, useState } from "react";
import {
  Typography,
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  AlertTitle,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  Stack,
  Box,
  CircularProgress,
  Container
} from "@mui/material";
import { Navigate, useNavigate } from "react-router-dom";

type Author = { id: number; name: string };
type Book = { id: number; title: string; year: number; isbn: string; authors?: Author[]; authorIds?: number[] };

export default function AdminBooksPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState<{ id: string; role: string } | null>(null);
  const [checking, setChecking] = useState(true);

  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [title, setTitle] = useState("");
  const [year, setYear] = useState<string>("");
  const [isbn, setIsbn] = useState<string>("");
  const [selectedAuthorList, setSelectedAuthorList] = useState<Author[]>([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const [filterTitle, setFilterTitle] = useState("");
  const [filterAuthor, setFilterAuthor] = useState<Author | null>(null);

  const currentYear = new Date().getFullYear();

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
    if (user.role !== "admin") return;

    let cancel = false;

    (async () => {
      setLoading(true);
      try {
        const booksRes = await fetch("/api/books", { credentials: "include" });
        const authorsRes = await fetch("/api/authors", { credentials: "include" });

        if (booksRes.status === 401 || booksRes.status === 403) {
          navigate("/login", { replace: true });
          return;
        }

        if (!booksRes.ok || !authorsRes.ok) throw new Error("Backend Fehler");

        if (!cancel) {
          setBooks(await booksRes.json());
          setAuthors(await authorsRes.json());
        }
      } catch (e: any) {
        if (!cancel) setError(e.message);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => { cancel = true };
  }, [checking, user, navigate]);

  if (checking) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/Home" replace />;

  const filteredBooks = books.filter((b) => {
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

  const openCreateModal = () => {
    setEditMode(false);
    setSelectedBook(null);
    setFieldErrors({});
    setTitle("");
    setYear("");
    setIsbn("");
    setSelectedAuthorList([]);
    setOpen(true);
  };

  const openEditModal = (b: Book) => {
    setEditMode(true);
    setSelectedBook(b);
    setFieldErrors({});
    setTitle(b.title);
    setYear(String(b.year));
    setIsbn(b.isbn);
    setSelectedAuthorList(Array.isArray(b.authors) ? b.authors : []);
    setOpen(true);
  };

  const saveBook = async () => {
    setFieldErrors({});

    if (year.length !== 4 || Number(year) > currentYear) {
      setFieldErrors({ year: `Jahr muss 4-stellig und ≤ ${currentYear} sein.` });
      return;
    }

    if (isbn.replace(/\D/g, "").length !== 13) {
      setFieldErrors({ isbn: "ISBN muss 13 Ziffern enthalten." });
      return;
    }

    if (title.length >= 100) {
      setFieldErrors({ title: "Titel ist zu lang" });
      return;
    }

    if (selectedAuthorList.length === 0) {
      setFieldErrors({ authorIds: "Bitte mindestens einen Autor auswählen." });
      return;
    }

    const body = {
      title,
      year: Number(year),
      isbn,
      authorIds: selectedAuthorList.map((a) => a.id),
    };

    try {
      const url = editMode ? `/api/books/${selectedBook!.id}` : "/api/books";
      const method = editMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      const json = await res.json();

      if (!res.ok) {
        if (json?.error?.details?.fieldErrors) {
          setFieldErrors(json.error.details.fieldErrors);
        } else {
          setError(json.error?.message || "Fehler beim Speichern");
        }
        return;
      }

      setOpen(false);
      setSuccessMsg(editMode ? "Buch aktualisiert!" : "Buch erstellt!");
      window.location.reload();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deleteBook = async (id: number) => {
    try {
      const res = await fetch(`/api/books/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      let json: any = null;
      try { json = await res.json() } catch {}

      if (!res.ok) {
        if (res.status === 409) {
          setDeleteErrorMsg(json?.error?.message || "Buch kann nicht gelöscht werden.");
          return;
        }
        setError(json?.error?.message || "Fehler beim Löschen");
        return;
      }

      setSuccessMsg("Buch gelöscht!");
      window.location.reload();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: "100vh",
        background: `linear-gradient(160deg, ${palette.accent}, ${palette.primary})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${palette.accent}, ${palette.primary})`,
      py: 6,
      px: 2
    }}>
      <Container maxWidth="lg">

        <Typography variant="h4" fontWeight={900} color="#fff" sx={{ mb: 3 }}>
          Bücher verwalten
        </Typography>

        <Box sx={{
          bgcolor: palette.soft,
          borderRadius: 4,
          p: 3,
          boxShadow: "0 8px 24px rgba(0,0,0,0.25)"
        }}>

<Paper
  sx={{
    p: 2,
    mb: 3,
    borderRadius: 3,
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.09)",
  }}
>
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={2}
    alignItems="center"
  >
    <TextField
      fullWidth
      label="Titel suchen"
      value={filterTitle}
      onChange={(e) => setFilterTitle(e.target.value)}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 3,
          backgroundColor: "#fff",
        },
      }}
    />

    <Autocomplete
      options={authors}
      value={filterAuthor}
      onChange={(_, v) => setFilterAuthor(v)}
      getOptionLabel={(a) => a.name}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Autor auswählen"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: "#fff",
            },
          }}
        />
      )}
      sx={{
        width: 260,
      }}
    />
  </Stack>
</Paper>

          <Button
            variant="contained"
            onClick={openCreateModal}
            sx={{
              mb: 3,
              borderRadius: 3,
              py: 1.2,
              backgroundColor: palette.primary,
              "&:hover": { backgroundColor: "#2b3f59" }
            }}
          >
            Neues Buch erstellen
          </Button>

          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Titel</strong></TableCell>
                  <TableCell><strong>ISBN</strong></TableCell>
                  <TableCell><strong>Jahr</strong></TableCell>
                  <TableCell><strong>Autoren</strong></TableCell>
                  <TableCell><strong>Aktionen</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredBooks.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.title}</TableCell>
                    <TableCell>{b.isbn}</TableCell>
                    <TableCell>{b.year}</TableCell>
                    <TableCell>
                      {Array.isArray(b.authors)
                        ? b.authors.map(a => a.name).join(", ")
                        : "Keine Autoren"}
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          onClick={() => openEditModal(b)}
                          variant="outlined"
                          sx={{ borderRadius: 2 }}
                        >
                          Bearbeiten
                        </Button>

                        <Button
                          color="error"
                          variant="contained"
                          onClick={() => {
                            setBookToDelete(b);
                            setDeleteDialogOpen(true);
                          }}
                          sx={{ borderRadius: 2 }}
                        >
                          Löschen
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

                {books.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Alert severity="info">Keine Bücher vorhanden.</Alert>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Container>

      {/* Dialogs */}

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editMode ? "Buch bearbeiten" : "Neues Buch erstellen"}</DialogTitle>
        <DialogContent>

          <TextField fullWidth label="Titel" value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!fieldErrors.title}
            helperText={fieldErrors.title}
            sx={{ mt: 2 }}
          />

          <TextField fullWidth label="Jahr" value={year}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
              setYear(raw);
            }}
            error={!!fieldErrors.year}
            helperText={fieldErrors.year}
            sx={{ mt: 2 }}
          />

          <TextField fullWidth label="ISBN" value={isbn}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              setIsbn(raw);
            }}
            error={!!fieldErrors.isbn}
            helperText={fieldErrors.isbn}
            sx={{ mt: 2 }}
          />

          <Autocomplete
            multiple
            options={authors}
            value={selectedAuthorList}
            onChange={(_, v) => setSelectedAuthorList(v)}
            getOptionLabel={(a) => a.name}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Autoren auswählen"
                error={!!fieldErrors.authorIds}
                helperText={fieldErrors.authorIds}
                sx={{ mt: 2 }}
              />
            )}
          />

        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={saveBook}>Speichern</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Buch löschen?</DialogTitle>
        <DialogContent>
          Möchtest du das Buch <strong>{bookToDelete?.title}</strong> wirklich löschen?
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              if (!bookToDelete) return;
              deleteBook(bookToDelete.id);
              setDeleteDialogOpen(false);
            }}
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}