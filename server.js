var express = require('express');
var app = express();
var path = require('path');
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var adds = {};
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'public'));
app.use(express.static(__dirname + '/public'));

var db;

mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, database){
	if (err) {
		console.log(err);
		process.exit(1);
	}
	db = database;
	console.log("Database connection ready");

	var server = app.listen(process.env.PORT || 8080, function(){
		var port = server.address().port;
		console.log('Server running');
	});
});



function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}


app.get('/', function(req, res){
	var host = req.headers.host;
	var urls = db.collection('urls');
	urls.find({}).toArray(function(err, doc){
		if (err) throw err;
		res.render('index', {adds: doc, host: host});
	});
});

app.get('/:id', function(req, res){
	var id = req.params.id;
	var host = req.headers.host;
	var urls = db.collection('urls');

	urls.findOne({short_url:{$regex:id}}).then(function(url){
		if (url === null) {
			var host = req.headers.host;
			res.send('NO such shorten address!<br /><a href="http://'
			+req.headers.host+
			'/">Home Page</a>');
		} else {
			res.redirect(url.original_url+'/');
		}
	})
});
	

app.get('/short/*', function(req, res){
	var result = {};
	var original = req.params[0];
	var shorten = Math.floor(Math.random() * 10000) + 1;
	result.original_url = original;
	result.short_url = req.headers.host+'/'+shorten;
	var urls = db.collection('urls');

	urls.findOne({original_url:original}).then(function(url){
		if (url == null) {
			urls.insert(result, function(err, data){
				if (err) console.log(err);
				delete data.ops[0]._id;
				res.send(JSON.stringify(data.ops[0]));
			})
		} else {
			delete url._id;
			res.send(JSON.stringify(url));
		}
	})
});

