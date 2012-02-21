var DEFAULT_PAGE = "portfolio"
var nav_loaded = false;

// Loads default page the first time you get this
load_page(window.location.pathname);

// Load template and template data for the path specified
function load_page(path) {
	
	if ( path === "/" ) {
		var template_path = DEFAULT_PAGE
		var $append_to = $('body')
	} else {
		var template_path = path
	}
	console.log('real path is: '+path)
	console.log('template path is: '+template_path)
	
	var template_location = '../mustache/'+template_path+'.mustache'
	var template_data_location = '../json/'+template_path+'.json'
	$.get(template_location, function(template_data_string) {
		// Add the template to ICHasMustache's list of templates (name is the path)
		ich.addTemplate(template_path, template_data_string);
		// Fetch and fill in the template
		$.getJSON(template_data_location, function(portfolio_data) {
	
			// Fill in our template and add to document					
			var html = ich[template_path](portfolio_data);
			console.log('got html')
			console.log(html)
			
			// Find append point.
			// TODO: append point should be based on amount of slashes in URL
			var $append_to
			
			if ( path === "/" ) {
				$append_to = $('body')
			} else {
				$append_to = $('.maincontent')	
			}
			
			// Append content
			$append_to.fadeOut("fast", function(){
				$append_to.empty();
				$append_to.append(html).fadeIn('fast', function() {
					if (history.pushState) {
						history.pushState({}, "some title", path);
					}
			
					// Load nav if we haven't loaded it before
					if ( ! nav_loaded ) {
						console.log('Setting up nav for the first time');
						setup_navigation()				
					}
				});
			})
			
			
					
		});
	
	})
}

function setup_navigation() {
	// Set up moving underline
    var $hovered_link
	var width_offset = -30
	var left_offset = - (width_offset/2);

	var $nav_container = $("#nav_container > ul");
	var $nav_links = $("#nav_container > ul > li a"); 
    $nav_container.append("<li id='highlight'></li>");
    var $highlight = $("#highlight");
		
    $highlight
        .width($(".current_page_item").width() + width_offset)
        .css("left", $(".current_page_item a").position().left + left_offset)
        .data("original_left", $highlight.position().left)
        .data("original_width", $highlight.width());

	// Slide underline when hovered, back when unhovered 	
    $nav_links.on('mouseenter', function(event) {
        $hovered_link = $(event.target);
        var new_left_position = $hovered_link.position().left + left_offset;
        var new_width = $hovered_link.parent().width() + width_offset;
        $highlight.stop().animate({
            left: new_left_position,
            width: new_width
        },'fast')
	})
	$nav_links.on('mouseleave', function(event) {
        $highlight.stop().animate({
            left: $highlight.data("original_left"),
            width: $highlight.data("original_width")
        },'fast');
    });
		
	$nav_links.on('click', function(event) {
		if (history.pushState) {
			console.log('updating URL');
			new_location = $(event.target).attr('href');
			load_page(new_location);
			event.preventDefault();
		} else {
			console.log('This browser is ghetto. Full reload for you.')
		}
		
	});
	
	nav_loaded = true;
}


	


