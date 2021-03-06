// Sort the data, and create a new template for the page based on the sorted data
// Event handler. Take works_template name and work_data JSON

$(document).on('/work_loaded', function(event, works_template, work_data) {		
	debuglog('Adding work reshuffling')
	
	var sorted_work_template_location = '../mustache/sorted_work.mustache'
	var tags = '#works li.tag';
	$.get(sorted_work_template_location, function(sorted_work_template_string) {
		
		// Return a list of the works with the tag/sort_key mentioned
		var sort_works = function(sort_key) {
			var sorted_works = [];
			work_data.works.forEach(function(work) {
				if ( work.tags.indexOf(sort_key)+1 ) {
					sorted_works.push(work);
				}
			})
			return sorted_works					
		};
		
		// Mouseover animation for tags		
		$(document).on("mouseenter", tags, function(event) {
			$(event.target).animate({ backgroundColor: "#222" }, 'slow');
		}).on("mouseleave", tags, function(event) {
			$(event.target).animate({ backgroundColor: "#777" }, 'slow');
		});	
			
		// Reshuffle the works when the tags are clicked
		$(document).on('click', tags, function(event){	
			
			debuglog('Tag clicked')
			var sort_key = $(event.target).text();
				
			sorted_works = {
				works: sort_works(sort_key)
			}
			
			add_template_if_necessary('sorted_work_template', sorted_work_template_string)
			
			var sorted_portfolio = ich.sorted_work_template(sorted_works);
			
			$('#sorted_works').replaceWith(sorted_portfolio);
			
			// Sort the full works ul based on hidden sorted_works		
			$('#works').quicksand( $('#sorted_works li.work') );
			$.scrollTo('#works', 200, {} );
			

			
		});
		
	})
	
	
		
						
});

	


