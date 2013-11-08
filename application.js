
var Route = Backbone.Model.extend({
	defaults: function() {return {name: 'No Name Entered', user: 'Unknown'};}
});

var RouteView = Backbone.View.extend({
	model: new Route(),
	template: _.template("<li><%= name %> submitted by <%= user %></li>"),
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		return this;
	}
});

var RouteList = Backbone.Collection.extend({model : Route});

var RouteListView = Backbone.View.extend({
	model: new RouteList(),
	initialize: function() {
		this.collection.on('add', this.addOne, this);
	},
	el: '#routes-list',
	addOne: function(route) {
		var routeView = new RouteView({model: route});
		this.$el.append(routeView.render().el);
	},
	render: function() {
		this.collection.forEach(this.addOne, this);
	}
});



$(document).ready(function() {
	var routeList = new RouteList();
	var routeListView = new RouteListView({collection : routeList});

 	$('#new-route-form').submit(function(ev) {
 		ev.preventDefault();
        var route = new Route({ name: $('#route-name-input').val(), user: $('#user-name-input').val() });
        routeList.add(route);
             
   	});

});