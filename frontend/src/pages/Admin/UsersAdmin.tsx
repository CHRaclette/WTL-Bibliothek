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
  MenuItem,
} from "@mui/material";

type Role = "admin" | "user";
type User = {
  id: string;
  username: string;
  role: Role;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("user");

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [userToReset, setUserToReset] = useState<User | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [filter, setFilter] = useState("");


  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users", {credentials: "include"} );
      if (!res.ok) throw new Error("Backend Error");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message ?? "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

 
  const openCreate = () => {
    setEditMode(false);
    setUsername("");
    setPassword("");
    setRole("user");
    setFieldErrors({});
    setSelectedUser(null);
    setOpen(true);
  };

  const openEdit = (user: User) => {
    setEditMode(true);
    setSelectedUser(user);
    setUsername(user.username);
    setPassword(""); 
    setRole(user.role);
    setFieldErrors({});
    setOpen(true);
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(filter.toLowerCase())
  );

  const validate = () => {
    const errors: Record<string, string> = {};

    if (!username.trim()) errors.username = "Benutzername darf nicht leer sein.";
    if (username.trim().length > 50) errors.username = "Benutzername ist zu lang.";

    if (!editMode) {
      if (!password.trim()) errors.password = "Passwort ist erforderlich.";
      else if (password.length < 5) errors.password = "Mindestens 5 Zeichen.";
    } else {
      if (password && password.length < 5)
        errors.password = "Mindestens 5 Zeichen.";
    }

    if (role !== "admin" && role !== "user") errors.role = "Ungültige Rolle.";
    

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

 
  const saveUser = async () => {
    if (!validate()) return;

    const url = editMode
      ? `/api/users/${selectedUser!.id}`
      : "/api/users";

    const method = editMode ? "PATCH" : "POST";

    const body: any = { username, role };
    if (password.trim()) body.password = password;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include"
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json?.error?.message || "Fehler beim Speichern");
        return;
      }
      


      setOpen(false);
      setSuccessMsg(editMode ? "User aktualisiert!" : "User erstellt!");
      loadData();
    } catch (e: any) {
      setError(e.message ?? "Unbekannter Fehler");
    }
  };


  const deleteUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) {
        setError("Fehler beim Löschen");
        return;
      } else if (res.status === 403) {
        setError("Es muss mindestens ein Admin-User vorhanden sein!");
        return;
      }
      setSuccessMsg("User gelöscht!");
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
      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg(null)}
      >
        <Alert severity="success" variant="filled">
          <AlertTitle>Erfolg</AlertTitle>
          {successMsg}
        </Alert>
      </Snackbar>

      <Typography variant="h5">User verwalten</Typography>

      <TextField
        label="Nach Benutzername filtern"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        sx={{ my: 2 }}
        fullWidth
      />

      <Button variant="contained" sx={{ my: 2 }} onClick={openCreate}>
        Neuen User erstellen
      </Button>

      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Benutzername</TableCell>
              <TableCell>Rolle</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Aktionen</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredUsers.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.id}</TableCell>
                <TableCell>
                  <Button onClick={() => openEdit(u)} sx={{ mr: 1 }}>
                    Bearbeiten
                  </Button>
                  <Button
                    color="error"
                    sx={{ mr: 1 }}
                    onClick={() => {
                      setUserToDelete(u);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    Löschen
                  </Button>
                  <Button
                    color="warning"
                    onClick={() => {
                      setUserToReset(u);
                      setResetDialogOpen(true);
                    }}
                  >
                    Zurücksetzen
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Alert severity="info">Keine User vorhanden.</Alert>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

    
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>
          {editMode ? "User bearbeiten" : "Neuen User erstellen"}
        </DialogTitle>

        <DialogContent
          onKeyDown={(e) => {
          if (e.key === "Enter") {
          e.preventDefault();
          saveUser();
          }
          }}
          >
          <TextField
            fullWidth
            label="Benutzername"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={!!fieldErrors.username}
            helperText={fieldErrors.username}
            sx={{ mt: 2 }}
          />
     
          <TextField
          disabled={editMode}
            fullWidth
            label="Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!fieldErrors.password}
            helperText={fieldErrors.password}
            sx={{ mt: 2 }}
          />

          <TextField
            select
            fullWidth
            label="Rolle"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            error={!!fieldErrors.role}
            helperText={fieldErrors.role}
            sx={{ mt: 2 }}
          >
            <MenuItem value="user">user</MenuItem>
            <MenuItem value="admin">admin</MenuItem>
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Abbrechen</Button>
          <Button variant="contained" 
          onClick={saveUser}>
            {editMode ? "Speichern" : "Erstellen"}
          </Button>
        </DialogActions>
      </Dialog>

   
      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>Passwort zurücksetzen?</DialogTitle>
        <DialogContent>
          Passwort von <strong>{userToReset?.username}</strong> wirklich zurücksetzen?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Abbrechen</Button>
          <Button
            color="warning"
            variant="contained"
            onClick={async () => {
              await fetch(`/api/users/resetPassword/${userToReset?.id}`, {
                method: "POST",
                credentials: "include",
              });
              setSuccessMsg("Passwort zurückgesetzt!");
              setResetDialogOpen(false);
            }}
          >
            Zurücksetzen
          </Button>
        </DialogActions>
      </Dialog>

   
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>User löschen?</DialogTitle>
        <DialogContent>
          User <strong>{userToDelete?.username}</strong> wirklich löschen?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Abbrechen</Button>
          <Button
            color="error"
            variant="contained"
            onClick={async () => {
              await deleteUser(userToDelete!.id);
              setDeleteDialogOpen(false);
            }}
          >
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
