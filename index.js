const http = require('http');
const express = require('express');
const os = require('os');
const ejs = require('ejs');

const serverPort = process.env.SERVER_PORT || 54100;
const clientPort = process.env.CLIENT_PORT || 54101;

const serverApp = express();
const clientApp = express();

var networkInterfaces = os.networkInterfaces();

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
}

const serverHost = '//' + getIpAddress() + ':' + serverPort;
const platformScript = '/3rd/platform.js';

http.createServer(serverApp).listen(serverPort);
http.createServer(clientApp).listen(clientPort);