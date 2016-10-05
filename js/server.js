/*
 * Express Dependencies
 */
const express = require('express');
const app = express();
const port = 8080;

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
app.listen(process.env.PORT || port);
console.log(['app listening on port', port].join(' '));
