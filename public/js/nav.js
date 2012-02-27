$(document).on('page_loaded', function() {		
	console.log('Updating navigation for newly loaded page');

	update_highlight(location.pathname);
			
	// Set up moving underline
	var $hovered_link

	var $nav_container = $("nav ul");
	var $nav_links = $("nav a"); 
	$nav_container.append("<li id='highlight'></li>");
	var $highlight = $("#highlight");
		
	set_new_highlight_snap_back_position($highlight); 

	// Slide underline when hovered, back when unhovered 	
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
});