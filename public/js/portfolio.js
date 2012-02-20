// No waiting for document ready, because we don't have a document yet!
$.get("../mustache/portfolio.mustache", function(portfolio_template_string) {
	ich.addTemplate('portfolio_template', portfolio_template_string);
	
	console.log(portfolio_template_string);
	
	// Fetch and fill in the portfolio
	$.getJSON('../json/portfolio.json', function(portfolio_data) {
	
		// Fill in our template and add to document					
		portfolio_data.works.forEach( function(work) {
			work['slug_name'] = work.name.replace(/[\s-,']+/g, '').toLowerCase();
		}) 
		portfolio_data['year'] = new Date().getFullYear();
		var portfolio = ich.portfolio_template(portfolio_data);
		$('body').append(portfolio);
	
		// Get most recent tweet
		/*var most_recent_tweet_url = 'http://api.twitter.com/1/statuses/user_timeline.json?screen_name='+portfolio_data['twitter']+'&count=1';
		$.getJSON(most_recent_tweet_url), function (tweet_data) {
			var tweet = tweet_data[0]['text']
			$('p#last_tweet').text(tweet);
		}
		*/
				
		// Set up moving underline
	    var $hovered_link
		var width_offset = -30
		var left_offset = - (width_offset/2);

		var $nav_container = $("#nav_container > ul");
	
	    $nav_container.append("<li id='highlight'></li>");
	    var $highlight = $("#highlight");
	    $highlight
	        .width($(".current_page_item").width() + width_offset)
	        .css("left", $(".current_page_item a").position().left + left_offset)
	        .data("original_left", $highlight.position().left)
	        .data("original_width", $highlight.width());

		// Slide underline when hovered, back when unhovered 	
	    $("#nav_container > ul > li a").hover(function(event) {
	        $hovered_link = $(event.target);
	        var new_left_position = $hovered_link.position().left + left_offset;
	        var new_width = $hovered_link.parent().width() + width_offset;
	        $highlight.stop().animate({
	            left: new_left_position,
	            width: new_width
	        },'fast');
	    }, function() {
	        $highlight.stop().animate({
	            left: $highlight.data("original_left"),
	            width: $highlight.data("original_width")
	        },'fast');
	    });
	
					
	});
	
})
	


