
# WTL‑Bibliothek – SQL (UUID) Version

**Übungsprojekt „Bibliothek“**  
Backend: **Node.js + Express** · Frontend: **React + Vite + TypeScript** · DB: **SQLite (better-sqlite3)**

Diese Version nutzt **SQLite** mit **UUID‑Schlüsseln (TEXT)** für `books` und `authors`.  
Die Beziehung Buch↔Autor ist **Many‑to‑Many** über die Join‑Tabelle `book_authors`.

Ein Datenbank‑Layer (`/backend/db/*.js`) kapselt alle SQL‑Abfragen (keine Raw‑SQL im Controller).

---

## Backend starten

```bash
cd backend
npm install
npm run dev
```

Der Server läuft unter:  
http://localhost:3000

### Datenbank
Datei: `backend/data/library.db`

- **Schema** wird beim Start/Setup erzeugt.
- **Seeder** (`backend/data/seed.js`) legt Beispieldaten an, **nur wenn** `authors` und `books` leer sind.

> Hinweis: In dieser Version verwenden wir **UUIDs** (Node `crypto.randomUUID()`), daher **keine** `lastInsertRowid`‑Nutzung.

---

## Frontend starten

```bash
cd frontend
npm install
npm run dev
```

Frontend läuft unter:  
http://localhost:5173

Vite leitet Requests automatisch an das Backend weiter:
```
/api/... → http://localhost:3000
```

---

## Datenbankstruktur (UUID‑basiert)

### Tabelle `authors`
| Feld | Typ |
|------|-----|
| id | **TEXT PRIMARY KEY** (UUID) |
| name | TEXT NOT NULL |

### Tabelle `books`
| Feld | Typ |
|------|-----|
| id | **TEXT PRIMARY KEY** (UUID) |
| title | TEXT NOT NULL |
| year | INTEGER NOT NULL |
| isbn | TEXT NOT NULL |

### Tabelle `book_authors`
| Feld | Typ |
|------|-----|
| book_id | **TEXT** NOT NULL → FK → books.id |
| author_id | **TEXT** NOT NULL → FK → authors.id |

> Empfohlen: `ON DELETE CASCADE` für beide FKs aktivieren, oder die Links im Code vor dem Löschen entfernen.

---

## API‑Endpoints

### Books

| Methode | Route | Beschreibung |
|--------|--------|--------------|
| GET | `/api/books` | Alle Bücher **inkl. `authors: [{id,name}]`** |
| GET | `/api/books/:id` | Einzelnes Buch **inkl. `authors`** |
| POST | `/api/books` | Neues Buch erstellen |
| PATCH | `/api/books/:id` | Buch aktualisieren (Felder + Autoren) |
| DELETE | `/api/books/:id` | Buch löschen (vorher Links entfernen oder FK‑Cascade) |

#### Beispiel **POST /api/books** (Body)
```json
{
  "title": "Der Herr der Ringe",
  "year": 1954,
  "isbn": "978-3-86680-192-9",
  "authorIds": [
    "b2a90759-09ef-4f52-b986-122bfc1d316a",
    "68402579-74d4-489f-a509-77112bcbccf7"
  ]
}
```

#### Rückgabe (201)
```json
{
  "id": "086ae871-ad51-4a55-8c40-ab895b9215e7",
  "title": "Der Herr der Ringe",
  "year": 1954,
  "isbn": "978-3-86680-192-9",
  "authors": [
    { "id": "b2a90759-09ef-4f52-b986-122bfc1d316a", "name": "J.R.R. Tolkien" }
  ]
}
```

> **Wichtig:** Server erzeugt `id` per `crypto.randomUUID()` und gibt sie zurück. **Keine** `lastInsertRowid` bei UUIDs.

---

### Authors

| Methode | Route | Beschreibung |
|--------|--------|--------------|
| GET | `/api/authors` | Alle Autoren |
| GET | `/api/authors/:id` | Einzelner Autor |
| POST | `/api/authors` | Autor erstellen |
| PATCH | `/api/authors/:id` | Autor aktualisieren |
| DELETE | `/api/authors/:id` | Autor löschen (nur, wenn nicht referenziert) |

