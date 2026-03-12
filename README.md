
# WTL‑Bibliothek – SQL Version

**Übungsprojekt „Bibliothek“ (Backend: Node.js + Express, Frontend: React + Vite + TypeScript)**

Diese Version nutzt **SQLite** als Datenbank (statt `library.json`).
Die Daten werden in einer echten relationalen Struktur gespeichert:

- `books`
- `authors`
- `book_authors` (Join‑Tabelle: Many‑to‑Many)

Ein Datenbank‑Layer (`/backend/db/*.js`) kapselt alle SQL‑Abfragen.

---

## Backend starten

```bash
cd backend
npm install
npm run dev
```

Der Server läuft unter:  
http://localhost:3000

### SQLite‑Datei
Die Daten werden gespeichert in:
```
backend/data/library.db
```

Beim ersten Start wird die DB-Struktur automatisch erzeugt.  
Der Seeder (`backend/data/seed.js`) legt Beispielbücher & Autoren an.

---

## Frontend starten

```bash
cd frontend
npm install
npm run dev
```

Frontend läuft unter:  
http://localhost:5173

Vite proxied Requests automatisch weiter an das Backend:
```
/api/... → http://localhost:3000
```

---

## Datenbankstruktur

### Tabelle `authors`
| Feld | Typ |
|------|-----|
| id | INTEGER PRIMARY KEY |
| name | TEXT NOT NULL |

### Tabelle `books`
| Feld | Typ |
|------|-----|
| id | INTEGER PRIMARY KEY |
| title | TEXT NOT NULL |
| year | INTEGER |
| isbn | TEXT |

### Tabelle `book_authors`
| Feld | Typ |
|------|-----|
| book_id | INTEGER FOREIGN KEY → books.id |
| author_id | INTEGER FOREIGN KEY → authors.id |

---

## API‑Endpoints

### Books

| Methode | Route | Beschreibung |
|--------|--------|--------------|
| GET | `/api/books` | Alle Bücher inkl. Autoren |
| GET | `/api/books/:id` | Einzelnes Buch inkl. Autoren |
| POST | `/api/books` | Neues Buch erstellen |
| PATCH | `/api/books/:id` | Buch aktualisieren |
| DELETE | `/api/books/:id` | Buch löschen |

#### Beispiel **POST /api/books**
```json
{
  "title": "Der Herr der Ringe",
  "year": 1954,
  "isbn": "9783866801929",
  "authorIds": [1, 2]
}
```

---

### Authors

| Methode | Route | Beschreibung |
|--------|--------|--------------|
| GET | `/api/authors` | Alle Autoren |
| GET | `/api/authors/:id` | Einzelner Autor |
| POST | `/api/authors` | Autor erstellen |
| PATCH | `/api/authors/:id` | Autor aktualisieren |
| DELETE | `/api/authors/:id` | Autor löschen |

#### Beispiel **POST /api/authors**
```json
{ "name": "J. R. R. Tolkien" }
```

---

## Validierung

### Books
- **title:** Pflichtfeld, nicht leer, max. 100 Zeichen
- **year:** muss Zahl sein, ≤ aktuelles Jahr
- **isbn:** exakt 13 Ziffern
- **authorIds:** mindestens ein Autor, IDs müssen existieren

### Authors
- **name:** Pflichtfeld
- Löschen nur möglich, wenn der Autor **nicht** in `book_authors` referenziert ist
- Sonst: **409 Conflict**

#### Fehlerformat
```json
{
  "error": {
    "message": "Validierungsfehler",
    "statusCode": 400,
    "code": "VALIDATION_ERROR",
    "details": {
      "fieldErrors": {
        "title": "Titel darf nicht leer sein"
      }
    }
  }
}
```

---

## Seed‑Daten

Der Seeder (`/backend/data/seed.js`) erzeugt automatisch Beispielbücher nur, wenn die DB leer ist.
Er enthält zahlreiche Klassiker und Autoren.

---

## Mögliche Erweiterungen

- Authentifizierung (Admin‑Login)
- Suche & Filter `/api/books?title=...&authorId=...`
- Paginierung
- Kategorien/Genres
- Buch‑Cover Upload
- Deployment (Render/Vercel)
- Integrationstests

