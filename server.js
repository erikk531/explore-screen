var express = require('express');
var q = require('q');
var async = require('async');
var request = require('request');
var bodyParser = require('body-parser');
var dataCollector = require('./dataCollector');
var merchantData = require('./merchantData');
var customerData = require('./customerData');
var _ = require('lodash');
var app = express();
app.use(bodyParser.json());

var merchantInformation;
var eatMerchantIds = [];
var outMerchantIds = [];
var shopMerchantIds = [];

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

app.post('/customers', function(request, response) {
    response.send(customerData);

//    merchantInformation = merchantData;
//
//    var eatData = merchantInformation.eat;
//    var outData = merchantInformation.out;
//    var shopData = merchantInformation.shop;
//
//    setCustomerEatMerchantAverage(eatData).then(function(success) {
//        setCustomerOutMerchantAverage(outData).then(function(success) {
//            setCustomerShopMerchantAverage(shopData).then(function(success) {
//                response.send(merchantInformation);
//            }, function(failure) {
//
//            });
//        }, function(failure) {
//
//        });
//    }, function(failure) {
//
//    });

//    var body = request.body;
//    var latitude = body.latitude;
//    var longitude = body.longitude;
//
//    dataCollector.getMerchantInfo(latitude, longitude).then(function(merchantInfo) {
//        console.log(merchantInfo);
//        merchantInformation = merchantInfo;
//        var eatData = merchantInformation.eat;
//        var outData = merchantInformation.out;
//        var shopData = merchantInformation.shop;
//
//        setCustomerMerchantAverage(eatData).then(function(success) {
//
//        }, function(failure) {
//
//        });
//
//
//
//
//
//    }, function(error) {
//        console.log(error);
//    });


});

function setCustomerEatMerchantAverage(eatData) {
    var deferred = q.defer();

    // generate merchant ID's array
    _.forIn(eatData, function(properties, key) {
        eatMerchantIds.push(key)
    });

    async.each(eatMerchantIds, function(merchantId, callback) {
        calculateCustomerAverageBillAtMerchant(merchantId).then(function(avg) {
            merchantInformation.eat[merchantId].avgBill = avg;
            callback(null);
        }, function(error) {

        });
    }, function(error) {
        if (error) {
            deferred.reject("error");
        } else {
            deferred.resolve("success");
        }
    });

    return deferred.promise;
}

function setCustomerOutMerchantAverage(outData) {
    var deferred = q.defer();

    // generate merchant ID's array
    _.forIn(outData, function(properties, key) {
        outMerchantIds.push(key)
    });

    async.each(outMerchantIds, function(merchantId, callback) {
        calculateCustomerAverageBillAtMerchant(merchantId).then(function(avg) {
            merchantInformation.out[merchantId].avgBill = avg;
            callback(null);
        }, function(error) {

        });
    }, function(error) {
        if (error) {
            deferred.reject("error");
        } else {
            deferred.resolve("success");
        }
    });

    return deferred.promise;
}

function setCustomerShopMerchantAverage(shopData) {
    var deferred = q.defer();

    // generate merchant ID's array
    _.forIn(shopData, function(properties, key) {
        shopMerchantIds.push(key)
    });

    async.each(shopMerchantIds, function(merchantId, callback) {
        calculateCustomerAverageBillAtMerchant(merchantId).then(function(avg) {
            merchantInformation.shop[merchantId].avgBill = avg;
            callback(null);
        }, function(error) {

        });
    }, function(error) {
        if (error) {
            deferred.reject("error");
        } else {
            deferred.resolve("success");
        }
    });

    return deferred.promise;
}

function calculateCustomerAverageBillAtMerchant(merchantId) {
    var deferred = q.defer();
    var customerMerchantPurchaseUrl = "http://api.reimaginebanking.com/merchants/"+merchantId+"/accounts/589200b41756fc834d903edc/purchases?key=9a830f18b4803b9217a1a91a17a28872";

    var totalAmount = 0;
    var quantity = 0;

    request(customerMerchantPurchaseUrl, function(error, response, body) {
        var bodyJson = JSON.parse(body);
        if (!error) {
            _.forEach(bodyJson, function(purchase) {
                totalAmount = totalAmount + purchase.amount;
                quantity = quantity + 1;
            });

            var avg = totalAmount / quantity;

            if (isNaN(avg)) {
                avg = 0;
            }

            console.log(avg);
            deferred.resolve(avg);
        } else {
            deferred.reject(error);
        }
    });

    return deferred.promise;
}

app.listen(3000, function() {
	console.log('Example app. Running on port 3000');
});