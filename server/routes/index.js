const express = require('express');

const router = express.Router();
const db = require('../db')
const validator = require('../utils')
const sha256 = require('js-sha256');
const { json } = require('express');

/**
 * Register a new user
 */
router.post('/register', async (req, res, next) => {
    body = req.body;
    // validation
    // check for not empty strings and valid email
    // check lengths, uniqueness
    const reqFields = ['first_name', 'last_name', 'email', 'display_name',
                        'user_name', 'password']
    missingField = validator.validateRequiredFields(reqFields, body)  

    if (missingField) {
        res.statusCode = 400
        res.json({'error': `missing field ${missingField}`});
    }

     // check if username has been used
     users = await db.getUser(body.user_name)
     if (users.length > 0) {
         res.statusCode = 400
         res.json({'error': 'username is already taken'})
     }

    // perform the insert
    await db.insertUser(body)
    
    res.statusCode = 201
    res.json({'status': 'success'});
});

/**
 * Login a user
 */

router.post('/login', async (req, res, next) => {
    body = req.body

    // validate user_name and password
    const reqFields = ['user_name', 'password']
    missingField = validator.validateRequiredFields(reqFields, body) 
    
    if (missingField) {
        res.statusCode = 400
        res.json({'error': `missing field ${missingField}`});
    }

    // get user information
    try {
        let users = await db.getUser(body.user_name)
        if (users.length == 0) {
            res.statusCode = 400
            res.json({'error': `no user with username ${body.user_name} exists`})
        }

        // Compare passwords to see if valid login
        stored_password_hash = users[0].pword
        given_password_hash = sha256(body.password.toString())
    
        if (stored_password_hash === given_password_hash) {
            res.statusCode = 200
            res.json({'status': 'success', 'user_id': users[0].user_id}) // later pass a token
        } else {
            res.statusCode = 400
            res.json({'error': 'invalid password'})
        }
    } catch (e) {
        console.log(e)
        res.sendStatus(500)
    }
});

/**
 * Create a new library for a user
 */
router.post('/libraries', async (req, res, next) => {
    // name and owner are required
    body = req.body

    // validate owner and lib_name
    const reqFields = ['owner_id', 'lib_name']
    missingField = validator.validateRequiredFields(reqFields, body) 
    
    if (missingField) {
        res.statusCode = 400
        res.json({'error': `missing field ${missingField}`});
    }

    // validate that owner exists
    try {
        let users = await db.getUserById(body.owner_id)
        if (users.length === 0) {
            // error no such user exists
            res.statusCode = 403
            res.json({'error': `action forbidden for user`});
        }
        // check that this record does not yet exist
        let existingLibs = await db.getLibWithName(body.owner_id, body.lib_name);
        if (existingLibs.length > 0) {
            // error, this library already exists for user
            res.statusCode = 400
            res.json({'error': `library with name ${body.lib_name} already exists for user`})
        }
        // insert record
        await db.createLib(body.owner_id, body.lib_name)
        res.statusCode = 201
        res.json({'status': 'success'})

    } catch (e) {
        res.sendStatus(500)
    }
})

/** 
 * Get all libraries for a user
 */
router.get('/libraries', async (req, res, next) => {
    body = req.body
    const reqFields = ['user_id']
    let missingField = validator.validateRequiredFields(reqFields, body)

    if (missingField) {
        res.statusCode = 400
        res.json({'error': `missing field ${missingField}`});
    }

    libraries = await db.getUserLibraries(body.user_id)
    res.statusCode = 200
    res.json({'libraries': libraries})
});


/**
 * Add a user's book to their library of choice
 */

router.post('/books', async (req, res, next) => {
    // check the user is valid
    body = req.body
    let reqFields = ['user_id', 'lib_id', 'authors', 'title', 'genre_id'] //subtitle, publish_date, publisher, edition, cover_img, genre
    // 'authors' is an array of objects with fields: 'given_name', 'last_name' (optional)
    let missingField = validator.validateRequiredFields(reqFields, body) 
    
    if (missingField) {
        res.statusCode = 400
        res.json({'error': `missing field ${missingField}`});
    }

    authors = body.authors
    author_dict = {}
    authors.forEach(async (item, index) => {
        // validate each author object in the list
        let reqFields = ['given_name']
        missingField = validator.validateRequiredFields(reqFields, item)
        if (missingField) {
            res.statusCode = 400
            res.json({'error': `missing field ${missingField}`});
        }
        // check if author exists
        last_name = item.hasOwnProperty('last_name') ? item.last_name : ''
        existingAuthors = await db.getAuthor(item.given_name, last_name)
        if (existingAuthors.length === 0) {
            // insert new author into table
            author_id = await db.insertAuthor(item.given_name, last_name)
            item.author_id = author_id
        } else {
            item.author_id = existingAuthors[0].author_id
        }
        author_dict[item.author_id] = item
    });

    // update book table

    // get all books with this title
    subtitle =  body.hasOwnProperty('subtitle') ? body.subtitle : '';
    booksWithTitle = await db.booksByTitle(body.title, subtitle);

    correctBookId = null
    booksWithTitle.forEach(async (record, index) => {
        bookAuthors = await db.getBookAuthors(record.book_id)
        if (bookAuthors.length === author_dict.length) {
            // check if match between author ids
            unmatched = false;
            bookAuthors.forEach((a) => {
                if (! a.author_id in author_dict) {
                    unmatched = true;
                }
            });
            if (!unmatched) {
                correctBookId = record.book_id
        }
       
        }
    });

    if (!correctBookId) {
        pubDate =  body.hasOwnProperty('pub_date') ? body.pub_date : null;
        publisher =  body.hasOwnProperty('publisher') ? body.publisher : '';
        edition = body.hasOwnProperty('edition') ? body.edition : null;
        cover_url =  body.hasOwnProperty('cover_url') ? body.cover_url : '';
        genre_id =  body.genre_id ;
        correctBookId = await db.insertBook(body.title, subtitle, pubDate, publisher, edition, cover_url, genre_id)
        // insert into books and book-author table

        for (const [key, value] of Object.entries(author_dict)) {
            await db.insertBookAuthor(correctBookId, key)
        }
        // author_dict.forEach(async (k, v) => {
        //     await db.insertBookAuthor(correctBookId, k)
        // });
    }
    // add to library with status unread
    db.insertBookIntoLibrary(correctBookId, body.lib_id)
    res.statusCode = 201
    res.json({'status': 'success'})
})

/**
 * Get all books in a library; optionally some
 * filtering for matching some genre or read status
 * in the future
 */
router.get('/books', async (req, res, next) => {
    try {
        let results = await db.all();
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500)
    }
});

/** Create a genre */

router.post('/genres', async(req, res, next) => {
    body = req.body
    const reqFields = ['name']
    let missingField = validator.validateRequiredFields(reqFields, body)

    if (missingField) {
        res.statusCode = 400
        res.json({'error': `missing field ${missingField}`});
    }

    genre_id = await db.insertGenre(body.name)

    res.statusCode = 201
    res.json({'genre_id': genre_id})

});

/**
 * Get information about a specific book in a user's library
 */
router.get('/books/:id', async(req, res, next) => {
    try {
        let results = await db.one(req.params.id);
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500)
    } 
})

/**
 * Update read status of a library book
 */
// TODO


module.exports = router;

