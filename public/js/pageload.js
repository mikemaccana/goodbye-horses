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
	debuglog('Setting up nav for the first time');
	setup_navigation();			
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
	// Since '/' is a somewhat ugly name for a template, we use DEFAULT_PAGE instead
	if ( path === "/" ) {
		var template_path = DEFAULT_PAGE
		var $append_to = $('body')
	} else {
		var template_path = path
		
	}
	debuglog('real path is: '+path)
	debuglog('template path is: '+template_path)
	
	var template_location = '../mustache/'+template_path+'.mustache'
	var template_data_location = '../json/'+template_path+'.json'
	$.get(template_location, function(template_string) {
		
		add_template_if_necessary(template_path, template_string)
		
		// Fetch and fill in the template
		$.get(template_data_location, function(template_data) {
	
			// Fill in our template and add to document					
			var html = ich[template_path](template_data);
			
			// Find append point.
			// TODO: append point should be based on amount of slashes in URL
			var $append_to = $('.maincontent')	
			
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
	})
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
			
			// IE9 screws up moving the highlight
			if ( ! decent_browser ) {
				$('#highlight').remove();
			}
			
			update_highlight(location.pathname);
					
			// Set up moving underline
		    var $hovered_link

			var $nav_container = $("nav ul");
			var $nav_links = $("nav a"); 
		    $nav_container.append("<li id='highlight'></li>");
		    var $highlight = $("#highlight");
		
			set_new_highlight_snap_back_position($highlight); 
				
			// Slide underline when hovered, back when unhovered 	
			if ( decent_browser ) {  
			    $nav_links.on('mouseenter', function(event) {
			        $hovered_link = $(event.target);
			        var new_left_position = $hovered_link.position().left + left_offset;
			        var new_width = $hovered_link.parent().width() + width_offset;
			        $highlight.stop().animate({
			            left: new_left_position,
			            width: new_width
			        },DAMN_FAST)
				});
				$nav_links.on('mouseleave', function(event) {
			        $highlight.stop().animate({
			            left: $highlight.data("original_left"),
			            width: $highlight.data("original_width")
			        },DAMN_FAST);
			    });
			}
		
			$nav_links.on('click', function(event) { change_page(event) } );
	
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
	


