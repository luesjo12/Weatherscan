
function Radar(divIDin, intervalHoursIn, zoomIn, latitudeIn, longitudeIn, withSat) {
	
	var map,
	divID = divIDin,
	intervalHours = intervalHoursIn,
	zoom = zoomIn,
	latitude  = latitudeIn,
	longitude = longitudeIn;
	
	this.setView = function(lat, long, zoomLevel){
		map.setView(L.latLng(lat, long), zoomLevel)	
	};
	

	startAnimation();
	setInterval(updatePeriod, 300000);
	
	function updatePeriod() {
		var endDate = roundDate(new Date()),
		    startDate = dateFns.subHours(endDate, 3),
		    newAvailableTimes = L.TimeDimension.Util.explodeTimeRange(startDate, endDate, 'PT5M');		
		
		map.timeDimension.setAvailableTimes(newAvailableTimes, 'replace');
		map.timeDimension.setCurrentTime(startDate);		
	}
	
	// snap date to 5 minute intervals
	function roundDate(date) {
		date.setUTCMinutes( Math.round(date.getUTCMinutes() / 5) * 5);
		date.setUTCSeconds(0);
		return date;
	}
	
	function startAnimation () {

		var endDate = roundDate(new Date()),
			player;	
			
		map = L.map(divID, {
			zoom: zoom,
			fullscreenControl: false,
			timeDimension: true,
			timeDimensionControl: true, 
			timeDimensionOptions:{
				timeInterval: "PT" + intervalHours + "H/" + endDate.toISOString(),
				period: "PT5M",
				currentTime: endDate
			},    

			timeDimensionControlOptions: {
				autoPlay: true,
				playerOptions: {
					buffer: 36,
					transitionTime: 100,
					loop: false,
					startOver:true
				}
			},
			center: [latitude, longitude] // 31.205482,-82.4331197 test coordinates
		});
		map.timeDimensionControl._player.on('stop', function(){ 
			setTimeout( function() {
				map.timeDimensionControl._player.setLooped(true);
				map.timeDimensionControl._player.start();
				setTimeout(function(){map.timeDimensionControl._player.setLooped(false)}, 1000);
			}, 1000) 
		});
		
		
		// basemap
		// streets cj9fqw1e88aag2rs2al6m3ko2
		// satellite streets cj8p1qym6976p2rqut8oo6vxr
		// weatherscan green cj8owq50n926g2smvagdxg9t8
		L.tileLayer('https://api.mapbox.com/styles/v1/swaldner/cj8p1qym6976p2rqut8oo6vxr/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic3dhbGRuZXIiLCJhIjoiY2o4ZGpjcnVvMHBhazMzcDVnanZmd2lobCJ9.Kr5329g4YyZIlnYfHNXRWA', {
			tileSize: 512,
			zoomOffset: -1
		}).addTo(map);	


		var radarWMS = L.nonTiledLayer.wms("https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer", {
			layers: '1',
			format: 'image/png',
			transparent: true,
			opacity: 0.8
		});
		
		if (withSat) {
					
			var goes_visible_sat = L.nonTiledLayer.wms('https://nowcoast.noaa.gov/arcgis/services/nowcoast/sat_meteo_imagery_time/MapServer/WMSServer', {
				layers: '9',  // 9 for visible sat
				format: 'image/png',
				transparent: true,
				opacity:0.7,
				useCanvas:true
			}),			
			    satellitetimeLayer = L.timeDimension.layer.wms(goes_visible_sat, {
				proxy: proxy,
				updateTimeDimension: false,
				cache:1
			});
			
			satellitetimeLayer.addTo(map).on('timeload',function(t) {
				var canvas, ctx,
					imageData, data,
					i,
					layers = t.target._layers,
					keys = Object.keys(layers);

				for (var key of keys) {
					canvas = layers[key]._bufferCanvas;

					if (canvas.dataset.isAlpha){continue}

					ctx = canvas.getContext('2d');

					imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);					
					
					var pixels = imageData.data,
						brighten = 0,
						contrast = 10;
					for(var i = 0; i < pixels.length; i+=4){//loop through all data
						
						pixels[i] += brighten;
						pixels[i+1] += brighten;
						pixels[i+2] += brighten;

						var brightness = (pixels[i]+pixels[i+1]+pixels[i+2])/3; //get the brightness

						pixels[i]   += brightness > 127 ? contrast : -contrast;
						pixels[i+1] += brightness > 127 ? contrast : -contrast;
						pixels[i+2] += brightness > 127 ? contrast : -contrast;

						var rgb = pixels[i] + pixels[i+1] + pixels[i+2];
						pixels[i] = pixels[i+1] = pixels[i+2] = 255;
						pixels[i+3] = rgb / 3;		
					}
					imageData.data = pixels;		

					// overwrite original image
					ctx.putImageData(imageData, 0, 0);

					canvas.dataset.isAlpha = true;

				}

			});			
		}
		

		var proxy = 'js/leaflet/proxy.php';
		var radarTimeLayer = L.timeDimension.layer.wms(radarWMS, {
			proxy: proxy,
			updateTimeDimension: false
		});
		
		radarTimeLayer.addTo(map);
	

	}
}





/* 
 * Workaround for 1px lines appearing in some browsers due to fractional transforms
 * and resulting anti-aliasing.
 * https://github.com/Leaflet/Leaflet/issues/3575
 */

(function(){
	//return;
    var originalInitTile = L.GridLayer.prototype._initTile
    L.GridLayer.include({
        _initTile: function (tile) {
            originalInitTile.call(this, tile);

            var tileSize = this.getTileSize();

            tile.style.width = tileSize.x + 1 + 'px';
            tile.style.height = tileSize.y + 1 + 'px';
        }
    });
})()


