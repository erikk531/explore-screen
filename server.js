var express = require('express');
var bodyParser = require('body-parser');
var dataCollector = require('./dataCollector');
var merchantData = require('./merchantData');
var app = express();
app.use(bodyParser.json());

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

app.post('/merchants', function(request, response) {
    response.send(merchantData);
//    var body = request.body;
//    var latitude = body.latitude;
//    var longitude = body.longitude;
//
//    dataCollector.getMerchantInfo(latitude, longitude).then(function(merchantInfo) {
//        response.send(merchantInfo);
//    }, function(error) {
//        console.log(error);
//    });
});

app.get('/merchants/id', function(request, response) {

});

app.listen(3000, function() {
	console.log('Example app. Running on port 3000');
});