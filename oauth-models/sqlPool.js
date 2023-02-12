
var mysql = require('mysql');
var sqlPool  = mysql.createPool({
    multipleStatements: true,
    connectionLimit : 100,
    host            : process.env.DB_HOST,
    // host            : '13.229.133.136',
    user            : process.env.DB_USER,
    password        : process.env.DB_PASS,
    database        : process.env.DB_NAME
});
module.exports = sqlPool;
