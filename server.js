#!/usr/bin/env node 
// Goodbye Horses - Server
// A server for single page apps
// (c) Mike MacCana all rights reserved

// Modules
var http = require('http'), 
	fs = require('fs'),
	mime = require('mime'),
	_ = require('underscore'),
	superagent = require('superagent'),
	url  = require('url'),
	async = require('async'),
	jsonlint = require("jsonlint");
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

function array_has_item(some_array, some_item) {
	return some_array.indexOf(some_item) === -1
}


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
			console.log('This is a real page (not a resource)')
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
	
	// Return a JSON mapping of template names to their contents
	// This is so clients can fetch all templates required for a URL at once
	serveTemplatesAndContents: function(request, response) {
		var response_json = {};
		var url_parts = url.parse(request.url, true).query;	
		
		items = []
		Object.keys(url_parts).forEach( function(item_pair) {
			items = items.concat(item_pair.split(','))
		});
			
		console.log('client has asked for templates: ')
		console.log(items)
		
		
		// Open all templates with first function, run second function when all are complete
		var open_item_and_add_it_to_response = function(item_name, callback) {
			if ( array_has_item(item_name,'content') ) {
				var full_filename = app.PUBLIC+'json'+item_name+'.json'
				var use_json = true;
			} else {
				var full_filename = app.PUBLIC+'mustache'+item_name+'.mustache'
				var use_json = false;
			}
			
			
			console.log('opening :'+full_filename)
			fs.readFile(full_filename, function(error, data) {
				
				if ( error) {	
					console.log('oh no template "'+full_filename+'" missing')	
					return callback(error)
				} else {
					if ( use_json ) {
						//var file_contents = JSON.parse()
						var a_string = data.toString();
						console.log('x'+a_string+'x');
						console.log(full_filename+' being JSON parsed')	
						var file_contents = JSON.parse(a_string);
					} else {
						var file_contents = data.toString();
					}
					response_json[item_name] = file_contents
					console.log('woo '+item_name+' found. String is:')
					console.log(file_contents)
					return callback()
				}		
			})
		}
		
		async.forEach(items, open_item_and_add_it_to_response, function(error) {
			if ( error) {	
				console.log('oh no errors!')
				return app.notFound(response);
			} else {
				console.log('all items found')
				response.writeHead(200, {'Content-Type': 'application/json'});
				
				final_response = JSON.stringify(response_json)
				console.log('returning:')
				console.log(final_response)
				
				return response.end(final_response); 
			}	
		});
		

		
	},
	
	// End response by serving filename
	serveFile: function(request, response) {
		var full_filename = app.PUBLIC+request.url;
		console.log('Opening: "'+full_filename+'"');		
		fs.readFile(full_filename, function(error, data) {
			if ( error) {				
				return app.notFound(response);		
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
  
	// Handle incoming requests
	incoming: function (request, response) {
		console.log('\nIncoming request to: '+request.url);
		request = app.cleanRequest(request);
		console.log('Request for "'+request.url+'"');
		
		// Patterns to match incoming URLs to 
		routes = [
			['html|js|json|fonts|images|css|less|mustache',app.serveFile],
			['templates_and_data',app.serveTemplatesAndContents],	
		]
		
		var found = false;
		
		routes.forEach( function(route) {
			route_expression = new RegExp(route[0])
			if ( route_expression.test(request.url) ) {
				console.log('Yaay. "'+request.url+'" matched route '+route[0]);
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
