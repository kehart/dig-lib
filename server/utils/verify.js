const jwt = require('jsonwebtoken')

module.exports = function(req, res, next) {
    const token = req.header('auth-token')
    console.log(token)
    if (!token) res.status(401).send('Access denied')

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        req.jwt = verified
        next()
        
    } catch(err) {
        console.log(err)
        res.status(400).send('Invalid token')
    }
}