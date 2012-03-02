var edition_loaded = false;
var edition_data = {};
var templates_loaded = [];
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
function get_url_parents(path) {
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
		debuglog('Page doesnt exist - loading 404 oage')
		path = 'notfound'
	}

	templates_needed = []
	data_needed = []

	// Get a list of all templates needed for our parent frames (eg, /foo/bar depends on / and /foo)
	parents = get_url_parents(path)
	parents.forEach( function(parent_url) {
		templates_needed.push(edition_data[parent_url]['frame_template'])
	})	
	// And the template for the current page too
	templates_needed.push(edition_data[path]['template'])
	
	// Request the required templates from the server
	template_files_url = encode_url('/templates', templates_needed)
	$.get( template_files_url, {}, function(response_data) {
		console.log('GOT ALL OUR PARENT TEMPLATES')
		console.log(response_data);
		//load_template_and_data(page_data, page_data['contents'])
	})
	
}

// Stuff the template with the contents
function load_template_and_data(template, contents) {
	$.get('/mustache/'+template+'.mustache', function(template_string) {
		$.get('/json/'+contents+'.json', function(contents) {
			add_template_if_necessary(template, template_string);
			debuglog('contents are:')
			debuglog(contents)
			var html = ich[template](contents);
			debuglog(html)
		})
	})
}



// Load nav, and default page the first time you get this file
if ( Object.keys(edition_data).length === 0 ) {
	debuglog('Setting up this edition');
	load_edition();
}
