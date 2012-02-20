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
	
	// Get most recent tweet
	var most_recent_tweet_url = 'http://api.twitter.com/1/statuses/user_timeline.json?screen_name='+portfolio_data['twitter']+'&count=1';
	$.getJSON(most_recent_tweet_url), function (tweet_data) {
		var tweet = tweet_data[0]['text']
		$('p#last_tweet').text(tweet);
	}
			
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
	
	// Set up moving underline
    var $current_link
	var $nav_container = $("#nav_container > ul");
	
    $nav_container.append("<li id='highlight'></li>");
    var $highlight = $("#highlight");
    $highlight
        .width($(".current_page_item").width())
        .css("left", $(".current_page_item a").position().left)
        .data("original_left", $highlight.position().left)
        .data("original_width", $highlight.width());

	// Slide underline when hovered, back when unhovered 	
    $("#nav_container > ul > li a").hover(function(event) {
        $current_link = $(event.target);
        var new_left_position = $current_link.position().left;
        var new_width = $current_link.parent().width();
        $highlight.stop().animate({
            left: new_left_position,
            width: new_width
        });
    }, function() {
        $highlight.stop().animate({
            left: $highlight.data("original_left"),
            width: $highlight.data("original_width")
        });
    });
	
					
});
	


