// No waiting for document ready, because we don't have a document yet!
$.get("../mustache/works.mustache", function(work_template_string) {
	ich.addTemplate('portfolio_template', work_template_string);
	
	// Fetch and fill in the portfolio
	$.getJSON('../json/portfolio.json', function(portfolio_data) {		
	
		// Return a list of the works with the tag/sort_key mentioned
		var sort_works = function(sort_key) {
			var sorted_works = [];
			portfolio_data.works.forEach(function(work) {
				if ( work.tags.indexOf(sort_key)+1 ) {
					sorted_works.push(work);
				}
			})
			return sorted_works					
		};
		
		// Sort works when tags clicked 
		$(document).on('click', '#works > li > ul > li.tag', function(event){	
			
			console.log('Tag clicked')
			var sort_key = $(event.target).text();
				
			sorted_works = {
				works: sort_works(sort_key)
			}
				
			var sorted_portfolio = ich.works_template(sorted_works);
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
	
})
	


