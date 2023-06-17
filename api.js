const http = require('http');
const mysql = require('mysql');
require('dotenv').config();


const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});


connection.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión exitosa a la base de datos');
});

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET' && req.url === '/') {
    const data = {
      message: '¡Hola, mundo!'
    };

    res.statusCode = 200;
    res.end(JSON.stringify(data));
  } else if (req.method === 'POST' && req.url === '/') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      console.log('Datos recibidos:', body);

      const requestBody = JSON.parse(body);
      const { email, password } = requestBody;

      console.log('email:', email);
      console.log('password:', password);

      const sql = 'SELECT * FROM Coordinator WHERE email = ? AND password = ?';
      connection.query(sql, [email, password], (err, results) => {
        if (err) {
          console.error('Error al consultar la base de datos:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Error en el servidor' }));
          return;
        }

        if (results.length > 0) {
          const response = {
            message: '¡Inicio de sesión exitoso!'
          };

          res.statusCode = 200;
          res.end(JSON.stringify(response));
        } else {
          const response = {
            error: 'Credenciales inválidas'
          };

          res.statusCode = 401;
          res.end(JSON.stringify(response));
        }
      });
    });
  } else if (req.method === 'GET' && req.url === '/election') {
    const sql = 'SELECT * FROM Election';
    connection.query(sql, (err, result) => {
      if (err) {
        console.error('Error al obtener los datos de votación desde la base de datos:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Error en el servidor' }));
        return;
      }

      const response = {
        votations: result
      };

      res.statusCode = 200;
      res.end(JSON.stringify(response));
    });
  } else if (req.method === 'GET' && req.url === '/countries') {
    const sql = 'SELECT * FROM County';
    connection.query(sql, (err, result) => {
      if (err) {
        console.error('Error al obtener los datos de los condados desde la base de datos:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Error en el servidor' }));
        return;
      }

      const response = {
        countries: result
      };

      res.statusCode = 200;
      res.end(JSON.stringify(response));
    });
  } else if (req.method === 'GET' && req.url === '/coordinators') {
    const sql = 'SELECT * FROM Coordinator';
    connection.query(sql, (err, result) => {
      if (err) {
        console.error('Error al obtener los datos de los coordinadores desde la base de datos:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Error en el servidor' }));
        return;
      }

      const response = {
        coordinators: result
      };

      res.statusCode = 200;
      res.end(JSON.stringify(response));
    });
  } else if (req.method === 'POST' && req.url === '/addElection') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      console.log('Datos recibidos:', body);

      const requestBody = JSON.parse(body);
      const { year, politicalParty, country, voteCount } = requestBody;

      console.log('year:', year);
      console.log('politicalParty:', politicalParty);
      console.log('country:', country);
      console.log('voteCount:', voteCount);

      const sql = 'INSERT INTO Election (year, political_party, code_county, vote_count) VALUES (?, ?, ?, ?)';
      connection.query(sql, [year, politicalParty, country, voteCount], (err, result) => {
        if (err) {
          console.error('Error al insertar los datos de la elección en la base de datos:', err);
          res.statusCode = 500;
          res.end(JSON.stringify({ error: 'Error en el servidor' }));
          return;
        }

        const response = {
          message: 'Datos de elección guardados correctamente'
        };

        res.statusCode = 200;
        res.end(JSON.stringify(response));
      });
    });
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Ruta no encontrada' }));
  }
});

const port = 5000;
server.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
