/* Define requirements */
var express = require('express');
var app = express();

/* Set up middleware */
app.use(express.static(__dirname + '/public'));

/* Define routes */
app.get('/', function(req, res) {
    res.render('index.html');
});

app.get('*', function(req, res){
  res.redirect('/');
});
/* ************* */

app.listen(process.env.PORT || 8080);
console.log('app listening on localhost:8080');