#### Beispiel **POST /api/authors** (Body)
```json
{ "name": "J. R. R. Tolkien" }
```

#### Rückgabe (201)
```json
{ "id": "b2a90759-09ef-4f52-b986-122bfc1d316a", "name": "J. R. R. Tolkien" }
```

---

## Validierung & Fehlerformat

### Books
- **title:** Pflichtfeld, nicht leer, max. 100 Zeichen
- **year:** Integer, ≤ aktuelles Jahr
- **isbn:** **13 Ziffern** (Bindestriche erlaubt; geprüft über `digits.length === 13`)
- **authorIds:** Array von **UUID‑Strings**; alle IDs müssen existieren

### Authors
- **name:** Pflichtfeld, max. 50 Zeichen
- **DELETE:** nur möglich, wenn **keine** Referenzen in `book_authors` existieren (sonst 409)

### Fehlerformat (Beispiel)
```json
{
  "success": false,
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

## Implementations‑Details (Backend)

- **UUIDs überall als TEXT**: `req.params.id` wird **nicht** in Number konvertiert.
- **Prepared Statements** mit `?`‑Platzhaltern (Schutz vor SQL‑Injection).
- **Books.getById / getAll** liefern **`authors: Author[]`** (kein `GROUP_CONCAT`).
- **PATCH**: aktualisiert Buchfelder und – falls `authorIds` übergeben – ersetzt die Links in `book_authors` via `removeByBook(id)` + `add(id, aid)`.
- **DELETE Buch**: erst Links löschen, dann Buch entfernen (oder FK‑Cascade nutzen).
- **DELETE Autor**: verweigern (409), wenn `getBooksForAuthor(id)` Links findet.

---

## Seed‑Daten

- Führt Seeds **nur aus, wenn** `authors` **und** `books` leer sind.
- Nutzt **korrekt formatierte ISBNs mit Bindestrichen** (z. B. `978-3-86680-192-9`).
- Erzeugt **UUIDs** für Bücher und Autoren (`crypto.randomUUID()`).
- Reihenfolge beim Leeren/Erzeugen: erst `book_authors`, dann `books`/`authors`; beim Einfügen erst Parents, dann Links.

---

## Sicherheit & Best Practices

- JSON‑Body‑Limit setzen (z. B. `express.json({ limit: "100kb" })`).
- Rate‑Limit (Empfehlung) gegen Spam.
- Keine `dangerouslySetInnerHTML` im Frontend.
- Einheitliche Fehler über `AppError` + `errorHandler`.

---

## Beispiel‑Snippets (DB‑Layer)

**Books.create** (UUID, plus Links):
```js
const id = crypto.randomUUID();
db.prepare(`INSERT INTO books (id, title, year, isbn) VALUES (?, ?, ?, ?)`)
  .run(id, title, year, isbn);
const link = db.prepare(`INSERT INTO book_authors (book_id, author_id) VALUES (?, ?)`);
for (const aid of authorIds) link.run(id, aid);
return id;
```

**Books.getById** (mit Autoren‑Array):
```js
const book = db.prepare(`SELECT id, title, year, isbn FROM books WHERE id = ?`).get(id);
if (!book) return null;
const authors = db.prepare(`
  SELECT a.id, a.name
  FROM authors a
  JOIN book_authors ba ON ba.author_id = a.id
  WHERE ba.book_id = ?
`).all(id);
return { ...book, authors };
```

---

## Unterschiede zur alten JSON‑Version

- **IDs**: jetzt **UUID (TEXT)** statt INTEGER/AUTOINCREMENT.
- **Autoren‑Format** im Response: `authors: Author[]` statt `GROUP_CONCAT` String.
- **Join‑Operationen** über `db/bookAuthors.js` an zentraler Stelle.
- **Kein `library.json`/`library.save()`** mehr – SQLite speichert persistiert.

---

## Mögliche Erweiterungen

- Authentifizierung (Admin‑Login, Rollen)
- Erweiterte Filter: `/api/books?title=...&authorId=...`
- Paginierung & Sortierung (mit Whitelist auf Spaltennamen)
- Kategorien/Genres
- Upload für Buch‑Cover
- Deployment (Render / Railway / Vercel)
- Integrationstests (supertest + SQLite `:memory:`)

