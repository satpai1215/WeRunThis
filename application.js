
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
	template: _.template("<%= name %> submitted by <%= user %> <br/>"),
	events: {},
	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		var mapView = new RouteMapView({map: this.model.map});
		mapView.render();
		this.$el.append(mapView.el);
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

		var newMapObject = new RouteMap();
		newMapObject.set(newMap("map-canvas2", polylines, markers));
		$("#map-canvas2").fadeIn(1000);
        var route = new Route({ name: $('#route-name-input').val(), user: $('#user-name-input').val(), map: newMapObject, id: id });
        
        this.collection.create(route);
        $('#route-name-input').val('');
        $('#user-name-input').val('');
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
			drawnRoutes: null,
			markers: new Array(),
			id: null
		}
	}
});

var RouteMapView = Backbone.View.extend({
	className: "route-item-map",
	events: {},
	render: function() {
		//newMap("map-canvas2", polylines[0]);
		//console.log("RouteView render");
		return this;
	}
});

/********* MAPS FUNCTIONALITY *********/

var drawingManagerGlobal;
var polylines = [];
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
		drawingControl: false,
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

  	google.maps.event.addListener(drawingManagerGlobal, 'polylinecomplete', function(pl) {
   
        if(polylines.length == 0) {
        	polylines.push(pl);
        	//put marker at starting point
        	startPoint = new google.maps.Marker({
				draggable: false,
				map: map,
				position: pl.getPath().getArray()[0],
				title: "Starting Point"
			});
			markers.push(startPoint);
			drawingManagerGlobal.setDrawingMode(null); //don't allow user to draw anymore after route is added
        } else {
        	pl.setMap(null);
        	$("#notice").text("You can only create one run path per route.  Please clear the previous path before adding another.");
        	$("#notice").fadeIn(1000).delay(3000).fadeOut(1000);
        }
  	});

	return map;
}

function newMap(id, paths, markers) {
	var mapOptions = {
	    zoom: 13,
	    center: new google.maps.LatLng(37.7833, -122.4167),
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	  };
	
	map = new google.maps.Map(document.getElementById(id), mapOptions);
	var savedRoute;
	paths.forEach(function(path) {
			savedRoute = new google.maps.Polyline({
			path: path.getPath(),
			editable: false,
			draggable: false,
			map: map
		});
	});
	markers.forEach(function(marker) {
			startPoint = new google.maps.Marker({
			draggable: false,
			map: map,
			position: marker.getPosition(),
			title: "Starting Point"
		});
	});

	return {map: map, drawnPaths: polylines, markers: markers};;
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

function clearMap() {
	while(markers[0])
	{
		markers.pop().setMap(null);
	}
	while(polylines[0])
	{
		polylines.pop().setMap(null);
	}

	drawingManagerGlobal.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
}


/********* END OF MAPS MODELS, VIEWS, COLLECTIONS *********/

$(document).ready(function() {
	//initialize();

	var app = new AppView({collection : new RouteList()});

});