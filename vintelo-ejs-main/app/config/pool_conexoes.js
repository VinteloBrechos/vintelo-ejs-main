const mysql = require('mysql2')
try {
    var pool = mysql.createConnection({
        host: process.env.HOST,
        user: process.env.DB_USER,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        port: process.env.PORT,
    });
    console.log("Conexão estabelecida!");
} catch (e) {
    console.log("Falha ao estabelecer a conexão!");
    console.log(e);
}
 
module.exports = pool.promise();

// commit teste 
 