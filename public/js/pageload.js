var edition_data = {}; // A summary of what templates and content are required to load a URL
var content = {}; // Template and content data, with name on as key, content as value
var templates_loaded = []; // Templates loaded into mustache
var debug = true;

// Log if debugging enabled
function debuglog(text) {
	if ( debug ) {
		console.log(text)
	}
}

function array_has_item(some_array, some_item) {
	return some_array.indexOf(some_item) === -1
}

// Load a template if it hasn't been loaded before
function add_template_if_necessary(template_name, template_string) {
	if ( array_has_item(templates_loaded, template_name) ) {
		debuglog('Adding new template: '+template_name);
		// Add the template to ICHasMustache's list of templates (name is the path)
		ich.addTemplate(template_name, template_string);
		templates_loaded.push(template_name);
	} 
}

function load_edition() {
	$.get('/json/edition.json', function(edition_data_response) {
		debuglog('got edition data')
		edition_data = edition_data_response
		debuglog(edition_data)
		load_page(location.pathname)
	})
}

// Return a list of all parent URLs for the given URL
function get_parent_urls(path) {
	var templates = []
	var path_bits = path.split('/').splice(1)

	function get_frame_chunks(path_bits) {
		
		if ( path_bits.length === 0 ) {
			// Reverse them to be in order of topmost parent to last parent
			return templates
		}
		
		path_bits.splice(path_bits.length - 1)
		templates.unshift('/' + path_bits.join('/'))
		return get_frame_chunks(path_bits) 
		
	}
	return get_frame_chunks(path_bits) 
}

// Encode a URL for an HTTP request (currrent just does option, not option=value)
function encode_url(base, parts_to_encode) {
	url_parts = []
	parts_to_encode.forEach( function(part_to_encode) {
		url_parts.push(encodeURIComponent(part_to_encode))
	})	
	return base+'?' + url_parts.join('&')
}

// Load whatever page is at path into the window
function load_page(path) {
	if ( ! edition_data.hasOwnProperty(path) ) {
		debuglog('Page doesnt exist - loading 404 page')
		path = 'notfound'
	}

	// Get a list of all templates needed for our parent frames (eg, /foo/bar depends on / and /foo)
	var templates_and_data_needed = []
	var parent_urls = get_parent_urls(path)
	console.log('parent_urls:')
	console.log(parent_urls)
	parent_urls.forEach( function(ancestor_url) {
		this_url = edition_data[ancestor_url]
		templates_and_data_needed.push(['/'+this_url['frame_template'], '/'+this_url['frame_contents']])
	})		
	templates_and_data_needed.push(['/'+edition_data[path]['template'], '/'+edition_data[path]['contents'] ])


	// Request the required templates from the server
	console.log('templates_and_data_needed templates_and_data_needed templates_and_data_needed templates_and_data_needed')
	console.log(templates_and_data_needed)
	
	thing_we_need_url = encode_url('/templates_and_data', templates_and_data_needed)
	$.get( thing_we_need_url, {}, function(templates_and_data) {
		console.log('Recieved templates and data')
		console.log(templates_and_data);
		load_templates_and_contents(parent_urls, templates_and_data_needed, templates_and_data)
	})
}

// Get the template and contents from the server, add them to our global list, then load them
function load_templates_and_contents(parent_urls, templates_and_data_needed, templates_and_data) {
	// Update our global list of templates and content, and load any new templates into ICHmustache
	for ( url in templates_and_data ) {
		if ( array_has_item(url, 'content') ) {
			content[url] = templates_and_data[url];
		} else {
			add_template_if_necessary(url, templates_and_data[url])
		}	
	}
	// Could just trigger an event
	put_html_on_page(parent_urls)
}

// Add each ancestors template and contents until we finally add the real page.
function put_html_on_page(parent_urls) {
	parent_urls.forEach( function(url) {
		console.log('______________________')
		console.log('url:')	
		console.log(url)
		console.log('and according to edition data we need the following template:')
		
		var template_needed = edition_data[url]['frame_template']
		console.log(template_needed)
		console.log(ich[template_needed])
		
		
		console.log('and contents named...')
		var contents_needed_name = edition_data[url]['frame_contents']
		console.log(contents_needed_name)
		// undefined :^()	
		console.log('with the following JSON content...')
		console.log(content['/'+contents_needed_name])
		
		debuglog('edition_data')
		debuglog(edition_data)
		
		// there is no content[works_frame_content]
		debuglog('content')
		debuglog(content)

		//console.log('html for that would be:')
		//var html = ich[template_needed](contents_needed_mustache_string);	
	})
}

// Load nav, and default page the first time you get this file
if ( Object.keys(edition_data).length === 0 ) {
	debuglog('Setting up this edition');
	load_edition();
}
