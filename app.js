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
		"db": "singyourface"
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
	db = require('mongoskin').db(mongourl, {
		safe: false,
		auto_reconnect: true
	}),
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
// mongoDB
db.open(function(err, db) {
	util.log("You are logged into the Database: " + db);
});
var userDB = db.collection('user');
// socket io
io.set('transports', ['xhr-polling']);
io.sockets.on('connection', function(socket) {
	socket.emit('news', {
		hello: 'world'
	});
	socket.on('my other event', function(data) {
		console.log(data);
	});
	socket.on('file upload', function(data) {
		userDB.find().toArray(function(err, result) {
			if (err) throw err;
			var nextId = result.length + 1;
			console.log('the next id is: ' + nextId);
			var buf_image = new Buffer(data.image.replace(/^data:image\/png;base64,/, ""), 'base64'),
				buf_audio = new Buffer(data.audio.replace(/^data:audio\/wav;base64,/, ""), 'base64'),
				filename = '00' + nextId;
			var req_image = client.put('/images/' + filename + '.png', {
				'Content-Length': buf_image.length,
				'Content-Type': 'image/png'
			});
			req_image.on('response', function(res) {
				if (res.statusCode == 200) {
					console.log('saved to %s', req_image.url);
					// saving to db
					socket.emit('image upload success', {
						'imgurl': req_image.url,
						'msg': 'done.'
					});
				} else {
					console.log('error %d', req_image.statusCode);
					socket.emit('upload error');
				}
			});
			req_image.end(buf_image);
			// upload audio
			var req_audio = client.put('/audio/' + filename + '.wav', {
				'Content-Length': buf_audio.length,
				'Content-Type': 'image/wav'
			});
			req_audio.on('response', function(res) {
				if (res.statusCode == 200) {
					console.log('saved to %s', req_audio.url);
					// saving to db
					socket.emit('audio upload success', {
						'audiourl': req_audio.url,
						'msg': 'done.'
					});
					//save to mongo
					userDB.save({
						'id': '00' + nextId,
						'publicOk': data.pulicOk,
						'ts': new Date()
					});
				} else {
					console.log('error %d', req_audio.statusCode);
					socket.emit('upload error');
				}
			});
			req_audio.end(buf_audio);
		});
	});
	socket.on('req data', function() {
		userDB.find().sort({$natural:1}).limit(24).toArray(function(err, result) {
			if(err) throw err;
			socket.emit('req result', result);
		});
	});
});