var q = require('q');
var _ = require('lodash');
var request = require('request');
var nessieApiKey = '9a830f18b4803b9217a1a91a17a28872';

module.exports.getMerchantInfo = function(latitude, longitude) {
    var deferred = q.defer();

    getMerchantsWithinRadius(10, latitude, longitude).then(function(merchantInfo) {
        deferred.resolve(merchantInfo);
    }, function(error) {
        deferred.reject(error);
    });

    return deferred.promise;
}

function getMerchantsWithinRadius(radius, latitude, longitude) {
    var merchantRadiusUrl = 'http://api.reimaginebanking.com/merchants?lat='+latitude+'&lng='+longitude+'&rad='+radius+'&key='+nessieApiKey;
    var deferred = q.defer();

    request(merchantRadiusUrl, function(error, response, body) {
        if (!error) {

            // convert string to JSON
            var json = JSON.parse(body);

            // get pertinent data
            var jsonData = json.data;

            var eatJson = buildEatJson(jsonData);
            var outJson = buildOutJson(jsonData);
            var shopJson = buildShopJson(jsonData);

            var merchantData = {};
            merchantData["eat"] = eatJson;
            merchantData["out"] = outJson;
            merchantData["shop"] = shopJson;

            deferred.resolve(merchantData);
        } else {
            deferred.reject("Could not get merchants.");
        }
    });

    return deferred.promise;
}

function buildEatJson(data) {
    var eatJson = {};
    _.forEach(data, function(merchant) {
        var categories = merchant.category;
        // includes food, restaurant, meal_takeaway
        if (((categories.indexOf("food") > -1 || categories.indexOf("restaurant") > -1 || categories.indexOf("meal_takeaway") > - 1
        || categories.indexOf("Food") > -1 || categories.indexOf("Restaurant") > -1 || categories.indexOf("Restaurants") > -1) && (categories.indexOf("bar") == -1
        && categories.indexOf("night_club") == -1 && categories.indexOf("electronics_store") == -1
        && categories.indexOf("clothing_store") == -1 && categories.indexOf("lodging") == -1))) {
            console.log("Eat: "+merchant.name);
            var latitude = merchant.geocode.lat;
            var longitude = merchant.geocode.lng;

            eatJson[merchant.name] = {"lat": latitude, "lng": longitude};
        }
    });

    return eatJson;
}

function buildOutJson(data) {
    var outJson = {};
    _.forEach(data, function(merchant) {
        var categories = merchant.category;
        if (categories.indexOf("bar") > -1 || categories.indexOf("night_club") > -1 || categories.indexOf("Night Club") > -1
        || categories.indexOf("Bars") > -1 || categories.indexOf("Night Clubs") > -1) {
            console.log("Bar Or Night Club: "+merchant.name);

            var latitude = merchant.geocode.lat;
            var longitude = merchant.geocode.lng;

            outJson[merchant.name] = {"lat": latitude, "lng": longitude};
        }
    });

    return outJson;
}

function buildShopJson(data) {
    var shopJson = {};
    _.forEach(data, function(merchant) {
        var categories = merchant.category;
        if (categories.indexOf("electronics_store") > -1 || categories.indexOf("clothing_store") > -1) {
            console.log("Electronics Store or Clothing Store: "+merchant.name);
            var latitude = merchant.geocode.lat;
            var longitude = merchant.geocode.lng;

            shopJson[merchant.name] = {"lat": latitude, "lng": longitude};
        }
    });

    return shopJson;
}