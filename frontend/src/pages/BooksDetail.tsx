import { useParams } from "react-router-dom";
import AlertTitle from '@mui/material/AlertTitle';

import { useEffect, useState } from "react";
import { Container, Typography, CircularProgress, Box, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Alert from '@mui/material/Alert';
import { BookCard } from "../components/BookCard";
import { WidthFull } from "@mui/icons-material";


type Author = { id: number; name: string };
type Book = {
  id: number;
  title: string;
  year: number;
  isbn: string;
  authors?: Author[];
};


function BookDetailsPage() {
  const navigate = useNavigate();
  const goHome = () => navigate("/");

  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
   
  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/books/${id}`);
      if (!res.ok) {
        setBook(null);
        setLoading(false);
        return;
      }
      const data: Book = await res.json();
      setBook(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (!book)
    return (
      <Container sx={{ py: 3 }}>
        
       

        <Typography variant="h5">Buch nicht gefunden</Typography>
        
        <Alert severity="warning">
        <AlertTitle>Nicht gefunden</AlertTitle>
        Dieses Buch existiert nicht.
      </Alert>
      <Button variant="contained" sx={{ mt: 2 }} onClick={goHome}>
          Back
        </Button>
      </Container>
    );

  return (

    <Container sx={{ py: 3 }}>
      <Stack>
      <BookCard book={book} />
      </Stack>
     

      <Button variant="contained" sx={{ mt: 3 }} onClick={goHome}>
        Back
      </Button>
    </Container>
  );
}

export default BookDetailsPage;