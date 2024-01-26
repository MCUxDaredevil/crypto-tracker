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


    async resetDatabase() {
        const query = `
            DROP TABLE IF EXISTS coins;
            CREATE TABLE coins (
                coin_id VARCHAR(255) NOT NULL,
                name VARCHAR(255) NOT NULL,
                tracking BOOLEAN NOT NULL DEFAULT FALSE,
                PRIMARY KEY (coin_id)
            );
        `;
        return this.executeQuery(query);
    }
}
