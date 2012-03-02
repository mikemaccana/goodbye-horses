var edition_loaded = false;
var edition_data = {};

// Log if debugging enabled
function debuglog(text) {
	if ( debug ) {
		console.log(text)
	}
}

// Load a template if it hasn't been loaded before
function add_template_if_necessary(template_path, template_string) {
	if ( templates_loaded.indexOf(template_path) === -1  ) {
		debuglog('Adding new template :'+template_path);
		// Add the template to ICHasMustache's list of templates (name is the path)
		ich.addTemplate(template_path, template_string);
		templates_loaded.push(template_path);
	} 
}

function load_edition() {
	$.get('json/edition.json', function(edition_data_response) {
		console.log('got edition data')
		edition_data = edition_data_response
		console.log(edition_data)
		load_page(location.pathname)
	})
}

function load_page(path) {
	if ( ! edition_data.hasOwnProperty(path) ) {
		console.log('Page doesnt exist - loading 404 oage')
		path = 'notfound'
	}
	page_data = edition_data[path]
	load_template_and_data(page_data['template'], page_data['contents'])
}

function load_template_and_data(template, contents) {
	$.get('/mustache/'+template+'.mustache', function(template_string) {
		$.get('/json/'+contents+'.json', function(contents) {
			console.log('woo GOT ALL THE THINGS')
		})
	})
}



// Load nav, and default page the first time you get this file
if ( Object.keys(edition_data).length === 0 ) {
	console.log('Setting up this edition');
	load_edition();
}
