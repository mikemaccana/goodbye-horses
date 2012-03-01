var DEFAULT_PAGE = "blog"
var DAMN_FAST = 100;
var nav_loaded = false;
var templates_loaded = [];
var width_offset = -30
var left_offset = - (width_offset/2);
var debug = false;
var decent_browser = false;
if ( navigator.userAgent.indexOf('MSIE') === -1 ) {
	decent_browser = true;
}
// Load nav, and default page the first time you get this file
if ( ! nav_loaded ) {
	console.log('Setting up nav for the first time');
	load_page(location.pathname);
}

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
	
	
// Load template and template data for the path specified, include it on the current document
function load_page(path) {
	
	var template_files = get_required_template_files(path)
	var template_files_url_parts = []
	template_files.forEach( function(template_file) {
		template_files_url_parts.push(encodeURIComponent(template_file))
	})
	template_files_url = '/templates?' + template_files_url_parts.join('&')
	$.get( template_files_url, function(templates_and_their_data_json) {
		console.log('yaaay')
		templates_and_their_data = JSON.parse(templates_and_their_data_json)
		templates_and_their_data.forEach(template_and_data) {
			
		}
	})
	
	/*
	var template_file = template_files.splice(1)
	
	template_files.forEach( function(template_file) {
		var template_location = '../mustache/'+template_file+'.mustache'
		var template_data_location = '../json/'+template_file+'.json'
		$.get(template_file
	}
	
	// Find append point.
	// TODO: append point should be based on amount of slashes in URL
	var $append_to = $('.maincontent')
	
	
	$.get(template_location, function(template_string) {
		
		add_template_if_necessary(template_file, template_string)
		
		// Fetch and fill in the template
		$.get(template_data_location, function(template_data) {
	
			// Fill in our template and add to document					
			var html = ich[template_file](template_data);
			
			// Append content
			$append_to.fadeOut("fast", function(){
				$append_to.empty();
				$append_to.append(html).fadeIn(DAMN_FAST, function() {
					// Non-pushState browsers still use loadpage(), but only to load the rest of the home page after nav has loaded
					// Whereas pushState browsers will use loadpage() to load every page
					if (history.pushState) {
						history.pushState({}, "some title", path);
					}	
					update_highlight(path);
					set_new_highlight_snap_back_position($("#highlight"));
					debuglog('triggering event:'+path+'_loaded. ')
					// Trigger any events that need to happen after this specific page is loaded
					$(document).trigger(template_path+'_loaded', [template_path, template_data]);
				});
			})
		});	
	}) */
}

// Given a URL, return a list of templates to load
function get_required_template_files(path) {
	// Strip leading slashs
	path_chunks = path.split('/')
	template_files = []

	function get_template_files(path_chunks, template_files, index) {
		// Add template files until all path_chunks are processed

		if ( index > 5 ) {
			return template_files
		}
		
		index += 1
		current_chunk = path_chunks[index]
		var path_to_current_template = path_chunks.slice(0,index).join('/')
				
		if ( index === path_chunks.length ) {
			// We are on the last path chunk - show default for whatever this is then return 
			if ( path_to_current_template === "/" ) {
				template_files.push('/default')
			} else {
				template_files.push(path_to_current_template+'/default')
			}
			return template_files
		} else {
			// This isn't the last path chunk. Find the frame for whatever this is.
			template_files.push(path_to_current_template+'/frame')			
			return get_template_files(path_chunks, template_files, index)
		}
	}
	
	return get_template_files(path_chunks, template_files, 0)
}

function update_highlight(url) {
	if ( decent_browser ) { 
		// Set current URL	
		debuglog('Updating highlight for '+url)
		top_level_url = url.split('/').splice(1)[0] // Just 'foo' from '/foo/bar/baz'
		var current_list_item = $('nav a[href$="/'+top_level_url+'"]').parent();
		$('nav li').not(current_list_item).removeClass('current_page_item');
		current_list_item.addClass('current_page_item');
	}	
}

function set_new_highlight_snap_back_position($highlight) {
	if ( decent_browser ) {
		debuglog('Setting snap back position');
	    $highlight
	        .width($(".current_page_item").width() + width_offset)
	        .css("left", $(".current_page_item a").position().left + left_offset)
	        .data("original_left", $highlight.position().left)
	        .data("original_width", $highlight.width());	
	}		
}

function change_page(event) {
	if (history.pushState) {
		debuglog('updating URL');
		new_location = $(event.target).attr('href');
		load_page(new_location);
		event.preventDefault();
	} else {
		debuglog('This browser is ghetto. Full reload for you.')
	}
}
	
// Setup navigation
function setup_navigation() {
	nav_name = 'nav'
	$.get('/mustache/'+nav_name+'.mustache', function(template_string) {
		
		$.getJSON('/json/'+nav_name+'.json', function(portfolio_data) {
			
			// Fill in our template and add to document		
			add_template_if_necessary(nav_name, template_string)	
					
			var html = ich[nav_name](portfolio_data);
			$('body').append(html);
			
			nav_loaded = true;
			
			// Load rest of the page
			load_page(location.pathname);			
		})
	})		
}

// Handle back button when used after a pushstate
onpopstate = function(event) {
	if ( event.state ) {
		debuglog('popping a previously pushed state:')
		load_page(location.pathname)
	}
}
	


