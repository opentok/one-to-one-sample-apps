/*
 * Express Dependencies
 */
var express = require('express');
var https = require('https');
var fs = require('fs');
var app = express();
var port = 3000;

// Set up https
var credentials = {
  key: fs.readFileSync('./ssl/key.pem'),
  cert: fs.readFileSync('./ssl/cert.pem')
};
var server = https.createServer(credentials, app);

/*
 * Config
 */
app.use(express.static([__dirname, '/public'].join('')));

/*
 * Routes
 */
app.get('/', function (req, res) {
  res.render('index.html');
});

app.get('*', function (req, res) {
  res.redirect('/');
});

/*
 * Listen
 */
server.listen(process.env.PORT || port);
console.log(['app listening on port', port].join(' '));
