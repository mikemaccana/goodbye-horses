$(function(){
			
	// Fetch and fill in the portfolio
	$.getJSON('../public/json/portfolio.json', function(portfolio_data) {
					
		portfolio_data.works.forEach( function(work) {
			work['slug_name'] = work.name.replace(/[\s-,']+/g, '').toLowerCase()
		}) 

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
				
		var enable_tags = function(event){	
			// Sort works when tags clicked 
			console.log('Tag clicked')
			var sort_key = $(event.target).text();
				
			sorted_works = {
				works: sort_works(sort_key)
			}
				
			var sorted_portfolio = ich.sorted_works_template(sorted_works);
			$('#sorted_works').replaceWith(sorted_portfolio);
				
			$('#works').quicksand( $('#sorted_works li.work') );
		};
					
		$('#works > li > ul > li.tag').live('click', enable_tags);
		$('#works > li > ul > li.tag').live("mouseenter", function() {
			$(event.target).animate({ backgroundColor: "#222" }, 'slow');
		}).live("mouseleave", function() {
			$(event.target).animate({ backgroundColor: "#777" }, 'slow');
		});
					
	})
				
			
				
				
})
		
console.log('hello');
$(document).on('click', 'nav > ul > li > a', function(event) {
	var $target = $(event.target);
	var destination = $target.attr('href');
	var title = $target.text();
	$.get(destination, function() {
		history.pushState({}, title, destination);	
		$('section').fadeOut();
		event.preventDefault();	
	})
});
			
console.log('set up handler');
