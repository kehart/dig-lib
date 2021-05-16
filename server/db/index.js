const mysql = require('mysql');
const uuid = require('uuid');
const sha256 = require('js-sha256');

const pool = mysql.createPool({
    connectionLimit: 10,
    password: 'pword',
    user: 'user',
    host: 'localhost',
    database: 'library',
    port: '3306'
});

let libDb = {};

libDb.insertUser = (user_data) => {
    user_id = uuid.v4();
    console.log(user_id.length)
    hashed_pword = sha256(user_data.password.toString());
    vals = [user_id, user_data.first_name, user_data.last_name, user_data.email, user_data.display_name, user_data.user_name, hashed_pword]
    return new Promise((resolve, reject) => { 
        pool.query(`INSERT INTO users VALUES (?, ?, ?, ?, ?, ?, ?)`, vals, (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        })
    })
};

libDb.getUser = (user_name) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM users WHERE user_name = ?`, [user_name], (err, results) => {
            if (err) {
                return reject(err);
            } 
            return resolve(results)
        });
    })
}

libDb.getUserById = (user_id) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM users WHERE user_id = ?`, [user_id], (err, results) => {
            if (err) {
                return reject(err);
            } 
            return resolve(results)
        });
    });
}

libDb.getLibWithName = (owner_id, name) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM libraries WHERE owner_id = ? AND lib_name = ?`, [owner_id, name], (err, results) => {
            if (err) {
                return reject(err);
            } 
            return resolve(results)
        });
    });
}

libDb.createLib = (owner_id, name) => {
    lib_id = uuid.v4();
    vals = [lib_id, name, owner_id]
    return new Promise((resolve, reject) => { 
        pool.query(`INSERT INTO libraries VALUES (?, ?, ?)`, vals, (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        })
    })
}

libDb.all = () => {

    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM books;`, (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        })
    })
};

libDb.one = (id) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM books WHERE book_id = ?;`, [id], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results[0]);
        });
    })
};



module.exports = libDb;