const express = require('express');
const mysql = require('mysql2');
const util = require('util');
const cors = require('cors')
const app = express();
const port = 3000;

app.use(cors());
// MySQL database configuration
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456789',
  database: 'manaal1',
  port: '3306'
});

const queryAsync = util.promisify(db.query).bind(db);

db.connect(async (err) => {
  if (err) {
    console.error('Error connecting to MySQL: ' + err.stack);
    return;
  }

  // Create 'users' table if it doesn't exist
  try {
    await queryAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL
      )
    `);
    console.log('Users table created successfully');
  } catch (err) {
    console.error('Error creating users table: ' + err);
  }

  console.log('Successfully connected to Database');
});


// Middleware to parse JSON
app.use(express.json());

// Routes
app.get('/api/users', async (req, res) => {
  try {
    const results = await queryAsync('SELECT * FROM users');
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/users', async (req, res) => {
  const { name, email } = req.body;
  const user = { name, email };

  try {
    const result = await queryAsync('INSERT INTO users SET ?', user);
    res.json({ message: 'User added successfully', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});





// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
