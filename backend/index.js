import mysql from 'mysql2';

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Inamullah@3058',
    database: 'projectmanagement'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

connection.query('SELECT * FROM User', function (error, results, fields) {
  if (error) throw error;
  console.log('User data:', results);
});

