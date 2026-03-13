import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  Stack,
  Tooltip,
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
  const authors = Array.isArray(book.authors) ? book.authors : [];

  const palette = {
    primary: "#3D5A80",
    accent: "#98C1D9",
    soft: "#E0FBFC",
    pop: "#EE6C4D",
    ink: "#2B2D42",
  };

  return (
    <Card
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: 520,
        borderRadius: 4,
        backgroundColor: "#fff",
        boxShadow:
          "0 4px 12px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.06)",
        transition: "transform 0.18s ease, box-shadow 0.18s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow:
            "0 12px 26px rgba(0,0,0,0.2), 0 6px 14px rgba(0,0,0,0.08)",
        },
        p: 1,
      }}
    >
      <CardHeader
        title={
          <Tooltip title={book.title} placement="top" enterDelay={500}>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                color: palette.primary,
              }}
            >
              {book.title}
            </Typography>
          </Tooltip>
        }
        subheader={
          <Typography
            variant="body2"
            sx={{ color: `${palette.ink}AA`, fontWeight: 500 }}
          >
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
          <Typography variant="body2" sx={{ color: `${palette.ink}AA` }}>
            Erscheinungsjahr:{" "}
            <strong style={{ color: palette.primary }}>{book.year}</strong>
          </Typography>

          <Chip
            label={`${authors.length} Author${authors.length === 1 ? "" : "en"}`}
            size="small"
            sx={{
              bgcolor: `${palette.accent}33`,
              color: palette.primary,
              fontWeight: 600,
              borderRadius: 2,
            }}
          />
        </Stack>

        <Divider sx={{ mb: 1.5, opacity: 0.4 }} />

        {authors.length > 0 ? (
          <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap>
            {authors.map((a) => (
              <Chip
                key={a.id}
                label={a.name}
                size="small"
                sx={{
                  bgcolor: `${palette.primary}15`,
                  color: palette.primary,
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: `${palette.ink}88` }}>
            Keine Autorendaten vorhanden.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}