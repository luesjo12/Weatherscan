/*

headings:
RADAR < MAIN CITY < CITY 1 < CITY 2
*/



	// load slide data
	function Slides(dataMan) {
		var radarSlideDuration = 60000,
			slideDelay = 10000;
				
		buildHeader();	
		
		setTimeout(nextCity, 5000);
		
		
		// loop cities
		function nextCity(){
			
			advanceHeader();
			
			var city = $('#info-slides-header .city.current');
			
			// is radar or city?
			if (city[0].dataset.woeid) {
				// show slide deck for the current city				
				showCitySlides( dataMan.location(city[0].dataset.woeid), 0 );

			} else {
				
				
				// radar
				showRadar(dataMan.locations[0].lat, dataMan.locations[0].long, 8);
				
				//setTimeout(function() { weatherAudio.playLocalRadar() }, 2000 );
				
				// show for how long?
				setTimeout(nextCity, 60000);

			}
	
		}
		
			
		
		function showRadar(lat, long, zoom) {
			
			weatherMan.mainMap.setView(lat, long, zoom);			
			
			setTimeout(function() {
	
				// fade out info, fade in radar
				$('.info-slide-content:visible').fadeOut(250, function(){
					$('.info-slide').fadeOut(250, function() {
						$('.radar-slide').fadeIn(500);
					});				
				});
				
			}, 1500); // give it time to load
			
		}
					
		
		// show the set of slides for one city		
		function showCitySlides(location, idx) {
				
			var currentDisplay,
				displays = {

				// Currently (10 sec)
				currentConditions() {
					$('.city-info-slide #subhead-title').text('Currently');
					$('.city-info-slide #subhead-city').text(location.city);
					
					var obsData = location.observations,		
						strLabels =	'Humidity<br>Dew Point<br>Pressure<Br>Wind<br>Gusts<br>',
						strData =
							obsData(0).atmosphere.humidity + '%<br>'+
							dewPoint(obsData(0).item.condition.temp, obsData(0).atmosphere.humidity ) + '<br>' +
							(obsData(0).atmosphere.pressure*0.0295301).toFixed(2) + ' ' + ['S','R','F'][obsData(0).atmosphere.rising] + '<br>' +
							degToCompass(obsData(0).wind.direction) + ' ' + 
							obsData(0).wind.speed + '<br>' + 
							(obsData(1).windGust.value!=null ? mps2mph( obsData(1).windGust.value ) : 'none') + 
							'<br>' // gusts show mph 					
					;

					if (parseInt(obsData(0).wind.chill) < parseInt(obsData(0).item.condition.temp)) {
						strLabels+='Wind Chill';
						strData+= obsData(0).wind.chill + '&deg;';	
					} else if (parseInt(obsData(0).item.condition.temp)>=80 && parseInt(obsData(0).atmosphere.humidity)>=40 ){
						strLabels+='Heat Index';
						return 'heat index ' + heatIndex(obsData(0).item.condition.temp, obsData(0).atmosphere.humidity) + '&deg;';
					}

					$('.city-info .frost-pane .labels').html(strLabels);
					$('.city-info .frost-pane .data').html(strData);

					// right pane
					$('.city-info .icon').css('background-image', 'url("' + getCCicon(obsData(0).item.condition.code) + '")');	
					$('.city-info .conditions').text( obsData(0).item.condition.text );
					$('.city-info .temp').text( obsData(0).item.condition.temp );
					
					fadeToContent('.city-info');
					wait(slideDelay);

				}

				// Local Doppler Radar or Radar/Satellite (15 sec, zoomed out with cloud cover)
				,localDoppler(){
					showRadar(location.lat, location.long, 8);
					wait(slideDelay + 1500);
				}


				// Local Forecast -Today (10 sec)
				,forecast(fidx) {
					var div = '.info-slide-content.forecast ',
						forecasts = location.forecasts('daily');					
					
					function fillinfo() {						

						fidx = (fidx===undefined ? 0 : fidx);

						$('.city-info-slide #subhead-title').text('Local Forecast');

						// title
						$(div + '.title').text( forecasts[fidx].name );

						// content
						resizeText( forecasts[fidx].detailedForecast );
						$(div + '.content').text( forecasts[fidx].detailedForecast );
						
					}
					
					fadeToContent(div, fillinfo);

					setTimeout( function() {

						if (fidx<3) {
							currentDisplay(++fidx);
						} else {
							wait(0);	
						}

					}, slideDelay);					
					
				}



				// Extended Forecast(5 day columns)
				//,extendedForecast() {},
				
		},
		keys = Object.keys(displays);
				
			
		if (idx<keys.length) {
			currentDisplay = displays[keys[idx]];
			currentDisplay(); 
		} else { // done - exit
			nextCity(); 
		}
		return;
						
		function wait(duration){
			setTimeout(function() { 
				showCitySlides(location, ++idx); 
			}, duration);			
		}
			
			
			
		function resizeText(text){
			var s = 50,
				$container = $('.info-slide-content.forecast .content'),
				$test = $('<div style="position:absolute;top:100%;"></div>') .appendTo($container) .css('font-size', s + 'px') .html(text);
			
			// have to display parent so we can get measurements
			$container.closest('.info-slide-content').show();
			
			$test.width($container.width() );
			while ($test.outerHeight(true) >= ($container.height()) ) {
				s -= 1;
				$test.css('font-size', s + 'px');
			}
			$container.closest('.info-slide-content').hide();
			$container .text(text) .css('font-size', s + 'px');
			$test.remove();

		}			
			
			
		function fadeToContent(to, callfirst) {
			var $to = $(to),
				$parent = $to.closest('.info-slide');
			
			if ( $parent.is(":hidden") ) {
				// hide other visible slide then show the parent
				$to.hide();
				$('.info-slide:visible').fadeOut(250, function() {
					//$to.hide();
					$parent.fadeIn(250, showMe);
				});
			} else {
				hideOldShowMe();
			}
			
			function hideOldShowMe() {				
				if ($('.info-slide-content:visible')) {
					$('.info-slide-content:visible').fadeOut(500, showMe);
				} else {
					showMe();
				}
			}
			
			function showMe() {
				if (callfirst) { callfirst() };
				$to.fadeIn(500);
			}

		}			
			
		//doDisplay = displays[ keys[idx] ]();

			// increment the pointer
			//idx = (++idx===keys.length ? 0 : idx);

			//if (text) { 
			//	$('#current-info').html(text);
			//	setTimeout(function(){ displayAtmospheric(idx) }, 6000); // 6 second increment loop
			//} else {
				// nothing to display - skip to the next one
			//	setTimeout(function(){ displayAtmospheric(idx) }, 0); 
			//}					

			/*
			(Main City)
			Currently (10 sec)
			Local Doppler Radar or Radar/Satellite (15 sec, zoomed out with cloud cover)
			Local Forecast
			-Today (10	 sec)
			-Tonight (10 sec)
			-Tomorrow (name day) (10 sec)
			-Tomorrow (name day) Night (10 sec)

			Extended Forecast(5 day columns)
			Almanac

			(Per City)
			Local Doppler Radar (center on city)
			Currently
			Local Doppler Radar
			Today's Forecast
			Extended Forecast(5 day columns)
			*/

			

			//idx++;
			//if (idx<=0){
				setTimeout(cityLoop, 3000);  // change to 60000 for production	
			//} else {
				
			//}
			
		}

		
		
		function advanceHeader() {
			
			// swap current
			var $cities = $('#info-slides-header .city'),
				$scroller = $('#info-slides-header .hscroller'),
				left;
			
			$($cities[0]).removeClass('current');
			$($cities[1]).addClass('current');
			
			// animate move left
			left = $scroller.position().left - $($cities[1]).position().left;
			$scroller.animate({ 'left':	left+'px' }, 700,
			function(){
				// on completion, move the old one to the end
				$scroller.css('left','');
				$($cities[0]).appendTo($scroller);
				$('#info-slides-header span').first().appendTo($scroller);								
			})
	
			
		}
		
	function buildHeader(){
		var city, first, woeid,
			cities='',
			arrow='<span class="divider-arrow">&lt;</span>',
			radar='<span class="city radar">LOCAL RADAR</span>';

		for (var location of dataMan.locations) {
			city = location.city;
			cities += arrow+'<span class="city" data-woeid="' + location.woeid + '">' + city + '</span>';			
		}

		$('#info-slides-header .hscroller').append(cities + arrow + (radar + cities + arrow).repeat(4));
	}		
	



}  // end function



