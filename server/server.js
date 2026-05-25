const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "client")));

// GET alla
app.get("/movies", (req, res) => {
  db.all("SELECT * FROM movies ORDER BY id DESC", (err, rows) => {
    if (err) return res.status(500).json({ message: "DB-fel", error: err.message });
    res.json(rows);
  });
});

// POST skapa
app.post("/movies", (req, res) => {
  try {
    const { title, year, genre, rating } = req.body;

    if (!title || !genre || !Number.isInteger(year) || !Number.isInteger(rating)) {
      return res.status(400).json({ message: "Ogiltig data" });
    }

    const sql = "INSERT INTO movies (title, year, genre, rating) VALUES (?, ?, ?, ?)";
    db.run(sql, [title.trim(), year, genre.trim(), rating], function (err) {
      if (err) return res.status(500).json({ message: "DB-fel", error: err.message });
      res.status(201).json({ message: "Film skapad!", id: this.lastID });
    });
  } catch (e) {
    res.status(500).json({ message: "Serverfel", error: String(e) });
  }
});

// PUT uppdatera (id i body)
app.put("/movies", (req, res) => {
  try {
    const { id, title, year, genre, rating } = req.body;

    if (!Number.isInteger(id) || !title || !genre || !Number.isInteger(year) || !Number.isInteger(rating)) {
      return res.status(400).json({ message: "Ogiltig data" });
    }

    const sql = "UPDATE movies SET title = ?, year = ?, genre = ?, rating = ? WHERE id = ?";
    db.run(sql, [title.trim(), year, genre.trim(), rating, id], function (err) {
      if (err) return res.status(500).json({ message: "DB-fel", error: err.message });
      if (this.changes === 0) return res.status(404).json({ message: "Ingen film uppdaterades (fel id?)" });
      res.json({ message: "Film uppdaterad!" });
    });
  } catch (e) {
    res.status(500).json({ message: "Serverfel", error: String(e) });
  }
});

// DELETE ta bort
app.delete("/movies/:id", (req, res) => {
  const id = Number(req.params.id);

  db.run("DELETE FROM movies WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ message: "DB-fel", error: err.message });
    if (this.changes === 0) return res.status(404).json({ message: "Ingen film togs bort (fel id?)" });
    res.json({ message: "Film borttagen!" });
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server kör på http://localhost:${PORT}`);
  });
}

module.exports = app;
process.on("SIGINT", () => {
  console.log("Stänger server...");
  process.exit(0);
});

