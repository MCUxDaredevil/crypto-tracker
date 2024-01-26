const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 3001;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

app.use(bodyParser.json());


app.get('/', (req, res) => {
  res.send('Pinging route for the SQL API');
});

app.get('/coins', (req, res) => {
  const query = 'SELECT * FROM coins';
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching data from MySQL:', error);
      res.status(500).json({error: 'Internal Server Error'});
      return;
    }

    res.json(results);
  });
});


app.get('/coins/:id', (req, res) => {
  const query = 'SELECT * FROM coins WHERE coin_id = ?';
  db.query(query, [req.params.id], (error, results) => {
    if (error) {
      console.error('Error fetching data from MySQL:', error);
      res.status(500).json({error: 'Internal Server Error'});
      return;
    }

    res.json(results);
  });
});

app.get('/tracked', (req, res) => {
  const query = 'SELECT coin_id, name FROM coins WHERE tracking=1';
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching data from MySQL:', error);
      res.status(500).json({error: 'Internal Server Error'});
      return;
    }

    res.json(results);
  });
});


app.post('/query', (req, res) => {
  const {query, params} = req.body;

  db.query(query, params, (error, results) => {
    if (error) {
      console.error('Error fetching data from MySQL:', error);
      res.status(500).json({error: 'Internal Server Error'});
      return;
    }

    res.json(results);
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
