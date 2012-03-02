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
		console.log('got edition data')
		edition_data = edition_data_response
		console.log(edition_data)
		load_page(location.pathname)
	})
}

// Return a list of all templates needed for the URL
function get_parent_templates_for_url(path) {
	var templates = []
	//templates.push(edition_data[path])
	var path_bits = path.split('/').splice(1)

	function get_frame_chunks(path_bits) {
		
		if ( path_bits.length === 0 ) {
			// Reverse them to be in order of 
			return templates
		}
		
		path_bits.splice(path_bits.length - 1)
		templates.unshift('/' + path_bits.join('/'))
		return get_frame_chunks(path_bits) 
		
	}
	return get_frame_chunks(path_bits) 
}

// Load whatever page is at path into the window
function load_page(path) {
	if ( ! edition_data.hasOwnProperty(path) ) {
		console.log('Page doesnt exist - loading 404 oage')
		path = 'notfound'
	}
	page_data = edition_data[path]
	// TODO: we should only fetch templates we haven't fetched before
	parent_templates = get_parent_templates_for_url(path)
	console.log('parent templates are:')
	console.log(parent_templates)
	load_template_and_data(page_data['template'], page_data['contents'])
}

// Stuff the template with the contents
function load_template_and_data(template, contents) {
	$.get('/mustache/'+template+'.mustache', function(template_string) {
		$.get('/json/'+contents+'.json', function(contents) {
			add_template_if_necessary(template, template_string);
			console.log('contents are:')
			console.log(contents)
			var html = ich[template](contents);
			console.log(html)
		})
	})
}



// Load nav, and default page the first time you get this file
if ( Object.keys(edition_data).length === 0 ) {
	console.log('Setting up this edition');
	load_edition();
}
