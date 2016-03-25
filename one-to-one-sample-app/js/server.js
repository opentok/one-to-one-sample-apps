/*
 * Express Dependencies
 */
var express = require('express');
var app = express();
var port = 8080;

/*
 * Config
 */
app.use(express.static(__dirname + '/public'));

/*
 * Routes
 */
app.get('/', function(req, res) {
    res.render('index.html');
});

app.get('*', function(req, res){
  res.redirect('/');
});

/*
 * Listen
 */
app.listen(process.env.PORT || port);
console.log('app listening on port' + port);