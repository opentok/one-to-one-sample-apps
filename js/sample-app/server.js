/*
 * Express Dependencies
 */
const express = require('express');
const app = express();
const port = 3000;
app.use(express.static([__dirname, '/public'].join('')));


/**
 * HTTPS is required to run the application.  If running it locally, you will need to
 * do three things:
 * 1: Create a .pem key and certificate (http://goo.gl/V9Jwai) and place them in a folder
 *    named 'ssl' at the root of the sample app
 * 2: Uncomment the proceeding block of code
 * 3: Replace 'app' with 'server' when calling .listen()
 */

/** Uncomment me for https
const fs = require('fs');
const https = require('https');
const credentials = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem')
};
const server = https.createServer(credentials, app);
*/

/*
 * Routes
 */
app.get('/', (req, res) => {
  res.render('index.html');
});

app.get('*', (req, res) => {
  res.redirect('/');
});
/*
 * Listen
 */
app.listen(process.env.PORT || port);
console.log(['app listening on port', port].join(' '));
