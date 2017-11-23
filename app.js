const express = require('express');
let app = express();

let Store = require('./lib/store.js');
let credentials = require('./lib/credentials.js');
let bodyParser = require('body-parser');
let zipcodes = require('zipcodes');


/*
 * Mongoose Setup
 */
let mongoose = require('mongoose');
let options = {
    keepAlive: 1,
    useMongoClient: true,
};

switch(app.get('env')){
    case 'development':
        mongoose.connect(credentials.mongo.development.connectionString, options);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, options);
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}

app.set('port', process.env.PORT || 3000);

app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('body-parser').json());
app.use(require('apikey')(auth, 'my realm'));
 
function auth (key, fn) {
  if ('test' === key)
    fn(null, { id: '1', name: 'John Dorian'})
  else
    fn(null, null)
}

/* ***************************
 * Store Manipulation
 * **************************/
 
app.get('/store/:id', function(req, res) { 
	Store.find({_id:req.query.id}, function(err, stores){
        if (err) return res.json('500');
        let context = {
            stores : stores.map(function(stores) {
                return {
                    name: stores.name,
                };
            })
        };
        res.json(context.stores);
	});
});
 
app.get('/store', function(req, res){
	Store.find({}, function(err, stores){
        if (err) return res.json("500");
        let context = {
            stores : stores.map(function(stores) {
                return {
                    name: stores.name,
                    _id: stores._id,
                };
            })
        };
        res.json(context.stores);
	});
});

app.post('/store', function(req, res) {
    var st = new Store ({
        _id:  (100*Math.random()).toString(),
        name: req.body.name,
        address: req.body.address,
        zip: req.body.zip,
        items: req.body.items
    });
    
    st.save(function(err, saveUser){
        if (err) {
            res.status(500)
            res.json('500');
        }
        else {
            res.status(200);
            res.json('200');
        }
    });
});

app.put('/store/:id', function(req, res) {
    Store.update(
        {_id:req.params.id},
        {$set:req.body},
        function(err){
            if(err){
                res.status(500);
                res.json('500');
            }
            else {
                res.status(200);
                res.json('200');
            }
    });
    
});

app.delete('/store/:id', function(req, res) {
    Store.findOneAndRemove({ _id: req.params.id }, function(err) {
        if(err){
            res.status(500);
            res.json('500');
        }
        else {
            res.status(200);
            res.json('200');
        }
    });
});


/* ***************************
 * Item Search
 * **************************/
 
app.get('/search/items', function(req, res){
    if(!req.query) {
        res.status(400);
        res.json({status:400, message:"Bad Request"});
    }
    
    Store.find({'items.name':req.query.itemName}, function(err, stores) {
        if (err) return res.json("500");
        let context = {
            stores : stores.map(function(stores) {
                return {
                    name: stores.name,
                    _id: stores._id,
                    items: stores.items,
                    address: stores.address,
                    zip: stores.zip
                };
            })
        };
        let st = Store.filterResults(context.stores, req.query);
        res.json(st);
    });
});
















// 404 catch-all handler (middleware)
app.use(function(req, res, next){
	res.status(404);
	res.json('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.json('500');
});

app.listen(app.get('port'), function(){
    console.log( 'Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.' );
});
