console.log('Starting backbone')

// Each article is a news item.
var Resource = Backbone.Model.extend({
    defaults: {
		path: null, // Path on site where this resource appears.
        template: 'article', // Name of a mustache template to use. Template itself specifies parents.
		version: 1 // New versions mean we'll stop using this one. TODO: make it a datestamp
    },
    initialize: function(){
		console.log('Creating new resource ');
    }
});

// An edition is a Collection of Resources, representing a single magazine/paper
var Edition = Backbone.Collection.extend({
	model : Resource,
	url: '/json/edition.json',
	// Return today's edition
	get_current : function() {  
	    return this.filter(function(resource) {
			console.log('version is:')  
			console.log(resource.get('version'))
	    	return resource.get('version') === 1;  
	    });  
	}  
});

var edition = new Edition;
var current_resources
edition.fetch({
	success: function(){
		current_resources = edition.get_current();
	}
});  

