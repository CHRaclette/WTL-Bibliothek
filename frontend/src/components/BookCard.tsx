import * as React from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

type Author = { id: number; name: string };

type Book = {
  id: number;
  title: string;
  year: number;
  isbn: string;
  authors?: Author[];
};

type Props = {
  book: Book;
};

export function BookCard({ book }: Props) {
  const authors = book.authors ?? [];

  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        borderRadius: 2,
        width: 500,
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      <CardActionArea  sx={{ height: "100%" }}>
        <CardHeader
          title={
            <Typography variant="h6" fontWeight={700}>
              {book.title}
            </Typography>
          }
          subheader={
            <Typography variant="body2" color="text.secondary">
              ISBN: {book.isbn}
            </Typography>
          }
          sx={{ pb: 0 }}
        />

        <CardContent sx={{ pt: 1.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            spacing={1}
            sx={{ mb: 1.5 }}
          >
            <Typography variant="body2" color="text.secondary">
              Erscheinungsjahr: <strong>{book.year}</strong>
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {authors.length}
            </Typography>
          </Stack>

          <Divider sx={{ mb: 1.5 }} />
          {authors.length > 0 ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {authors.map((a) => (
                <Chip key={a.id} label={a.name} size="small" />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Keine Autorendaten vorhanden.
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
