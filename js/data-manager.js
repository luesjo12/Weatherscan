function DataManager(pointSearch){
	var $this = $(this),
		that = this,
		includeRadiusMiles=20;
	
	var _locations = [];

	this.locations = _locations;	
	
	this.location = function(woeid) {
		return _locations.find(x => x.woeid === woeid);
	}
	
	this.init = function (searchString) {
		_locations[0] = new Location();
		
		$(_locations[0])
			
			.on('refresh', function(){ $this.trigger('refresh') })
			.on('ready',   function(){ 
				$this.trigger('ready:main');
			})
			.on('init', initLocations);
		_locations[0].first = true;			
		_locations[0].init(searchString);

	};
		
	// kicks off after main location is returned.
	// create the list of neighboring cities
	function initLocations(){
		
		// find reporting stations
		var observationData = _locations[0].observations(0),
			lat = observationData.item.lat, 
			lon = observationData.item.long,
			locList = [];
		
		// begin the forcast pull
		_locations[0].initForecasts();

		// get a list of observation stations info  
		$.getJSON('https://api.weather.gov/points/' + lat + ',' + lon + '/stations', function(data) {
			
			var feature, geo, station, dist;
			for (var i=0; i < data.features.length; i++) {
				
				feature = data.features[i];
				geo = feature.geometry.coordinates;
				dist = distance(lat, lon, geo[1], geo[0]);
				
				if (dist < includeRadiusMiles) {		
					locList.push({lat: geo[1], long:geo[0], distance:dist, stationUrl:feature.id});
				}
			}
			
			if (locList.length===0) {
				$this.trigger('allinit');
				return
			}
			
			// sort list by distance
			locList.sort(function(a, b) {
				return parseInt(a.distance) - parseInt(b.distance);
			});
			
			// set the station for location 0
			_locations[0].stationUrl = locList[0].stationUrl
			_locations[0].initNWSObservations();
			
			// create location objects, get inital pull
			for(var loc of locList) {
				loc.location = new Location();
				$(loc.location).on('init',onLocationInit);
				loc.location.init(loc.lat+','+loc.long);	
				loc.location.stationUrl = loc.stationUrl;
			}
			
		});
		
		var initCount=0;
		function onLocationInit() {
			initCount++;
			if (initCount===locList.length) {
				allLocationsInit(); 
			}
		}
		
		
		
		
		function allLocationsInit() {
			
			var location, cities=[], city;

			// add locations removing any duplicate cities by name
			for(var loc of locList) {
				
				if (_locations.filter(e => e.city == loc.location.city).length === 0) {
				    _locations.push(loc.location);
					loc.location.initForecasts();
					loc.location.initNWSObservations();
				}				
								
			}

			$this.trigger('allinit');	
		
		}
		
	}

}
