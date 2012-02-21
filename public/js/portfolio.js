// No waiting for document ready, because we don't have a document yet!

var path = window.location.pathname
if ( path === "/" ) {
	path = "portfolio"
}

var template_location = '../mustache/'+path+'.mustache'
var template_data_location = '../json/'+path+'.json'

$.get(template_location, function(portfolio_template_string) {
	ich.addTemplate('portfolio_template', portfolio_template_string);
	// Fetch and fill in the portfolio
	$.getJSON(template_data_location, function(portfolio_data) {
	
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
			console.log('updating URL');
			new_location = $(event.target).attr('href');
			$.get('js/works.js', function(data) {
				history.pushState({}, "page 2", new_location);
			})
			event.preventDefault();
		});
		
	
					
	});
	
})
	


