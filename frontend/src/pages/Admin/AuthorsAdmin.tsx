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
  Box,
  CircularProgress,
  Container
} from "@mui/material";
import { useNavigate } from "react-router-dom";

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
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [authorToDelete, setAuthorToDelete] = useState<Author | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string | null>(null);

  const [filterAuthorname, setFilterAuthorname] = useState("");

  const navigate = useNavigate();

  const palette = {
    primary: "#3D5A80",
    accent: "#98C1D9",
    soft: "#E0FBFC",
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const authorsRes = await fetch("/api/authors", {
        credentials: "include",
      });

      if (authorsRes.status === 401 || authorsRes.status === 403) {
        navigate("/");
        return;
      }

      if (!authorsRes.ok) throw new Error("Backend Error");

      const data = await authorsRes.json();
      setAuthors(data);
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

    if (!authorName.trim()) {
      setFieldErrors({ name: "Name darf nicht leer sein." });
      return;
    }

    if (authorName.length >= 50) {
      setFieldErrors({ name: "Name ist zu lang" });
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
      setSuccessMsg(editMode ? "Autor aktualisiert!" : "Autor erstellt!");
      loadData();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const deleteAuthor = async (id: number) => {
    try {
      const res = await fetch(`/api/authors/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {}

      if (!res.ok) {
        if (res.status === 409) {
          setDeleteErrorMsg("Der Autor kann nicht gelöscht werden (Konflikt).");
          return;
        }

        setError(json?.error?.message || "Fehler beim Löschen");
        return;
      }

      setSuccessMsg("Autor gelöscht!");
      loadData();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(160deg, ${palette.accent}, ${palette.primary})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error)
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(160deg, ${palette.accent}, ${palette.primary})`,
          p: 3,
        }}
      >
        <Alert severity="error">
          <AlertTitle>Fehler</AlertTitle>
          {error}
        </Alert>
      </Box>
    );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(160deg, ${palette.accent}, ${palette.primary})`,
        py: 6,
        px: 2,
      }}
    >
      <Container maxWidth="lg">
        <Typography
          variant="h4"
          fontWeight={900}
          color="#fff"
          sx={{ mb: 3 }}
        >
          Autoren verwalten
        </Typography>

        <Box
          sx={{
            bgcolor: palette.soft,
            borderRadius: 4,
            p: 3,
            boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
            mb: 4,
          }}
        >
          <TextField
            label="Nach Autor filtern"
            value={filterAuthorname}
            onChange={(e) => setFilterAuthorname(e.target.value)}
            sx={{
              my: 2,
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: "#fff",
              },
            }}
            fullWidth
          />

          <Button
            variant="contained"
            onClick={openCreate}
            sx={{
              mb: 3,
              borderRadius: 3,
              py: 1.2,
              backgroundColor: palette.primary,
              "&:hover": { backgroundColor: "#2b3f59" },
            }}
          >
            Neuen Autor erstellen
          </Button>

          <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Aktionen</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredAuthors.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.name}</TableCell>
                    <TableCell>{a.id}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          onClick={() => openEdit(a)}
                          variant="outlined"
                          sx={{ borderRadius: 2 }}
                        >
                          Bearbeiten
                        </Button>

                        <Button
                          color="error"
                          variant="contained"
                          sx={{ borderRadius: 2 }}
                          onClick={() => {
                            setAuthorToDelete(a);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          Löschen
                        </Button>
                      </Stack>
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
        </Box>
      </Container>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editMode ? "Autor bearbeiten" : "Neuen Autor erstellen"}</DialogTitle>

        <DialogContent
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              backgroundColor: "#fff",
            },
          }}
        >
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

      <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={() => setSuccessMsg(null)}>
        <Alert severity="success" variant="filled" onClose={() => setSuccessMsg(null)}>
          <AlertTitle>Erfolg</AlertTitle>
          {successMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!deleteErrorMsg}
        autoHideDuration={4000}
        onClose={() => setDeleteErrorMsg(null)}
      >
        <Alert severity="error" variant="filled" onClose={() => setDeleteErrorMsg(null)}>
          <AlertTitle>Aktion nicht möglich</AlertTitle>
          {deleteErrorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
