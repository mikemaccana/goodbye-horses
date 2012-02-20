#!/usr/bin/env node 
// If request is non-XHR, examine the URL, and build a (single) page to match it.
// Eg, / followed by nothing = page border + home page index
// Eg, / followed by sports followed by nothing = page border + sport page border + sport index
// Eg, / followed by sports followed by nothing = page border + sport page border + sport index
//
// If request is XHR, provide the partial HTML requested (eg, from / to /sports/babe_ruth would mean sports border and babe ruth article), with some JS to update the URL
//
// All pages served with some client JS to detect if the appcache for the day has been loaded before, and to load it if not.
//
// 
//
// TODO: headers
// Cache-Control header
// Connection: close
// Expires:

// Modules
var http = require('http'), 
	fs = require('fs'),
	_ = require('underscore');
_.str = require('underscore.string');
// Add underscore.string to underscore
_.mixin(_.str.exports());

app = {
	PUBLIC: './public/',
  
	// Start server on port
	startServer: function(address, port) {
		http.createServer(app.incoming).listen(port, address);
		console.log('Server running at http://'+address+':'+port);
	},
	
	// Respond with a not found
	notFound: function (response) {
	    console.log('Ran not found');
	    response.writeHead(404, {});
	    response.end('Not found');
	},

	// Normalize URLs. Lowercase, strip leading trailing slahes, handle indexing. 
	cleanRequest: function (request) {
		request.url = _.trim(request.url, '/').toLowerCase();
		if ( request.url === '') {
			request.url = 'templates/index.html'		
		}
		console.log('Request URL is now: '+request.url)
		return request
	},
	
	// End response by serving filename
	serveFile: function(request, response) {
		var full_filename = app.PUBLIC+request.url;
		console.log('Opening: "'+full_filename+'"');		
		fs.readFile(full_filename, function(error, data) {
			if ( error) {
				console.log('there was an error')
				console.log(error)
				
				return app.notFound(response);
			    response.writeHead(404, {});
			    response.end('Not found');
				
			} else {
				console.log('no error')
				
				response.writeHead(200, {'Content-Type': 'text/html'});
				return response.end(data);   
			}
			   
		})
	}, 
	
	// Serve the TronCAT API
	serveAPI: function(request, response) {
		console.log('WOOO SERVE API HERE');
		return app.notFound(response);
	},
  
	// Handle incoming requests
	incoming: function (request, response) {
		console.log('\nIncoming request to: '+request.url);
		request = app.cleanRequest(request);
		console.log('Request for "'+request.url+'"');
		
		// Patterns to match incoming URLs to 
		routes = [
			['templates.*',app.serveFile],
			['favicon.ico',app.serveFile],
			['api',app.serveAPI]
		]
		
		var found = false;
		
		routes.forEach( function(route) {
			route_expression = new RegExp(route[0])
			if ( route_expression.test(request.url) ) {
				console.log('Yaay. '+request.url+' matched '+route[0]);
				found = true;
				return route[1](request, response);
			}			
		})
		
		if ( ! found ) {
			console.log('No routes matched :"'+request.url+'"')
			return app.notFound(response); 
		}
			
	},		
}
_.bindAll(app);

app.startServer("127.0.0.1", 8000);

