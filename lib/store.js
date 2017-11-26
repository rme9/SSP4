var mongoose = require("mongoose");
let zipcodes = require('zipcodes');


// Define the inventory schema
var storeSchema = mongoose.Schema({
    _id: String,
    name: String,
    address: String,
    zip: String,
    items: [{
        name: String,
        description: String,
        quantity: Number,
        reportDate: Date
    }]
});

// Export the schema
let Store = mongoose.model('Store', storeSchema);
module.exports = Store;

module.exports.StoreSchema = storeSchema;

module.exports.filterResults = function(stores, query) {
    
    if(query.zip) {
        if(query.radius) {
            var zips = zipcodes.radius(query.zip, query.radius);
            stores = stores.filter(function(store) {
                  return zips.includes(store.zip);
            });
        }
        else
        {
            stores = stores.filter(function(store){
                return store.zip == query.zip;
            });
        }
    }
    else if(query.city && query.state) {
        let z = zipcodes.lookupByName(query.city, query.state);
        let zips = [];
        
        // Extract just the zip codes from the returned list
        for(var i = 0, len = z.length; i < len; i++)
        {
            zips.push(z[i].zip);
        }
        
        if(query.radius)
        {
            var rad =[];
            // For each zip code in the city, find all zip codes within the radius
            for(var i = 0, len = zips.length; i < len; i++)
            {
                rad.push(zipcodes.radius(zips[i], query.radius));
            }
            
            // Combine the two lists, ignoring duplicate zips
            for(var i = 0, len = rad.length; i < len; i++)
            {
                if(!zips.includes(rad[i]))
                {
                    zips.push(rad[i]);
                }
            }
        }
        
        stores = stores.filter(function(store) {
            return zips.includes(store.zip);
        });
    }
    
    if(query.age) {
        
    }
    
    return stores;
}


