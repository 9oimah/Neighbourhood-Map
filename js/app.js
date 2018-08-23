//List of all locations
let places = [
	{
		title: 'Museum of London',
		lat: 51.517618,
		lng: -0.096778
	},
	{
		title: 'Paternoster Square',
		lat: 51.51473,
		lng: -0.099226
	},
	{
		title: 'Bank of England',
		lat: 51.514227,
		lng: -0.088443
	},
	{
		title: 'Barbican Conservatory',
		lat: 51.520003,
		lng: -0.093162
	},
	{
		title:'Barts Pathology Museum',
		lat: 51.517143,
		lng: -0.10069
	}
];

let map;

//Function to create a marker, give it an infoWindow and an eventListener
function Markers(e) {
	let self = this;
	this.title = e.title;
	this.lat = e.lat;
	this.lng = e.lng;
	this.visible = ko.observable(true);

	//Creates a marker
	this.marker = new google.maps.Marker({
		map: map,
		position: new google.maps.LatLng(this.lat, this.lng),
		title: this.title,
		animation: google.maps.Animation.DROP
	});
	
	let largeInfoWindow = new google.maps.InfoWindow();
	
	function populateInfoWindow (marker, infoWindow) {
		//The foursquare API is used to populate the infowindow.
		let foursquareURL = "https://api.foursquare.com/v2/venues/search?ll="+e.lat+','+e.lng+'&client_id=TMRV0HHVGB2EXWSPDGJF3VDMTPA2KOWQ5DDOXDHN2R1UX0TY&client_secret=XTN4XKJME2FOEB4U3LFBG3TOORHAHUIFIEOXXRQ5VAUKLAZ3&v=20180323'+'&query='+marker.title;
		
		$.ajax({
			url: foursquareURL,
			async: true,
			e: {format:'json'},
				success: function(e) {
					let data = e.response.venues[0];
					self.name = data.name;
					self.address = data.location.formattedAddress;
					self.phone = data.contact.formattedPhone;
					self.cat = data.categories[0].name;
					
					if (typeof self.phone == 'undefined'){
						self.phone ="";
					}
					
					infoWindow.setContent('<p>'+self.name+'</p>' + '<p>'+self.cat +'</p>' + '<p>'+self.address+'</p>' + '<p>'+self.phone+'</p>' + '<p>'+'<i>'+'Info provided by Foursquare'+'</i>'+'</p>');
					infoWindow.open(map, marker);
				},
				error: function() {
					alert("Foursquare API did not return any information.");
				}
		});
	}
	
	this.marker.addListener('click', function() {
		self.marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function() {
			self.marker.setAnimation(null);
		}, 1100);
		populateInfoWindow(this, largeInfoWindow);
	});
	
	this.listClick = function () {
		google.maps.event.trigger(self.marker, 'click');
		self.marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function() {
			self.marker.setAnimation(null);
		}, 1100);
    };
}

function ViewModel() {
	let self = this;
	
	this.placesList = ko.observableArray([]);
	this.query = ko.observable("");
	
	places.forEach(function(place) {
		self.placesList.push(new Markers(place));
	});
	
	this.filteredLocations = ko.computed(function() {
		let filter = self.query().toLowerCase();
		if (!filter) {
			self.placesList().forEach(function(place) {
				place.marker.setVisible(true);
			});
			return self.placesList();
		}
		else {
			return ko.utils.arrayFilter(self.placesList(), function(place) {
				let string = place.title.toLowerCase();
				var result = (string.search(filter) >= 0);
				place.marker.setVisible(result);
				return result;
			}, self);
		}
	});
	
	this.showList = function() {
		$(".list").css('width','50%');
	};

	this.closeList = function() {
		$(".list").css('width','0');
	};
}

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 51.516193, lng: -0.096887},
		zoom: 16,
	});
	ko.applyBindings(new ViewModel());
}

function errorHandler(){
	document.getElementById('map').innerHTML= "Oops! We encountered a problem loading the map.";
}
