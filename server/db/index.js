const mysql = require('mysql');
const uuid = require('uuid');
const sha256 = require('js-sha256');
const dotenv = require('dotenv')

dotenv.config()

const pool = mysql.createPool({
    connectionLimit: 10,
    password: process.env.SQL_PW,
    user: process.env.SQL_USER,
    host: 'localhost',
    database: 'library',
    port: '3306'
});

let libDb = {};

/**
 * User transactions
 */

libDb.insertUser = (user_data) => {
    user_id = uuid.v4();
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

/**
 * Library transactions
 */

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

/**
 * Author transactions
 */

libDb.getAuthor = (given_name, last_name) => {
    return new Promise((resolve, reject) => { 
        pool.query(`SELECT * FROM authors WHERE given_name = ? and last_name = ?;`, [given_name, last_name], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        })
    })
}

libDb.insertAuthor = (given_name, last_name) => {
    author_id = uuid.v4();
    vals = [author_id, given_name, last_name]
    return new Promise((resolve, reject) => { 
        pool.query(`INSERT INTO authors VALUES (?, ?, ?)`, vals, (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(author_id);
        })
    })
}

/**
 * Book transactions
 */

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

libDb.booksByTitle = (title, subtitle) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM books WHERE title = ? AND subtitle= ?;`, [title, subtitle], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        })
    })
}

libDb.getBookAuthors = (bookId) => {
    return new Promise((resolve, reject) => {
        pool.query(`SELECT * FROM book_author WHERE book_id = ?;`, [bookId], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        })
    })
}

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

libDb.insertBook = (title, subtitle, pub_date, publisher, edition, cover_url, genre) => {
    bookId = uuid.v4();
    vals = [bookId, title, subtitle, pub_date, publisher, edition, cover_url, genre]
    return new Promise((resolve, reject) => { 
        pool.query(`INSERT INTO books VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, vals, (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(bookId);
        })
    })
}

libDb.insertBookAuthor = (bookId, authorId) => {
    return new Promise((resolve, reject) => { 
        pool.query(`INSERT INTO book_author VALUES (?, ?)`, [bookId, authorId], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        })
    })
}

libDb.insertBookIntoLibrary = (bookId, libraryId) => {
    values = [libraryId, bookId, 'UNREAD']
    return new Promise((resolve, reject) => { 
        pool.query(`INSERT INTO library_books VALUES (?, ?, ?)`, values, (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        })
    })
}

libDb.insertGenre = (genre) => {
    genre_id = uuid.v4();
    return new Promise((resolve, reject) => { 
        pool.query(`INSERT INTO genre VALUES (?, ?)`, [genre_id, genre], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(genre_id);
        })
    });
}

libDb.getUserLibraries = (userId) => {
    return new Promise((resolve, reject) => { 
        pool.query(`SELECT * FROM libraries WHERE owner_id = ?`, userId, (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        })
    })
}

libDb.getLibraryBook = (bookId, libId) => {
    return new Promise((resolve, reject) => { 
        pool.query(`SELECT * FROM library_books WHERE book_id = ? AND library_id = ?`, [bookId, libId], (err, results) => {
            if (err) {
                return reject(err);
            }
            return resolve(results);
        })
    })
} 




module.exports = libDb;