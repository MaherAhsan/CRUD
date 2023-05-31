const mysql = require("mysql");

const con = mysql.createConnection({
  host: "localhost", // Replace with your MySQL server hostname or IP address
  user: "root", // Replace with your MySQL username
  password: "", // Replace with your MySQL password if applicable
  database: "ahsan", // Replace with your database name
});

con.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL server: ", err);
    return;
  }

  console.log("Connected to MySQL server");
});

module.exports.con = con;
