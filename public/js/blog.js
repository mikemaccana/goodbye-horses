$(document).on('/_loaded', function(event, works_template, work_data) {		
	console.log('Adding blog tooltips etc');
	
	var footnote_offset = 10;
	
	// Show footnotes when hovered
	$('sup a').on("mouseenter", function(event) {
		var link = $(event.target)
		var link_position = link.position()
		var link_target = link.attr('href').substr(1);
		console.log(link_target);
		var footnote = $('a[name="'+link_target+'"]').parent().clone();
		footnote.css({
			'top': link_position.top + footnote_offset, 
			'left': link_position.left + footnote_offset, 
			'position': 'absolute', 
			'display': 'block'
		})
		$("body").append(footnote);
		console.log(footnote);
	}).on("mouseleave", function(event) {
		console.log('ha');
		$('body > aside').remove();
	})
	
	$('a.intra').on('click', function(event) { change_page(event) } );
})	
