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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

type Author = { id: number; name: string };
type Book = {
  id: number;
  title: string;
  year: number;
  isbn: string;
  authorIds: number[];
};

export default function AdminBooksPage() {
  const navigate = useNavigate();

  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [openError, setOpenError] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [title, setTitle] = useState("");
  const [year, setYear] = useState<string>("");
  const [isbn, setIsbn] = useState<string>("");
  const [selectedAuthorList, setSelectedAuthorList] = useState<Author[]>([]);

  const currentYear = new Date().getFullYear();

  const loadData = async () => {
    setLoading(true);
    try {
      const booksRes = await fetch("/api/books");
      const authorsRes = await fetch("/api/authors");
      if (!booksRes.ok || !authorsRes.ok) throw new Error("Backend error");
      setBooks(await booksRes.json());
      setAuthors(await authorsRes.json());
      setSuccessMsg("Bücher erfolgreich geladen");
    } catch (e: any) {
      setError(e.message);
      setOpenError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  const openEditModal = (book: Book) => {
    setEditMode(true);
    setSelectedBook(book);
    setFieldErrors({});
    setTitle(book.title);
    setYear(String(book.year));
    setIsbn(book.isbn);
    setSelectedAuthorList(authors.filter((a) => book.authorIds.includes(a.id)));
    setOpen(true);
  };

  function formatISBN(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    const p1 = digits.substring(0, 3);
    const p2 = digits.substring(3, 4);
    const p3 = digits.substring(4, 8);
    const p4 = digits.substring(8, 12);
    const p5 = digits.substring(12, 13);

    let formatted = p1;
    if (p2) formatted += `-${p2}`;
    if (p3) formatted += `-${p3}`;
    if (p4) formatted += `-${p4}`;
    if (p5) formatted += `-${p5}`;

    return formatted;
  }

  const saveBook = async () => {
    setFieldErrors({});

    if (year.length !== 4 || Number(year) > currentYear) {
      setError(`Jahr muss 4-stellig und ≤ ${currentYear} sein.`);
      setOpenError(true);
      return;
    }

    if (isbn.replace(/\D/g, "").length !== 13) {
      setError(`ISBN muss 13 Ziffern enthalten.`);
      setOpenError(true);
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
      });

      const json = await res.json();

      if (!res.ok) {
        if (json?.error?.details?.fieldErrors) {
          setFieldErrors(json.error.details.fieldErrors);
        } else {
          setError(json.error?.message || "Fehler beim Speichern");
          setOpenError(true);
        }
        return;
      }

      setOpen(false);
      setSuccessMsg(editMode ? "Buch aktualisiert!" : "Buch erstellt!");
      loadData();
    } catch (e: any) {
      setError(e.message);
      setOpenError(true);
    }
  };

  const deleteBook = async (id: number) => {
    try {
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Fehler beim Löschen");
      setSuccessMsg("Buch gelöscht!");
      loadData();
    } catch (e: any) {
      setError(e.message);
      setOpenError(true);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <>
      <Snackbar
        open={!!successMsg}
        autoHideDuration={2000}
        onClose={() => setSuccessMsg(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSuccessMsg(null)}>
          <AlertTitle>Erfolg</AlertTitle>
          {successMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={openError}
        autoHideDuration={2000}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setOpenError(false);
          navigate("/admin");
        }}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => {
            setOpenError(false);
            navigate("/admin");
          }}
        >
          <AlertTitle>Fehler</AlertTitle>
          {error ?? "Unbekannter Fehler"}
        </Alert>
      </Snackbar>

      <Typography variant="h5">Bücher verwalten</Typography>

      <Button variant="contained" sx={{ my: 2 }} onClick={openCreateModal}>
        Neues Buch erstellen
      </Button>

      <TableContainer component={Paper} sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titel</TableCell>
              <TableCell>ISBN</TableCell>
              <TableCell>Jahr</TableCell>
              <TableCell>Autoren</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.title}</TableCell>
                <TableCell>{b.isbn}</TableCell>
                <TableCell>{b.year}</TableCell>
                <TableCell>
                  {b.authorIds
                    .map((id) => authors.find((a) => a.id === id)?.name)
                    .filter(Boolean)
                    .join(", ")}
                </TableCell>
                <TableCell>
                  <Button sx={{ mr: 1 }} onClick={() => openEditModal(b)}>
                    Bearbeiten
                  </Button>
                  <Button color="error" onClick={() => deleteBook(b.id)}>
                    Löschen
                  </Button>
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

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editMode ? "Buch bearbeiten" : "Neues Buch erstellen"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Titel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!fieldErrors.title}
            helperText={fieldErrors.title}
            sx={{ mt: 1 }}
          />

          <TextField
            fullWidth
            label="Jahr"
            value={year}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
              setYear(raw);
            }}
            inputProps={{ maxLength: 4 }}
            error={!!fieldErrors.year}
            helperText={fieldErrors.year}
            sx={{ mt: 2 }}
          />

          <TextField
            fullWidth
            label="ISBN"
            value={isbn}
            onChange={(e) => {
              const raw = e.target.value.replace(/\D/g, "");
              const formatted = formatISBN(raw);
              setIsbn(formatted);
            }}
            inputProps={{ maxLength: 17 }}
            error={!!fieldErrors.isbn}
            helperText={fieldErrors.isbn}
            sx={{ mt: 2 }}
          />

          <Autocomplete
            multiple
            options={authors}
            getOptionLabel={(a) => a.name}
            value={selectedAuthorList}
            onChange={(_, v) => setSelectedAuthorList(v)}
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
          <Button variant="contained" onClick={saveBook}>
            {editMode ? "Speichern" : "Erstellen"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}