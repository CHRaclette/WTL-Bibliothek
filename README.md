# WTL‑Bibliothek
**Übungsprojekt „Bibliothek“**

Dieses Projekt besteht aus einem **Node.js‑Backend (Express)** und einem **React‑Frontend (Vite + TypeScript)**.  
Die Daten werden lokal in einer `library.json` gespeichert und über ein Data‑Management‑Layer (`services/library.js`) geladen und gespeichert.

---

## Backend starten

### 1. Abhängigkeiten installieren & Server starten

```bash
cd backend
npm install
npm run dev
```

Der Backend‑Server läuft anschliessend auf http://localhost:3000.

---

## Frontend starten

```bash
cd frontend
npm install
npm run dev
```

Der Frontend‑Server läuft anschliessend auf http://localhost:5173.  
Der Vite‑Dev‑Server ist so konfiguriert, dass Requests an `/api/...` automatisch an das Backend weitergeleitet werden.

---

## API‑Endpoints

### Books

| Methode | Route              | Beschreibung              |
|---------|--------------------|---------------------------|
| GET     | `/api/books`       | Alle Bücher abrufen       |
| GET     | `/api/books/:id`   | Buch per ID abrufen       |
| POST    | `/api/books`       | Neues Buch erstellen      |
| DELETE  | `/api/books/:id`   | Buch löschen              |
| PATCH   | `/api/books/:id`   | Daten überschreiben       |

Beispiel `POST /api/books` Body:
```json
{
  "title": "Der Herr der Ringe",
  "year": 1954,
  "isbn": "978-3-86680-192-9",
  "authorIds": [1, 2]
}
```

---

### Authors

| Methode | Route                | Beschreibung              |
|---------|----------------------|---------------------------|
| GET     | `/api/authors`       | Alle Autoren abrufen      |
| GET     | `/api/authors/:id`   | Autor per ID abrufen      |
| POST    | `/api/authors`       | Neuen Autor erstellen     |
| DELETE  | `/api/authors/:id`   | Autor löschen             |
| PATCH   | `/api/authors/:id`   | Daten überschreiben       |

Beispiel `POST /api/authors` Body:
```json
{ "name": "J. R. R. Tolkien" }
```

---

### Validierung

#### Bücher
- title: Pflichtfeld, nicht leer  
- year: 4‑stellig, ≤ aktuelles Jahr  
- isbn: 13 Ziffern, Format wird im Frontend formatiert  
- authorIds: mindestens ein gültiger Autor muss existieren  

#### Autoren
- name: Pflichtfeld  
- Löschen nicht möglich, wenn der Autor in Büchern referenziert wird (→ 409)

Fehlerformat (Backend):
```json
{
  "error": {
    "message": "Fehlerbeschreibung",
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

### Mögliche Erweiterungen

- Login / Rollen für Admin  
- API‑Filterung: `/api/books?title=...&authorId=...`  
- Umstieg auf SQL / echte Datenbank  
- Testplan + automatisierte Tests  
- Soft‑Delete / Undo  
- Autor‑Detailseite mit Buchliste  
- Deployment‑Doku (Render / Vercel / Netlify)  
- Kategorien/Genres für Bücher  
