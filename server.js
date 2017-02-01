var express = require('express');
var bodyParser = require('body-parser');
var dataCollector = require('./dataCollector');
var app = express();
app.use(bodyParser.json());

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