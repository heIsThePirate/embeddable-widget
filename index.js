const http = require('http');
const express = require('express');
const os = require('os');
const ejs = require('ejs');

const serverPort = process.env.SERVER_PORT || 54100;
const clientPort = process.env.CLIENT_PORT || 54101;

const serverApp = express();
const clientApp = express();

var networkInterfaces = os.networkInterfaces();

serverApp.use((req, res, next) => {
	console.log('cors middleware');
	if((/^\/api\/3rd\/.+$/).test(req.path)) {
		const corsOrigin = req.headers.origin;
		const corsMethod = req.headers['access-control-request-method'];
		const corsHeaders = req.headers['access-control-request-headers'];
		const hasACorsFlag = corsOrigin || corMethod || corsHeaders;
		if(hasACorsFlag) {
			res.header('Access-Control-Allow-Origin', corsOrigin);
			res.header('Access-Control-Allow-Methods', corsMethod);
			res.header('Access-Control-Allow-Headers', corsHeaders);
			res.header('Access-Control-Max-Age', 60*60*24);
			if(req.method === 'OPTIONS') {
				res.send(200);
				return;
			}
		}
	}
	next();
});

const getIpAddress = () => {
	let keys = Object.keys(networkInterfaces);
	for(let x=0; x<keys.length; x++) {
		let netIf = networkInterfaces[keys[x]];
		for(let y=0; y<netIf.length; y++){
			let addr = netIf[y];
			if(addr.family === 'IPv4' && !addr.internal) {
				return addr.address;
			}
		}
	}
	return '127.0.0.1';
};

const serverHost = '//' + getIpAddress() + ':' + serverPort;
const platformScript = '/3rd/platform.js';

clientApp.set('view engine', 'html');
clientApp.engine('html', ejs.renderFile);
clientApp.get('/', (req, res) => {
	res.render('client/index', {
		serverHost: serverHost,
		platformScript: platformScript,
	});
});

serverApp.engine('js', ejs.renderFile);
serverApp.get(platformScript, function(req, res) {
    res.render('server'+platformScript, {
        serverHost: serverHost,
        platformScript: platformScript,
    });
});

serverApp.get('/api/3rd/foo-widget/init/:id', function(req, res) {
    var id = req.params.id;
    res.send('api response #'+id);
});

http.createServer(serverApp).listen(serverPort);
http.createServer(clientApp).listen(clientPort);