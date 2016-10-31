var express = require('express');
var app = express();
var path = require('path');

var adds = {};

app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'public'));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
	var host = req.headers.host;
	res.render('index', {adds: adds, host: host});
	
});

app.get('/:id', function(req, res){
	var id = req.params.id;
	if (adds !== {} && adds[id] !== undefined){
		res.redirect(adds[id][1])
	} else {
		var host = req.headers.host;
		res.send('NO such shorten address!<br /><a href="http://'
			+req.headers.host+
			'/">Home Page</a>');
	}
});

app.get('/short/*', function(req, res){
	var result = {};
	var original = req.params[0];
	var shorten = Math.floor(Math.random() * 10000) + 1;
	adds[shorten] = [shorten, original];
	result.original_url = original;
	result.short_url = req.headers.host+'/'+shorten;
	res.send(JSON.stringify(result)
		+'<br><h2>shorten url:</h2><a href="http://'
		+result.short_url
		+'/">'+result.short_url+'</a><br><br><a href="http://'+req.headers.host+'/">Home Page</a>');
});

app.listen(8080, function(){
	console.log('Server running on 8080');
});