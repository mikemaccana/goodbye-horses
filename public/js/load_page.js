console.log('Starting backbone')

// Each article is a news item.
var Article = Backbone.Model.extend({
    defaults: {
		path: null, // Path on site where this article appears.
        template: 'article', // Name of a mustache template to use. Template itself specifies parents.
		version: 1 // New versions mean we'll stop using this one. TODO: make it a datestamp
    },
    initialize: function(){
		console.log('Creating new article ');
    }
});

// An edition is a Collection of Articles, representing a single magazine/paper
var Edition = Backbone.Collection.extend({
	model : Article,
	url: '/json/edition.json',
	// Return today's edition
	get_current : function() {  
	    return this.filter(function(article) {
			console.log('version is:')  
			console.log(article.get('version'))
	    	return article.get('version') === 1;  
	    });  
	}  
});
var edition = new Edition;

var SiteRouter = Backbone.Router.extend({
	routes: {
		"*path":                 "load_article",    // we're using pushstate globally
	},

	load_article: function(path) {
		console.log('running load_article. path:')
		console.log(path)
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

