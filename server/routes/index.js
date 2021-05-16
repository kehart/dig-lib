const express = require('express');

const router = express.Router();
const db = require('../db')
const validator = require('../utils')
const sha256 = require('js-sha256');

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
        console.log(users[0])
    
        stored_password_hash = users[0].pword
        given_password_hash = sha256(body.password.toString())
    
        if (stored_password_hash === given_password_hash) {
            res.statusCode = 200
            res.json({'status': 'success'}) // later pass a token
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
        }
        // check that this record does not yet exist
        let existingLibs = await db.getLibWithName(body.owner_id, body.lib_name);
        if (existingLibs.length > 0) {
            // error, this library already exists for user
        }
        // insert record
        await db.createLib(body.owner_id, body.lib_name)
        res.statusCode = 201
        res.json({'status': 'success'})

    } catch (e) {
        res.sendStatus(500)
    }
})

router.post('/books', async (req, res, next) => {
    // check the user is valid
    const reqFields = ['user_id', 'lib_id', 'authors', 'title'] //subtitle, publish_date, publisher, edition, cover_img, genre
    // iterate over authors to see if they exist in their tables

    // check if book exists and if exists in intersection table

    // add book to library with status unread
})


router.get('/books', async (req, res, next) => {
    try {
        let results = await db.all();
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500)
    }
});

router.get('/books/:id', async(req, res, next) => {
    try {
        let results = await db.one(req.params.id);
        res.json(results);
    } catch (e) {
        console.log(e);
        res.sendStatus(500)
    } 
})



module.exports = router;

