
/********* ROUTES MODELS, VIEWS, COLLECTIONS *********/
var Route = Backbone.Model.extend({
	defaults: function() {
		return {
			name: 'No Name Entered',
			user: 'Unknown',
			map: null
		};
	}
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
		mapInitialize();
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

/********* END OF ROUTES MODELS, VIEWS, COLLECTIONS *********/

/********* MAPS MODELS, VIEWS, COLLECTIONS *********/

var drawingManagerGlobal;
var mapObjects = [];
var markers = [];
function mapInitialize() {
  var mapOptions = {
    zoom: 14,
    center: new google.maps.LatLng(37.7833, -122.4167),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
  console.log(map.controls);
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