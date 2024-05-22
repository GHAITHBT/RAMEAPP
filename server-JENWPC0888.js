const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Passw0rd123',
  database: 'ramappschema',
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySQL connected...');
});

// Route to handle form submission
app.post('/submit-form', (req, res) => {
  const {
    bonN,
    employeDemandeur,
    matriculeDemandeur,
    departement,
    kst,
    quantiteA4,
    quantiteA3,
    quantiteA5,
    dateReception,
    dateProchaine,
    copycenter,
  } = req.body;

  const query = 'INSERT INTO data SET ?';

  const formData = {
    bon_n: bonN,
    employe_demandeur: employeDemandeur,
    matriculedemandeur: matriculeDemandeur,
    departement: departement,
    kst: kst,
    quantite_a4: quantiteA4 || null,
    quantite_a3: quantiteA3 || null,
    quantite_a5: quantiteA5 || null,
    date_reception: dateReception || null,
    date_prochaine: dateProchaine || null,
    copycenter: copycenter || null,
  };

  db.query(query, formData, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      res.send('Form data inserted successfully');
    }
  });
});

// Route to get all data with optional filters
app.get('/get-data', (req, res) => {
  const { bon_n, employe_demandeur, departement, kst, date_reception, date_prochaine, quantite_a4, quantite_a5, quantite_a3, matriculedemandeur, copycenter } = req.query;

  let query = 'SELECT id, employe_demandeur, matriculedemandeur, quantite_a4, quantite_a3, DATE_FORMAT(date_reception, "%Y-%m-%d") AS date_reception, DATE_FORMAT(date_prochaine, "%Y-%m-%d") AS date_prochaine, kst, bon_n, departement, quantite_a5, copycenter FROM data WHERE 1=1';

  if (bon_n) {
    query += ` AND bon_n LIKE '%${bon_n}%'`;
  }
  if (employe_demandeur) {
    query += ` AND employe_demandeur LIKE '%${employe_demandeur}%'`;
  }
  if (matriculedemandeur) {
    query += ` AND matriculedemandeur LIKE '%${matriculedemandeur}%'`;
  }
  if (departement) {
    query += ` AND departement LIKE '%${departement}%'`;
  }
  if (quantite_a4) {
    query += ` AND quantite_a4 LIKE '%${quantite_a4}%'`;
  }
  if (quantite_a5) {
    query += ` AND quantite_a5 LIKE '%${quantite_a5}%'`;
  }
  if (quantite_a3) {
    query += ` AND quantite_a3 LIKE '%${quantite_a3}%'`;
  }
  if (kst) {
    query += ` AND kst LIKE '%${kst}%'`;
  }
  if (date_reception) {
    query += ` AND date_reception >= '${date_reception}'`;
  }
  if (date_prochaine) {
    query += ` AND date_reception <= '${date_prochaine}'`;
  }
  if (copycenter) {
    query += ` AND copycenter LIKE '%${copycenter}%'`;
  }

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
    } else {
      res.json(results);
    }
  });
});

// Route to update data
app.put('/update-data/:id', (req, res) => {
  const { id } = req.params;
  const {
    bon_n,
    employe_demandeur,
    matriculedemandeur,
    departement,
    kst,
    quantite_a4,
    quantite_a3,
    quantite_a5,
    date_reception,
    date_prochaine,
    copycenter,
  } = req.body;

  const query = `
    UPDATE data SET
      bon_n = ?,
      employe_demandeur = ?,
      matriculedemandeur = ?,
      departement = ?,
      kst = ?,
      quantite_a4 = ?,
      quantite_a3 = ?,
      quantite_a5 = ?,
      date_reception = ?,
      date_prochaine = ?,
      copycenter = ?
    WHERE id = ?
  `;

  const values = [
    bon_n,
    employe_demandeur,
    matriculedemandeur,
    departement,
    kst,
    quantite_a4,
    quantite_a3,
    quantite_a5,
    date_reception,
    date_prochaine,
    copycenter,
    id,
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
    } else {
      res.send('Data updated successfully');
    }
  });
});

// Route to delete data
app.delete('/delete-data/:id', (req, res) => {
  const { id } = req.params;

  const query = 'DELETE FROM data WHERE id = ?';

  db.query(query, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).send('Error deleting data');
    } else {
      res.send('Data deleted successfully');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
