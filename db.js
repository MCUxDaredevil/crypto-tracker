const mysql = require('mysql');

module.exports = class SQLManager {
    constructor(config) {
        this.connection = mysql.createConnection(config);
        this.connection.connect((error) => {
            if (error) {
                console.error('Error connecting to MySQL database:', error);
            } else {
                console.log('Connected to MySQL database.');
            }
        });
    }

    executeQuery(query, values = []) {
        return new Promise((resolve, reject) => {
            this.connection.query(query, values, (error, results) => {
                if (error) {
                    console.error('Error executing query:', error);
                    reject(error);
                } else {
                    console.log('Query executed successfully.');
                    resolve(results);
                }
            });
        });
    }

    closeConnection() {
        this.connection.end((error) => {
            if (error) {
                console.error('Error closing connection:', error);
            } else {
                console.log('Connection closed successfully.');
            }
        });
    }
}
