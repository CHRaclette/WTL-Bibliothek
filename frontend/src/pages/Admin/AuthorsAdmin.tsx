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
  Stack,
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
  const closeSuccess = () => setSuccessMsg(null);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState<Author | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);
  const closeDeleteError = () => setDeleteErrorMsg(null);
  const [filterAuthorname, setFilterAuthorname] = useState("");

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
  }, [open]);

  const openCreate = () => {
    setEditMode(false);
    setSelectedAuthor(null);
    setAuthorName("");
    setFieldErrors({});
    setOpen(true);
  };

  const openEdit = (a: Author) => {
    setEditMode(true);
    setSelectedAuthor(a);
    setAuthorName(a.name);
    setFieldErrors({});
    setOpen(true);
  };
  const filteredAuthors = authors.filter((a) =>
    a.name.toLowerCase().includes(filterAuthorname.toLowerCase())
  );
  const saveAuthor = async () => {
    setFieldErrors({});

    if (authorName.trim() === "") {
      setFieldErrors({ name: "Name darf nicht leer sein." });
      return;
    }
    if (authorName.length >= 50) {
      setFieldErrors( {name: "Name ist zu lang"});
      return;
   } 

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
      setSuccessMsg(editMode ? "Autor aktualisiert!" : "Autor erstellt!");
      loadData();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deleteAuthor = async (id: number) => {
    try {
      const res = await fetch(`/api/authors/${id}`, { method: "DELETE" });
      let json: any = null;

   
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      if (!res.ok) {
        if (res.status === 409) {
          setDeleteErrorMsg( "Der Autor kann nicht gelöscht werden (Konflikt).");
          return;
        }

        if (json?.error?.details?.fieldErrors) {
          setFieldErrors(json.error.details.fieldErrors);
        } else {
          setError(json?.error?.message || "Fehler beim Löschen");
        }
        return;
      }

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
      <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={closeSuccess}>
        <Alert severity="success" variant="filled" onClose={closeSuccess}>
          <AlertTitle>Erfolg</AlertTitle>
          {successMsg}
        </Alert>
      </Snackbar>

  
      <Snackbar
        open={!!deleteErrorMsg}
        autoHideDuration={4000}
        onClose={closeDeleteError}
      >
        <Alert severity="error" variant="filled" onClose={closeDeleteError}>
          <AlertTitle>Aktion nicht möglich</AlertTitle>
          {deleteErrorMsg}
        </Alert>
      </Snackbar>

      <Typography variant="h5">Autoren verwalten</Typography>
      <TextField
  label="Nach Autor filtern"
  value={filterAuthorname}
  onChange={(e) => setFilterAuthorname(e.target.value)}
  sx={{ my: 2 }}
  fullWidth
/>
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
            {filteredAuthors.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.name}</TableCell>
                <TableCell>{a.id}</TableCell>
                <TableCell>
                  <Button onClick={() => openEdit(a)} sx={{ mr: 1 }}>
                    Bearbeiten
                  </Button>
                  <Button
                    color="error"
                    onClick={() => {
                      setAuthorToDelete(a);
                      setDeleteDialogOpen(true);
                    }}
                  >
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

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editMode ? "Autor bearbeiten" : "Neuen Autor erstellen"}</DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            error={!!fieldErrors.name}
            helperText={fieldErrors.name}
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

      
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Autor löschen?</DialogTitle>
        <DialogContent>
          Möchtest du den Autor <strong>{authorToDelete?.name}</strong> wirklich löschen?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              if (!authorToDelete) return;
              await deleteAuthor(authorToDelete.id);
              setDeleteDialogOpen(false);
              setAuthorToDelete(null);
            }}
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}