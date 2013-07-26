if (process.env.VCAP_SERVICES) {
	var env = JSON.parse(process.env.VCAP_SERVICES);
	var mongo = env['mongodb-1.8'][0]['credentials'];
} else {
	var mongo = {
		"hostname": "localhost",
		"port": 27017,
		"username": "",
		"password": "",
		"name": "",
		"db": "db"
	};
}
var generate_mongo_url = function(obj) {
		obj.hostname = (obj.hostname || 'localhost');
		obj.port = (obj.port || 27017);
		obj.db = (obj.db || 'test');
		if (obj.username && obj.password) {
			return "mongodb://" + obj.username + ":" + obj.password + "@" + obj.hostname + ":" + obj.port + "/" + obj.db;
		} else {
			return "mongodb://" + obj.hostname + ":" + obj.port + "/" + obj.db;
		}
	};
var mongourl = generate_mongo_url(mongo);
var port = (process.env.VMC_APP_PORT || 3000);
var host = (process.env.VCAP_APP_HOST || 'localhost');
var url = require("url"),
	path = require("path"),
	fs = require("fs"),
	util = require("util"),
	knox = require("knox"),
	app = require("http").createServer(function(request, response) {
		var uri = url.parse(request.url).pathname,
			filename = path.join(process.cwd(), uri);
		path.exists(filename, function(exists) {
			if (!exists) {
				response.writeHead(404, {
					"Content-Type": "text/plain"
				});
				response.write("404 Not Found\n");
				response.end();
				return;
			}
			if (fs.statSync(filename).isDirectory()) filename += '/index.html';
			fs.readFile(filename, "binary", function(err, file) {
				if (err) {
					response.writeHead(500, {
						"Content-Type": "text/plain"
					});
					response.write(err + "\n");
					response.end();
					return;
				}
				response.writeHead(200);
				response.write(file, "binary");
				response.end();
			});
		});
	}).listen(parseInt(port, 10)),
	io = require('socket.io').listen(app);
console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
// socket io
io.set('transports', ['xhr-polling']);
io.sockets.on('connection', function(socket) {
	socket.emit('news', {
		hello: 'world'
	});
	socket.on('my other event', function(data) {
		console.log(data);
	});
	socket.on('img upload', function(img) {
		var buf = new Buffer(img.replace(/^data:image\/\w+;base64,/, ""),'base64');
		var filename = 'test000001';
		var req = client.put('/images/'+filename+'.png', {
             'Content-Length': buf.length,
             'Content-Type':'image/png'
		});
		req.on('response', function(res) {
			if (res.statusCode == 200) {
				console.log('saved to %s', req.url);
				socket.emit('upload success', {imgurl: req.url});
			} else {
				console.log('error %d', req.statusCode);
				}
			});

			req.end(buf);
	});
});
// knox
var client = knox.createClient({
	key: 'AKIAJG7F4NJWZNSYRJIQ',
	secret: '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',
	bucket: 'singyourface'
});
var headersPNG = {
	'Content-Type': 'image/png',
	'x-amz-acl': 'public-read'
};