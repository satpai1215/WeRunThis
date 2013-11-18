
/********* ROUTES MODELS, VIEWS, COLLECTIONS *********/
var Route = Backbone.Model.extend({
	defaults: function() {
		return {
			name: 'No Name Entered',
			user: 'Unknown',
			map: null,
			id: null
		};
	},
	validate: function(attributes) {
		if(!attributes.name || !attributes.user) {
			return "Route and/or User names cannot be blank.";
		};
	}
});

var RouteView = Backbone.View.extend({
	tagName: "li",
	className: "route-item",
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
		mapInitialize("map-canvas");
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
		var id = this.collection.length;
		var newMap = new RouteMap({map: map, markers: markers, id: id});
        var route = new Route({ name: $('#route-name-input').val(), user: $('#user-name-input').val(), map: newMap, id: id });
        this.collection.create(route);
        $('#route-name-input').val('');
        $('#user-name-input').val('');
        console.log(route.get('id'));
	},
	render: function() {
		return this;
	}
});

/********* END OF ROUTES MODELS, VIEWS, COLLECTIONS *********/

/********* MAPS MODELS AND VIEWS *********/

var RouteMap = Backbone.Model.extend({
	defaults: function() {
		return {
			map: null,
			markers: new Array()
		}
	}
});

var RouteMapView = Backbone.View.extend({
	className: "route-item-map",
	events: {},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		//console.log("RouteView render");
		return this;
	}
});

/********* MAPS FUNCTIONALITY *********/

var drawingManagerGlobal;
var mapObjects = [];
var markers = [];
var geocoder;
var map;

function mapInitialize(id) {
	geocoder = new google.maps.Geocoder();
	var mapOptions = {
	    zoom: 13,
	    center: new google.maps.LatLng(37.7833, -122.4167),
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	  };
	map = new google.maps.Map(document.getElementById(id), mapOptions);
	  //console.log(map.controls);
		drawingManagerGlobal = new google.maps.drawing.DrawingManager({
			  drawingMode: google.maps.drawing.OverlayType.POLYLINE,
			  drawingControl: true,
			  drawingControlOptions: {
			    position: google.maps.ControlPosition.TOP_CENTER,
			    drawingModes: [
			      google.maps.drawing.OverlayType.POLYLINE,
			      google.maps.drawing.OverlayType.MARKER
			    ]
			  },
			  polylineOptions: {
			    editable: true,
			    draggable: true,
			    geodesic: true
			  }
			});
		 
		drawingManagerGlobal.setMap(map);
			//After creating 'drawingManager' object in if block 
	  	google.maps.event.addListener(drawingManagerGlobal, 'overlaycomplete', function(event) {
	      if (event.type == google.maps.drawing.OverlayType.POLYLINE) {
	         mapObjects.push(event.overlay);
	          	console.log(mapObjects.map);
	      } else if (event.type == google.maps.drawing.OverlayType.MARKER) {
	         markers.push(event.overlay);
	      }
	  });
	
	return map;
}

function reCenterMap() {
  var location = $('#location-input').val();
  geocoder.geocode( { 'address': location}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
    } else {
      alert('Geocode was not successful for the following reason: ' + status);
    }
  });
}

function clearMarkers() {
	while(markers[0])
	{
		markers.pop().setMap(null);
	}
}


function clearRoutes() {
	while(mapObjects[0])
	{
		mapObjects.pop().setMap(null);
	}
}

/********* END OF MAPS MODELS, VIEWS, COLLECTIONS *********/

$(document).ready(function() {
	//initialize();

	var app = new AppView({collection : new RouteList()});



});