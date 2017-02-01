var express = require('express');
var bodyParser = require('body-parser');
var dataCollector = require('./dataCollector');
var app = express();
app.use(bodyParser.json());
var allowCrossDomain = function(req, res, next) {
    if ('OPTIONS' == req.method) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
      res.send(200);
    }
    else {
      next();
    }
};

app.use(allowCrossDomain);

app.post('/merchants', function(request, response) {
    var body = request.body;
    var latitude = body.latitude;
    var longitude = body.longitude;

    dataCollector.getMerchantInfo(latitude, longitude).then(function(merchantInfo) {
        response.send(merchantInfo);
    }, function(error) {
        console.log(error);
    });
});

app.get('/merchants/id', function(request, response) {

});

app.listen(3000, function() {
	console.log('Example app. Running on port 3000');
});