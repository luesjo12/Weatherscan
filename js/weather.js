
function WeatherManager() {
	

	var mainMap, miniMap, slides,
		dataMan, loops, // weatherAudio,
		that = this;
	
	$(function(){	
		
		// init marquees
		function refreshMarquee () {

			$('#marquee-container')
				.marquee('destroy')
				.marquee({speed: 200, pauseOnHover:true, delayBeforeStart:3000})
				.on('finished', refreshMarquee);
		}		
		refreshMarquee();
		
		
		$('#marquee2').marquee({
			speed: 170, pauseOnHover: true
		});
		
		
		weatherAudio.playCallback = function(tags) {
			$('.track-info').text('playing "' + tags.title + '" by ' + tags.artist);
		}
	  
		// this little guy runs the date and time
		setInterval( 	
			function () { 
				var today = new Date();

				$('#date').text( today.toString().slice(4,10).trimRight() );	
				$('#time').text( today.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true, minute: 'numeric', second: 'numeric' }).replace(/ /g,'') );
			}
		, 1000);
		
		initDataPull();
	  
	});



	function initDataPull() {
		// get the main location data
		// on initialization ready, init local forecast loop
		// on return of fully ready, begin display loops
		
		// check the url for a specific location
		var queryString = window.location.search;
		
		if (queryString) {
			dataMan = createDataManager( queryString.split("?")[1] );
		} else {
			
			// get lat lon from user's ip
			$.getJSON("http://ip-api.com/json/?callback=?", function(data) {						
				dataMan = createDataManager( data.lat+','+data.lon );
			});

		}
		
		function initDisplayLoops(){
			loops  = new Loops(dataMan.locations[0]);			
		}
		function initSlidesLoop() {
			slides = new Slides(dataMan);	
		}
		function createDataManager(searchString) {
			var dataManager = new DataManager();
			
			$(dataManager)
			.on('refresh',    refreshObservationDisplay)
			.on('ready:main', initDisplayLoops)
			.on('allinit',    initSlidesLoop);
			
			dataManager.init(searchString);
			
			return dataManager;
			
		}
			
	}
	
	
	function refreshObservationDisplay() {
		var data = dataMan.locations[0].observations(0),
			cond = data.item.condition,
			loc  = data.location;
		
		if (mainMap===undefined) {
			mainMap = that.mainMap = new Radar("radar-1", 3, 8, data.item.lat, data.item.long, false);
			miniMap = new Radar("minimap", 3, 5, data.item.lat, data.item.long);
		}	
		
		$('#city').text(loc.city);
		$('#forecast-city').text(loc.city + ':');
		$('#current-temp').text( dataMan.locations[0].temperature() ) ;
		$('#conditions-icon').css('background-image', 'url("' + getCCicon(cond.code) + '")');	
		
		//weatherAudio.playCurrentConditions(cond);

	}

}
var weatherMan = new WeatherManager();