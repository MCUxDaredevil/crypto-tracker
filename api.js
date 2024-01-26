const express = require('express');
const mysql = require('mysql');
const {get} = require('axios');
const bodyParser = require('body-parser');
const cors = require("cors");
require('dotenv').config();

const app = express();
const port = 3001;

app.use(cors({
  origin: 'http://localhost:63342'
}));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
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


app.post('/bet', (req, res) => {
  const {user_id, coin_id, amount, future} = req.body;

  const query = `
      INSERT INTO bets (
          user_id, coin_id, amount, future
      )
      VALUES (?, ?, ?, ?)
  `;

  db.query(query, [user_id, coin_id, amount, future], (error, results) => {
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

app.post('/multiquery', (req, res) => {
  const {query, params} = req.body;

  for(const param of params) {
    db.query(query, param, (error, results) => {
      if (error) {
        console.error('Error fetching data from MySQL:', error);
        return res.status(500).json({error: 'Internal Server Error'});
      }
    });
  }
});


app.post('/rebuild', async (req, res) => {
  // Need to think about some form of authentication here
  // might try to use totp or something
  const coinsTableQuery = `
      CREATE TABLE coins (
          coin_id VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          symbol VARCHAR(255) NOT NULL,
          image VARCHAR(255) NOT NULL,
          tracking BOOLEAN NOT NULL DEFAULT FALSE,
          PRIMARY KEY (coin_id)
      );
  `;

  const usersTableQuery = `
      CREATE TABLE users (
          user_id VARCHAR(255) NOT NULL,
          bets_id TEXT,
          points INT NOT NULL DEFAULT 0,
          PRIMARY KEY (user_id)
      );
  `;

  const betsTableQuery = `
      CREATE TABLE bets (
          bet_id INT AUTO_INCREMENT,
          user_id VARCHAR(255) NOT NULL,
          coin_id VARCHAR(255) NOT NULL,
          amount DECIMAL(10, 2) NOT NULL,
          future BOOLEAN NOT NULL DEFAULT FALSE,
          PRIMARY KEY (bet_id),
          FOREIGN KEY (coin_id) REFERENCES coins(coin_id),
          FOREIGN KEY (user_id) REFERENCES users(user_id)
      );
  `;

  db.query(coinsTableQuery, (error, results) => {
    if (error) {
      console.error('Error fetching data from MySQL:', error);
      res.status(500).json({error: 'Internal Server Error'});
    }
  });

  db.query(usersTableQuery, (error, results) => {
    if (error) {
      console.error('Error fetching data from MySQL:', error);
      res.status(500).json({error: 'Internal Server Error'});
    }
  });

  db.query(betsTableQuery, (error, results) => {
    if (error) {
      console.error('Error fetching data from MySQL:', error);
      res.status(500).json({error: 'Internal Server Error'});
    }
  });


  const response = await get(process.env.MARKET_API);
  const coins = response.data.map((coin) => {
    return `(
      '${coin.id}',
      '${coin.name}',
      '${coin.symbol}',
      '${coin.image}',
      0
    )`;
  });

  const query = `INSERT INTO coins (
            coin_id, name, symbol, image, tracking
        )
        VALUES ${coins.join(', ')}`;
  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching data from MySQL:', error);
      res.status(500).json({error: 'Internal Server Error'});
    }
  });

  res.json({message: 'Done building database'});
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
