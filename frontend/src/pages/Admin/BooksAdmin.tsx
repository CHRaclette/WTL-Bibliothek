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
} from "@mui/material";
import { useNavigate } from "react-router-dom";

type Author = { id: number; name: string };

type Book = {
  id: number;
  title: string;
  year: number;
  isbn: string;
  authors?: Author[];       
  authorIds?: number[]; 
};


export default function AdminBooksPage() {
  const navigate = useNavigate();

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const reloadAuthors = async () => {
    try {
      const res = await fetch("/api/authors");
      if (!res.ok) throw new Error("Fehler beim Laden der Autoren");
      setAuthors(await res.json());
    } catch (e: any) {
      console.error(e?.message ?? e);
    }
  };
  
  const openCreateModal = () => {
    reloadAuthors(); 
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
    reloadAuthors();
    setEditMode(true);
    setSelectedBook(book);
    setFieldErrors({});
    setTitle(book.title);
    setYear(String(book.year));
    setIsbn(book.isbn);
  
    const preselected = Array.isArray(book.authors)
      ? book.authors
      : authors.filter(a => book.authorIds?.includes(a.id) ?? false);
  
    setSelectedAuthorList(preselected);
    setOpen(true);
  };

  function formatISBN(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    const p1 = digits.substring(0, 3);
    const p2 = digits.substring(3, 4);
    const p3 = digits.substring(4, 8);
    const p4 = digits.substring(8, 12);
    const p5 = digits.substring(12, 13);

    let f = p1;
    if (p2) f += `-${p2}`;
    if (p3) f += `-${p3}`;
    if (p4) f += `-${p4}`;
    if (p5) f += `-${p5}`;
    return f;
  }
  const filteredBooks = books.filter(b => {
    if (filterTitle.trim() !== "" &&
        !b.title.toLowerCase().includes(filterTitle.toLowerCase())) return false;
  
    if (filterAuthor) {
      const hasAuthor = Array.isArray(b.authors)
        ? b.authors.some(a => a.id === filterAuthor.id)
        : (b.authorIds?.includes(filterAuthor.id) ?? false);
      if (!hasAuthor) return false;
    }
    return true;
  });
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
       setFieldErrors( {title: "Titel ist zu lang"});
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
        }
        return;
      }

      setOpen(false);
      setSuccessMsg(editMode ? "Buch aktualisiert!" : "Buch erstellt!");
      loadData();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deleteBook = async (id: number) => {
    try {
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });

      let json: any = null;
      try {
        json = await res.json();
      } catch {}

      if (!res.ok) {
        if (res.status === 409) {
          const msg = json?.error?.message || "Buch kann nicht gelöscht werden.";
          setDeleteErrorMsg(msg);
          return;
        }

        setError(json?.error?.message || "Fehler beim Löschen");
        return;
      }

      setSuccessMsg("Buch gelöscht!");
      loadData();
    } catch (e: any) {
      setError(e.message);
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
        open={!!deleteErrorMsg}
        autoHideDuration={3000}
        onClose={() => setDeleteErrorMsg(null)}
      >
        <Alert severity="error" variant="filled" onClose={() => setDeleteErrorMsg(null)}>
          <AlertTitle>Aktion nicht möglich</AlertTitle>
          {deleteErrorMsg}
        </Alert>
      </Snackbar>

      <Typography variant="h5">Bücher verwalten</Typography>
      <Paper sx={{ p: 2, my: 2 }}>
  <Stack
    direction={{ xs: "column", sm: "row" }}
    spacing={2}
    alignItems="center"
  >
    <TextField
      label="Titel Suchen"
      value={filterTitle}
      onChange={(e) => setFilterTitle(e.target.value)}
      fullWidth
    />

    <Autocomplete
      options={authors}
      getOptionLabel={(a) => a.name}
      value={filterAuthor}
      onChange={(_, v) => setFilterAuthor(v)}
      renderInput={(params) => (
        <TextField {...params} label="Autor auswählen" />
      )}
      sx={{ width: 250 }}
    />
  </Stack>
</Paper>
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
                  <Button sx={{ mr: 1 }} onClick={() => openEditModal(b)}>
                    Bearbeiten
                  </Button>

                  <Button
                    color="error"
                    onClick={() => {
                      setBookToDelete(b);
                      setDeleteDialogOpen(true);
                    }}
                  >
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
              setIsbn(formatISBN(raw));
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
            onClick={async () => {
              if (!bookToDelete) return;
              await deleteBook(bookToDelete.id);
              setDeleteDialogOpen(false);
              setBookToDelete(null);
            }}
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}