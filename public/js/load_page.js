console.log('Starting backbone app')

// Each article is a news item.
var Article = Backbone.Model.extend({
    defaults: {
		path: null, // Path on site where this article appears.
        template: 'article', // Name of a mustache template to use. Template itself specifies parents.
		version: 1, // New versions mean we'll stop using this one. TODO: make it a datestamp
		hed: null, // Heading
		byline: null, // Author
		lede: null, // If it bleeds it ledes
		content: null // 
    },
    initialize: function(){
		console.log('Creating new article ');
    }
});
var article = new Article;

// An edition is a Collection of Articles, representing a single magazine/paper
var Edition = Backbone.Collection.extend({
	model : Article,
	url: '/json/edition.json',
	// Return all articles for today's edition
	get_current : function() {  
	    return this.filter(function(article) {
	    	return article.get('version') === 1;  
	    });  
	},
	// Return first article matching path
	get_by_path: function(path) {
		return this.find( function(article) { 
			return article.get('path') === path; 
		});
	}  
});
var edition = new Edition;


// Renders articles on page
var ArticleView = Backbone.View.extend({  
	el:'body',
	initialize: function() {
		this.model.bind('change', this.render, this); // Update the article if modified	
    },
	
	// Show the HTML for the view 
	render : function() {  
		var template_name = this.model.get('template'); 
		$.get("/dust/" + template_name+ ".dust", function(template_contents){
			

			var compiled_template = dust.compile(template_contents, template_name);
			dust.loadSource(compiled_template);
			
			dust.render(template_name, {name: "Fred"}, function(err, output) {
			    console.log(output);
			    console.log($(this.el));
				$(this.el).html(output); // change me to actually find and expand the real template
			}.bind(this));
			
			
		}.bind(this));
		console.log($(this.el))
    	return this; // For chaining
	}  
});

var SiteRouter = Backbone.Router.extend({
	routes: {
		"*path":"load_article", // we're using pushstate globally
	},

	load_article: function(path) {
		
		// Quick hack for test app server
		if ( path === "html/content.html" ) {
			path = '/'
		}		
		
		var article = edition.get_by_path(path)
		var article_view = new ArticleView({model:article});
		article_view.render();
	}
});

var site_router = new SiteRouter;

// Fetch new edition
var current_articles
edition.fetch({
	success: function(){
		current_articles = edition.get_current();
		
  	  	Backbone.history.start({pushState: true})
	}
});  

