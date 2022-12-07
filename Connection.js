const mysql = require("mysql")

var connection = mysql.createConnection({
 port: 3306,
 host: "localhost",
 user: 'root',
 password: "U_A1118Tiny",
 database: "rest"
})

connection.connect((err) => {
 if(!err) {
  console.log("connect to MySQL")
 }
 else {
  console.log("Can't connect to MySQL")
 }
})

module.exports = connection