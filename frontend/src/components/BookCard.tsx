import * as React from 'react';
import { Card, CardContent, CardHeader, Chip, Stack, Typography } from '@mui/material';

type Author = {
  id: number;
  name: string;
};

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
  return (
    <Card elevation={3} sx={{ height: '100%' }}>
      <CardHeader
        title={
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            {book.title}
          </Typography>
        }
        subheader={`ISBN: ${book.isbn}`}
      />
      <CardContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Erscheinungsjahr: <strong>{book.year}</strong>
        </Typography>

        {book.authors && book.authors.length > 0 ? (
          <>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              Autoren:
            </Typography>
            <Stack 
            sx={{ textAlign: "center" ,
                justifyContent: "center"
            }}
            direction="row" spacing={1} useFlexGap flexWrap="wrap">
              {book.authors.map((authors) => (
                <Chip key={authors.id} label={authors.name} size="small" />
              ))}
            </Stack>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Keine Autorendaten vorhanden.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}