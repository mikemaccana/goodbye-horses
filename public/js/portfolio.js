// No waiting for document ready, because we don't have a document yet!

// Fetch and fill in the portfolio
$.getJSON('../public/json/portfolio.json', function(portfolio_data) {

	// Fill in our template and add to document					
	portfolio_data.works.forEach( function(work) {
		work['slug_name'] = work.name.replace(/[\s-,']+/g, '').toLowerCase();
	}) 
	portfolio_data['year'] = new Date().getFullYear();
	var portfolio = ich.portfolio_template(portfolio_data);
	$('body').append(portfolio);
			
	var sort_works = function(sort_key) {
		// Return a list of the work with the tag/sort_key mentioned
		var sorted_works = [];
		portfolio_data.works.forEach(function(work) {
			if ( work.tags.indexOf(sort_key)+1 ) {
				sorted_works.push(work);
			}
		})
		return sorted_works					
	};
		
	$(document).on('click', '#works > li > ul > li.tag', function(event){	
		// Sort works when tags clicked 
		console.log('Tag clicked')
		var sort_key = $(event.target).text();
				
		sorted_works = {
			works: sort_works(sort_key)
		}
				
		var sorted_portfolio = ich.sorted_works_template(sorted_works);
		$('#sorted_works').replaceWith(sorted_portfolio);
				
		$('#works').quicksand( $('#sorted_works li.work') );
	});
		
	// Mouseover animation for tags 			
	var tags = '#works > li > ul > li.tag';
	$(document).on("mouseenter", tags, function() {
		$(event.target).animate({ backgroundColor: "#222" }, 'slow');
	}).on("mouseleave", tags, function() {
		$(event.target).animate({ backgroundColor: "#777" }, 'slow');
	});
					
});

var nav_selector = 'nav > #nav_container > ul > li > a';
				
$(document).on('click', nav_selector, function(event) {
	console.log('nav bar clicked');
	var $target = $(event.target);
	$(nav_selector).not($target).removeClass('selected');
	$(nav_item).addClass('selected');
	var destination = $target.attr('href');
	var title = $target.text();
	$.get(destination, function() {
		history.pushState({}, title, destination);	
		$('section').fadeOut();	
	});
	event.preventDefault();	
});

/* Slide nav highlight around as links are hovered */
var select_nav_item = function(nav_item) {
	var offset = -5;
	var extra_width = 10;
	
    var new_position = nav_item.position();
    var new_width = nav_item.outerWidth(true);
    $('nav > #nav_container > #highlight').stop().animate({
        'left': new_position.left + offset,
        'width': new_width + extra_width
    }, 'fast');
	
}

$(document).on('hover', nav_selector, function(event) {
	console.log('nav bar item hovered');
	var nav_item = $(event.target);
    select_nav_item(nav_item);
});

// When the mouse leaves the ul, revert back to selected item
$(document).on('hover', 'nav > #nav_container', function(){}, function(event){
	console.log('nav bar un-hovered');
	select_nav_item($('a.selected'));
}) 

	