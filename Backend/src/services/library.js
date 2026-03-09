const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/library.json");

function seed() {
  if (!fs.existsSync(filePath)) {
    console.log("generating seeder file");

    const defaultData = {
            "authors": [
              { "id": 1, "name": "J.R.R. Tolkien" },
              { "id": 2, "name": "George Orwell" },
              { "id": 3, "name": "J.K. Rowling" }
            ],
            "books": [
              { "id": 1, "title": "The Hobbit", "year": 1937, "isbn": "9780547928227", "authorIds": [1] },
              { "id": 2, "title": "1984", "year": 1949, "isbn": "9780451524935", "authorIds": [2] },
              { "id": 3, "title": "Harry Potter and the Philosopher's Stone", "year": 1997, "isbn": "9780747532699", "authorIds": [3] },
              { "id": 4, "title": "Good Omens", "year": 1990, "isbn": "9780060853983", "authorIds": [1, 2] }
            ]
    };  

    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }

  const raw = fs.readFileSync(filePath, "utf8").trim();

  if (raw === "") {
    console.log("seeding default data");
    const defaultData = {
      authors: [],
      books: []
    };
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }

  return JSON.parse(raw);
}

function load() {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function save(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log("library.json saved");
}

module.exports = { seed, load, save };