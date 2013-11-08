
var Route = Backbone.Model.extend({
	defaults: function() {return {name: 'No Name Entered', user: 'Unknown'};}
});

var RouteView = Backbone.View.extend({
	tagName: "li",
	template: _.template("<%= name %> submitted by <%= user %>"),
	events: {},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		//console.log("RouteView render");
		return this;
	}
});

var RouteList = Backbone.Collection.extend({
	model : Route,
	localStorage: new Backbone.LocalStorage("werunthis-localstorage")
});

var AppView = Backbone.View.extend({
	initialize: function() {
		this.collection.on('add', this.addOne, this);
		this.collection.fetch(); //fires 'add' event
		//console.log('initialize');
	},
	el: $("#container"),
	events: {
		'click #new-route-form button':'formSubmit'
	},
	addOne: function(route) {
		var routeView = new RouteView({model: route});
		this.$('#routes-list').append(routeView.render().el);
		//console.log("addOne");
	},

	formSubmit: function(ev) {
		ev.preventDefault();
        var route = new Route({ name: $('#route-name-input').val(), user: $('#user-name-input').val() });
        this.collection.create(route);
        $('#route-name-input').val('');
        $('#user-name-input').val('');
        //console.log("formSubmit");
	},
	render: function() {

	}
});



$(document).ready(function() {
	var app = new AppView({collection : new RouteList()});

});