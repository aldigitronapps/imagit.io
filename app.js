var express = require("express");
var config = require("./server/configure");
var app = express();
var port = process.env.port || 3000;


app.set('views', __dirname + '/views');
app = config(app);


app.listen(port, function() {
    console.log("Server up: http://localhost:" + port)
});