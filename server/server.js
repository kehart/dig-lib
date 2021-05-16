const express = require('express');

const app = express();
const apiRouter = require('./routes');

app.use(express.json()); // converts body to json
app.use('/api', apiRouter);

app.listen(process.env.PORT || '3000', () => {
    console.log(`Server is running on port ${process.env.PORT || '3000'}`)
}) // locally user 3000


