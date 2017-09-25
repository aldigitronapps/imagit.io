var express = require('express'),
    config = require('./server/configure'),
    app = express(),
    mongoose = require('mongoose');


app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app = config(app);
mongoose.connect('mongodb://localhost:27017/imagit');
mongoose.connection.on('open', function() {
    console.log("Connected to Imagit");
});

var server = app.listen(app.get('port'), function() {
    console.log('Server up: http://localhost:' + app.get('port'));
});