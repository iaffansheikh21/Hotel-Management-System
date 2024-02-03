const express = require("express");
const mysql = require("mysql2");
const util = require("util");
const cors = require("cors");
const app = express();
const port = 3000;

app.use(cors()); //Cross origin resource sharing
// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "booking_db",
});

const queryAsync = util.promisify(db.query).bind(db);

db.connect(async (err) => {
  if (err) {
    console.error("Error connecting to MySQL: " + err.stack);
    return;
  }

  // Create 'booking' table if it doesn't exist
  try {
    await queryAsync(`
      CREATE TABLE IF NOT EXISTS booking (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        purpose VARCHAR(255) NOT NULL
      )
    `);
    console.log("booking table created successfully");
  } catch (err) {
    console.error("Error creating booking table: " + err);
  }

  console.log("Successfully connected to Database");
});

// Middleware to parse JSON
app.use(express.json());

// Routes
app.get("/api/booking", async (req, res) => {
  try {
    const results = await queryAsync("SELECT * FROM booking");
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/booking", async (req, res) => {
  const { name, phone, email, purpose } = req.body;
  const booking = { name, phone, email, purpose };

  try {
    const result = await queryAsync("INSERT INTO booking SET ?", booking);
    res.json({ message: "booking added successfully", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.put("/api/booking/:id", async (req, res) => {
  const bookingId = req.params.id;
  const { name, phone, email, purpose } = req.body;
  const booking = { name, phone, email, purpose };

  try {
    await queryAsync("UPDATE booking SET ? WHERE id = ?", [booking, bookingId]);
    res.json({ message: "booking updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/api/booking/:id", async (req, res) => {
  const bookingId = req.params.id;

  try {
    await queryAsync("DELETE FROM booking WHERE id = ?", [bookingId]);
    res.json({ message: "booking deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
