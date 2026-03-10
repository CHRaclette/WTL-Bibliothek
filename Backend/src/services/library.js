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
                { "id": 3, "name": "J.K. Rowling" },
                { "id": 4, "name": "Stephen King" },
                { "id": 5, "name": "Agatha Christie" },
                { "id": 6, "name": "Isaac Asimov" },
                { "id": 7, "name": "Neil Gaiman" },
                { "id": 8, "name": "Brandon Sanderson" }
              ],
              "books": [
                { "id": 1,  "title": "The Hobbit",                               "year": 1937, "isbn": "978-1-2345-6789-0", "authorIds": [1] },
                { "id": 2,  "title": "1984",                                      "year": 1949, "isbn": "978-1-5432-9876-4", "authorIds": [2] },
                { "id": 3,  "title": "Harry Potter and the Philosopher's Stone",  "year": 1997, "isbn": "978-1-8765-4321-7", "authorIds": [3] },
                { "id": 4,  "title": "Good Omens",                                "year": 1990, "isbn": "978-1-2222-3333-9", "authorIds": [7,2] },
                { "id": 5,  "title": "The Silmarillion",                          "year": 1977, "isbn": "978-1-3456-7890-1", "authorIds": [1] },
                { "id": 6,  "title": "Animal Farm",                               "year": 1945, "isbn": "978-1-5566-7788-2", "authorIds": [2] },
                { "id": 7,  "title": "Harry Potter and the Chamber of Secrets",   "year": 1998, "isbn": "978-1-4455-6677-3", "authorIds": [3] },
                { "id": 8,  "title": "The Shining",                               "year": 1977, "isbn": "978-1-9988-1122-4", "authorIds": [4] },
                { "id": 9,  "title": "Carrie",                                    "year": 1974, "isbn": "978-1-2244-6688-5", "authorIds": [4] },
                { "id": 10, "title": "Murder on the Orient Express",              "year": 1934, "isbn": "978-1-3399-5522-6", "authorIds": [5] },
            
                { "id": 11, "title": "Foundation",                                 "year": 1951, "isbn": "978-1-1111-2222-7", "authorIds": [6] },
                { "id": 12, "title": "I, Robot",                                   "year": 1950, "isbn": "978-1-7777-8888-3", "authorIds": [6] },
                { "id": 13, "title": "Coraline",                                   "year": 2002, "isbn": "978-1-9999-0000-8", "authorIds": [7] },
                { "id": 14, "title": "American Gods",                              "year": 2001, "isbn": "978-1-1313-1414-2", "authorIds": [7] },
                { "id": 15, "title": "Mistborn: The Final Empire",                 "year": 2006, "isbn": "978-1-8899-2255-1", "authorIds": [8] },
            
                { "id": 16, "title": "The Two Towers",                             "year": 1954, "isbn": "978-1-3333-4444-3", "authorIds": [1] },
                { "id": 17, "title": "The Return of the King",                     "year": 1955, "isbn": "978-1-5555-6666-8", "authorIds": [1] },
                { "id": 18, "title": "Harry Potter and the Prisoner of Azkaban",   "year": 1999, "isbn": "978-1-2223-3445-9", "authorIds": [3] },
                { "id": 19, "title": "Harry Potter and the Goblet of Fire",        "year": 2000, "isbn": "978-1-6611-8811-0", "authorIds": [3] },
                { "id": 20, "title": "The Stand",                                  "year": 1978, "isbn": "978-1-8899-7744-6", "authorIds": [4] },
            
                { "id": 21, "title": "The Outsider",                               "year": 2018, "isbn": "978-1-0330-2477-8", "authorIds": [4] },
                { "id": 22, "title": "Death on the Nile",                          "year": 1937, "isbn": "978-1-2020-3030-4", "authorIds": [5] },
                { "id": 23, "title": "And Then There Were None",                   "year": 1939, "isbn": "978-1-4545-6767-5", "authorIds": [5] },
                { "id": 24, "title": "Oryx and Crake",                             "year": 2003, "isbn": "978-1-4123-7890-0", "authorIds": [2] },
                { "id": 25, "title": "Elantris",                                   "year": 2005, "isbn": "978-1-3344-5566-7", "authorIds": [8] },
            
                { "id": 26, "title": "The Ocean at the End of the Lane",           "year": 2013, "isbn": "978-1-9900-1122-1", "authorIds": [7] },
                { "id": 27, "title": "The Casual Vacancy",                         "year": 2012, "isbn": "978-1-8920-6723-2", "authorIds": [3] },
                { "id": 28, "title": "Homeland",                                   "year": 1991, "isbn": "978-1-7700-5588-9", "authorIds": [6] },
                { "id": 29, "title": "The Way of Kings",                           "year": 2010, "isbn": "978-1-4400-2200-6", "authorIds": [8] },
                { "id": 30, "title": "Neverwhere",                                 "year": 1996, "isbn": "978-1-8989-7744-1", "authorIds": [7] }
              ]
            }
          
    

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