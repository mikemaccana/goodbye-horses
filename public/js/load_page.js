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

new Resource({ path: "/", template:"blog"});
new Resource({ path: "/work", template:"work"});
new Resource({ path: "/work/im_everyone", template:"individual_work"});
new Resource({ path: "/contact", template:"contact"});

// An edition is a collection of articles
var Edition = Backbone.Collection.extend({
	model : Resource,
	current : function() {  
	    return this.filter(function(resource) {  
	    	return resource.get('version') === 1;  
	    });  
	}  
});


