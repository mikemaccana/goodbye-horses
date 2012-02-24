// Sort the data, and create a new template for the page based on the sorted data
// Event handler. Take works_template name and work_data JSON

$(document).on('/work_loaded', function(event, works_template, work_data) {		
	console.log('Recieved event!')
	console.log(event)
	console.log(works_template)
	console.log(work_data)
	
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
		
	// Sort works when tags clicked 
	var tags = '#works li.tag';
	$(document).on('click', tags, function(event){	
			
		console.log('Tag clicked')
		var sort_key = $(event.target).text();
				
		sorted_works = {
			works: sort_works(sort_key)
		}
				
		var sorted_portfolio = ich[works_template](sorted_works);
		$('#sorted_works').replaceWith(sorted_portfolio);
				
		$('#works').quicksand( $('#sorted_works li.work') );
	});
		
	// Mouseover animation for tags 					
	$(document).on("mouseenter", tags, function() {
		$(event.target).animate({ backgroundColor: "#222" }, 'slow');
	}).on("mouseleave", tags, function() {
		$(event.target).animate({ backgroundColor: "#777" }, 'slow');
	});
		
	// Show dialog when images clicked
	$('#works img').on('click', function(event){
		ui.dialog('jQuery object', $('Just a <strong>string</strong> of <em>HTML</em>.')).closable().show();
		event.preventDefault();
	});							
});

	


