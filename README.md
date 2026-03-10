# 📚 WTL‑Bibliothek  
**Übungsprojekt „Bibliothek“**

Dieses Backend stellt eine einfache REST‑API bereit, um Bücher und Autor:innen zu verwalten.  
Die Daten werden lokal in einer `library.json` gespeichert und über ein kleines Data‑Management (`services/library.js`) geladen und gespeichert.

---

## 🚀 Backend starten

### 1. Abhängigkeiten installieren & Server starten

```bash
npm install
npm run dev
```
## 🚀 Frontend starten

```bash
npm install
npm run dev
```
Der Backend‑Server läuft anschliessend auf **Port 3000**.
Der Frontend-Server läuft anschliessena auf **Port 5173**.
---

## 📁 Projektstruktur

```plaintext
backend/
│  server.js
│
├── controllers/
│   ├── books.controller.js
│   └── authors.controller.js
│
├── routes/
│   ├── books.js
│   └── authors.js
│
├── services/
│   └── library.js        # seed(), load(), save()
│
└── data/
    └── library.json      # Lokale JSON-Datenbank
```

---

## 🔗 API‑Endpoints

### 📘 Books

| Methode | Route            | Beschreibung              |
|---------|------------------|---------------------------|
| GET     | `/api/books`     | Alle Bücher abrufen       |
| GET     | `/api/books/:id` | Buch per ID abrufen       |
| POST    | `/api/books`     | Neues Buch erstellen      |
| DELETE  | `/api/books/:id` | Buch löschen              |
| PATCH   | `/api/books/:id` | Daten Überschreiben       |
----------------------------------------------------------
### 📘 Authors

| Methode | Route            | Beschreibung              |
|---------|------------------|---------------------------|
| GET     | `/api/authors`     | Alle Bücher abrufen       |
| GET     | `/api/authors/:id` | Buch per ID abrufen       |
| POST    | `/api/authors`     | Neues Buch erstellen      |
| DELETE  | `/api/authors/:id` | Buch löschen              |
| PATCH   | `/api/authors/:id` | Daten Überschreiben       |
----------------------------------------------------------