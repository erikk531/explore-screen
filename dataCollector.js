var q = require('q');
var async = require('async');
var _ = require('lodash');
var request = require('request');
var nessieApiKey = '9a830f18b4803b9217a1a91a17a28872';
var merchantInfoToReturn = {};
var eatMerchantIds = [];
var outMerchantIds = [];
var shopMerchantIds = [];

module.exports.getMerchantInfo = function(latitude, longitude) {
    var deferred = q.defer();

    getMerchantsWithinRadius({}, {}, {}, {}, 10, latitude, longitude, 1).then(function(merchantInfo) {

        // calculate average bill for each merchant
        calculateAllEatMerchantsAverageBill().then(function(success) {
            console.log("Calculated eat merchant's average bill.")
            calculateAllOutMerchantsAverageBill().then(function(success) {
                console.log("Calculated out merchant's average bill.")
                calculateAllShopMerchantsAverageBill().then(function(success) {
                    console.log("Calculated shop merchant's average bill.")
                    deferred.resolve(merchantInfoToReturn);
                }, function(error) {

                });
            }, function(error) {

            });

        }, function(error) {
            deferred.reject(error);
        });

    }, function(error) {
        deferred.reject(error);
    });

    return deferred.promise;
}

function getMerchantsWithinRadius(merchantData, givenEatJson, givenOutJson, givenShopJson, radius, latitude, longitude, page) {
    var merchantRadiusUrl = 'http://api.reimaginebanking.com/merchants?lat='+latitude+'&lng='+longitude+'&rad='+radius+'&key='+nessieApiKey+'&page='+page;
    var deferred = q.defer();

    request(merchantRadiusUrl, function(error, response, body) {
        if (!error) {

            // convert string to JSON
            var json = JSON.parse(body);

            // get pertinent data
            var jsonData = json.data;

            // get page information if available
            var nextPage = json.paging;

            if (nextPage != null) {
                if (nextPage.next != null) {
                    var eatJson = buildEatJson(jsonData, givenEatJson);
                    var outJson = buildOutJson(jsonData, givenOutJson);
                    var shopJson = buildShopJson(jsonData, givenShopJson);

                    merchantData["eat"] = eatJson;
                    merchantData["out"] = outJson;
                    merchantData["shop"] = shopJson;

                    getMerchantsWithinRadius(merchantData, eatJson, outJson, shopJson, radius, latitude, longitude, page+1).then(function() {
                        merchantInfoToReturn = merchantData;
                        deferred.resolve(merchantData);
                    });
                } else {
                    merchantInfoToReturn = merchantData;
                    deferred.resolve(merchantInfoToReturn);
                }
            } else {
                deferred.resolve(merchantData);
            }
        } else {
            deferred.reject("Could not get merchants.");
        }

    });

    return deferred.promise;
}

function buildEatJson(data, eatJson) {
    _.forEach(data, function(merchant) {
        var categories = merchant.category;
        if (((categories.indexOf("food") > -1 || categories.indexOf("restaurant") > -1 || categories.indexOf("meal_takeaway") > - 1
        || categories.indexOf("Food") > -1 || categories.indexOf("Restaurant") > -1 || categories.indexOf("Restaurants") > -1) && (categories.indexOf("bar") == -1
        && categories.indexOf("night_club") == -1 && categories.indexOf("electronics_store") == -1
        && categories.indexOf("clothing_store") == -1 && categories.indexOf("lodging") == -1))) {
            var latitude = merchant.geocode.lat;
            var longitude = merchant.geocode.lng;
            var id = merchant._id;
            eatMerchantIds.push(id);
            eatJson[id] = {"merchantName": merchant.name, "lat": latitude, "lng": longitude};
        }
    });

    return eatJson;
}

function buildOutJson(data, outJson) {
    _.forEach(data, function(merchant) {
        var categories = merchant.category;
        if (categories.indexOf("bar") > -1 || categories.indexOf("night_club") > -1 || categories.indexOf("Night Club") > -1
        || categories.indexOf("Bars") > -1 || categories.indexOf("Night Clubs") > -1) {
            var latitude = merchant.geocode.lat;
            var longitude = merchant.geocode.lng;
            var id = merchant._id;
            outMerchantIds.push(id);
            outJson[id] = {"merchantName": merchant.name, "lat": latitude, "lng": longitude};
        }
    });

    return outJson;
}

function buildShopJson(data, shopJson) {
    _.forEach(data, function(merchant) {
        var categories = merchant.category;
        if (categories.indexOf("electronics_store") > -1 || categories.indexOf("clothing_store") > -1) {
            var latitude = merchant.geocode.lat;
            var longitude = merchant.geocode.lng;
            var id = merchant._id;
            shopMerchantIds.push(id);
            shopJson[id] = {"merchantName": merchant.name, "lat": latitude, "lng": longitude};
        }
    });

    return shopJson;
}

function calculateAllEatMerchantsAverageBill() {
    var deferred = q.defer();

    async.each(eatMerchantIds, function(merchantId, callback) {
        calculateMerchantAverageBill(merchantId).then(function(avg) {
            merchantInfoToReturn.eat[merchantId].avgBill = avg;
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

function calculateAllOutMerchantsAverageBill() {
    var deferred = q.defer();

    async.each(outMerchantIds, function(merchantId, callback) {
        calculateMerchantAverageBill(merchantId).then(function(avg) {
            merchantInfoToReturn.out[merchantId].avgBill = avg;
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

function calculateAllShopMerchantsAverageBill() {
    var deferred = q.defer();
    async.each(shopMerchantIds, function(merchantId, callback) {
        calculateMerchantAverageBill(merchantId).then(function(avg) {
            merchantInfoToReturn.shop[merchantId].avgBill = avg;
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

function calculateMerchantAverageBill(merchantId) {
    var deferred = q.defer();

    var totalAmount = 0;
    var quantity = 0;

    var purchasesByMerchantEndpoint = "http://api.reimaginebanking.com/merchants/"+merchantId+"/purchases?key=9a830f18b4803b9217a1a91a17a28872"

    request(purchasesByMerchantEndpoint, function(error, response, body) {
        var bodyJson = JSON.parse(body);

        if (!error) {
            _.forEach(bodyJson, function(purchase) {
                totalAmount = totalAmount + purchase.amount;
                quantity = quantity + 1;
            });

            var avg = totalAmount / quantity;
            deferred.resolve(avg);
        } else {
            deferred.reject(error);
        }
    });

    return deferred.promise;
}