#!/usr/bin/env node 
// Goodbye Horses - Server
// A server for single page apps
// (c) Mike MacCana all rights reserved

// Modules
var http = require('http'), 
	fs = require('fs'),
	mime = require('mime'),
	_ = require('underscore'),
	superagent = require('superagent');
_.str = require('underscore.string');

// Add underscore.string to underscore
_.mixin(_.str.exports());

request = superagent;

var latest_tweet = ['','']
var USER = 'mikemaccana';
var URL = 'http://api.twitter.com/1/statuses/user_timeline.json';

function check_twitter() {
	console.log('Updating Twitter');
	superagent
	.get(URL)
	.send({ 'screen_name': USER, 'count': '1' })
	.end(function(response){		
		if (response.ok) {
			var tweetbody = response.body[0]
		    latest_tweet = [tweetbody['text'], tweetbody['created_at']];
		} else {
			console.log('Oh no! error ' + response.text);
		}
	});
};

// Update the 'latest_tweet'
function start_twitter_monitor(interval_mins) {
	check_twitter();
	setInterval(function() {
		check_twitter();
	}, interval_mins * 60 * 1000)
};	

app = {
	PUBLIC: './public/',
	
	// All content pages (ie, not resources)
	pages: ['','work','art','contact','work/im_everyone'],
  
	// Start server on port
	startServer: function(address, port) {
		http.createServer(app.incoming).listen(port, address);
		console.log('Server running at http://'+address+':'+port);
	},
	
	// Respond with a not found
	notFound: function (response) {
	    response.writeHead(404, {});
	    response.end('Not found');
	},

	// Normalize URLs. Lowercase, strip leading trailing slashes, handle indexing. 
	// Since ALL page (ie, not asset) URLs in the app are dynamic, send them to the index page
	// which will build the required content for the URL
	cleanRequest: function (request) {
		request.url = _.trim(request.url, '/').toLowerCase();
		if ( ! (this.pages.indexOf(request.url) === -1) ) {
			console.log('found in top level')
			request.url = 'html/content.html'		
		}
		console.log('Cleaned request URL is: "'+request.url+'"')
		return request
	},
	
	// Take a JSON string, open it as JSON, add slugs, return the string again
	add_slugs: function(string) {
		work_data = JSON.parse(string);
		work_data['works'].forEach( function(item, index, array) {
			work_data['works'][index]['slug_name'] = item.name.replace(/[\s-,']+/g, '').toLowerCase();
		});
		json_string = JSON.stringify(work_data);
		return json_string
	},
	
	// Add tweets, current year, other stuff to nav
	add_tweets: function(string) {
		nav_data = JSON.parse(string);
		// Get most recent tweet]
		nav_data['last_tweet'] = latest_tweet[0];
		nav_data['year'] = new Date().getFullYear();
		json_string = JSON.stringify(nav_data);
		return json_string		
	},
	
	// End response by serving filename
	serveFile: function(request, response) {
		var full_filename = app.PUBLIC+request.url;
		console.log('Opening: "'+full_filename+'"');		
		fs.readFile(full_filename, function(error, data) {
			if ( error) {				
				return app.notFound(response);
			    response.writeHead(404, {});
			    response.end('Not found');				
			} else {
				type = mime.lookup(full_filename);
				response.writeHead(200, {'Content-Type': type});
				
				// Add slugs to work data json
				if ( ! (request.url.indexOf('work.json') === -1) ) {
					data = this.add_slugs(data.toString());
				}
				
				if ( ! (request.url.indexOf('nav.json') === -1) ) {
					data = this.add_tweets(data.toString());
				}
				
				return response.end(data);   
			}
			   
		}.bind(this) )
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
			['html|js|json|fonts|images|css|less|mustache',app.serveFile],
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
start_twitter_monitor(15); 
