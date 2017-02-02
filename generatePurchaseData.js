var _ = require('lodash');
var q = require('q');
var request = require('request');
var async = require('async');
var dataCollector = require('./dataCollector')
var merchantIds = [];
var nessieApiKey = '9a830f18b4803b9217a1a91a17a28872';

var dates = ['11/25/16','11/26/16','11/27/16','11/28/16','11/29/16','11/30/16','12/1/16','12/2/16','12/3/16','12/4/16',
'12/5/16','12/6/16','12/7/16','12/8/16','12/9/16','12/10/16','12/11/16','12/12/16','12/13/16','12/14/16','12/15/16','12/16/16',
'12/17/16','12/18/16','12/19/16','12/20/16','12/21/16','12/22/16','12/23/16','12/24/16','12/25/16','12/26/16','12/27/16',
'12/28/16','12/29/16','12/30/16','12/31/16', '1/1/17', '1/2/17','1/3/17','1/4/17','1/5/17','1/6/17','1/7/17','1/8/17','1/9/17',
'1/10/17','1/11/17','1/12/17','1/13/17','1/14/17','1/15/17','1/16/17','1/17/17','1/18/17','1/19/17','1/20/17','1/21/17','1/22/17','1/23/17','1/24/17'
,'1/25/17'];

var accountIds = ["589200b41756fc834d903edc", "5892d0221756fc834d903ee5", "5892d0811756fc834d903ee6", "5892d09f1756fc834d903ee7"];

getMerchantIds(1).then(function(ids) {

    async.each(dates, function(date, callback) {
        console.log(date);

        // random merchant
        var merchantId = ids[Math.floor(Math.random() * ids.length)];
        // random number between 1 and 200
        var amount = Math.floor(Math.random()*200) + 1;
        // random account
        var accountId = accountIds[Math.floor(Math.random() * accountIds.length)];

        createPurchase(merchantId, amount, accountId, date).then(function(purchaseCreated) {
            console.log(purchaseCreated);
        }, function(error) {
            console.log(error);
        });
    }, function(error) {
        console.log(error);
    });
});

function getMerchantIds(page) {
    var latitude = "42.3572855";
    var longitude = "-71.0534591";
    var radius = "10";

    var merchantRadiusUrl = 'http://api.reimaginebanking.com/merchants?lat='+latitude+'&lng='+longitude+'&rad='+radius+'&key='+nessieApiKey+'&page='+page;
    var deferred = q.defer();

    request(merchantRadiusUrl, function(error, response, body) {
        if (!error) {
            var json = JSON.parse(body);
            var jsonData = json.data;
            var nextPage = json.paging;

            if (nextPage != null) {
                if (nextPage.next != null) {
                    buildMerchantIdArray(jsonData);
                    getMerchantIds(page+1).then(function() {
                        deferred.resolve(merchantIds);
                    });
                } else {
                    deferred.resolve(merchantIds);
                }
            } else {
                deferred.resolve(merchantIds);
            }
        } else {
            deferred.reject(error);
        }
    });

    return deferred.promise;
}

function buildMerchantIdArray(jsonData) {
    _.forEach(jsonData, function(merchant) {
        var merchantId = merchant._id;
        merchantIds.push(merchantId);
    });

    return merchantIds;
}

function createPurchase(merchantId, amount, accountId, date) {
    var deferred = q.defer();

    var customerMerchantPurchaseUrl = "http://api.reimaginebanking.com/accounts/"+accountId+"/purchases?key=9a830f18b4803b9217a1a91a17a28872"
    var body = {
        "merchant_id": merchantId,
        "medium":"balance",
        "purchase_date": date,
        "amount":amount
    }

    request({
        url: customerMerchantPurchaseUrl,
        method: 'POST',
        json: body
    }, function(error, response, body) {
        if (!error) {
            deferred.resolve(body);
        } else {
            deferred.reject(error);
        }
    });

    return deferred.promise;

}