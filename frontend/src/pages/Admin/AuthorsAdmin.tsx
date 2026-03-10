import { useEffect, useState } from "react";
import {
  Typography,
  Alert,
  Snackbar,
  AlertTitle,
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";

type Author = { id: number; name: string };

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [authorName, setAuthorName] = useState("");

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const closeSnackbar = () => setSuccessMsg(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/authors");
      if (!res.ok) throw new Error("Backend Error");
      setAuthors(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditMode(false);
    setSelectedAuthor(null);
    setAuthorName("");
    setOpen(true);
  };

  const openEdit = (a: Author) => {
    setEditMode(true);
    setSelectedAuthor(a);
    setAuthorName(a.name);
    setOpen(true);
  };

  const saveAuthor = async () => {
    try {
      const url = editMode
        ? `/api/authors/${selectedAuthor!.id}`
        : `/api/authors`;
      const method = editMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: authorName }),
      });

      if (!res.ok) throw new Error("Fehler beim Speichern");

      setOpen(false);
      setSuccessMsg(editMode ? "Autor aktualisiert!" : "Autor erstellt!");
      loadData();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deleteAuthor = async (id: number) => {
    try {
      const res = await fetch(`/api/authors/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Fehler beim Löschen");
      setSuccessMsg("Autor gelöscht!");
      loadData();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error)
    return (
      <Alert severity="error">
        <AlertTitle>Fehler</AlertTitle>
        {error}
      </Alert>
    );

  return (
    <>
      <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={closeSnackbar}>
        <Alert severity="success" variant="filled">
          <AlertTitle>Erfolg</AlertTitle>
          {successMsg}
        </Alert>
      </Snackbar>

      <Typography variant="h5">Autoren verwalten</Typography>

      <Button variant="contained" sx={{ my: 2 }} onClick={openCreate}>
        Neuen Autor erstellen
      </Button>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {authors.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.name}</TableCell>
                <TableCell>{a.id}</TableCell>
                <TableCell>
                  <Button onClick={() => openEdit(a)} sx={{ mr: 1 }}>
                    Bearbeiten
                  </Button>
                  <Button color="error" onClick={() => deleteAuthor(a.id)}>
                    Löschen
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {authors.length === 0 && (
              <TableRow>
                <TableCell colSpan={3}>
                  <Alert severity="info">Keine Autoren vorhanden.</Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editMode ? "Autor bearbeiten" : "Neuen Autor erstellen"}</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button variant="contained" onClick={saveAuthor}>
            {editMode ? "Speichern" : "Erstellen"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}