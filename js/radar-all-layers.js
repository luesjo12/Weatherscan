
function Radar(divIDin, intervalHoursIn, zoomIn, latitudeIn, longitudeIn) {
	
	var map, currentEndDate,
	divID = divIDin,
	intervalHours = intervalHoursIn,
	zoom = zoomIn,
	latitude  = latitudeIn,
	longitude = longitudeIn;

	startAnimation();
	
	function startAnimation () {

		var endDate = new Date();
	
				
		// snap date to 5 minute intervals
		endDate.setUTCMinutes( Math.round(endDate.getUTCMinutes() / 5) * 5);
		currentEndDate = endDate;

				
		map = L.map(divID, {
			zoom: zoom,
			autoPlay: true,
			fullscreenControl: false,
			timeDimension: true,
			timeDimensionOptions:{
				timeInterval: "PT" + intervalHours + "H/" + endDate.toISOString(),
				period: "PT5M",
				currentTime: endDate,
				loop: true
			}
			
			/*
			,timeDimensionControl: true, 
			timeDimensionControlOptions: {
			autoPlay: true,
			loop: true,
			playerOptions: {
				buffer: 10,
				transitionTime: 150,
				loop: true
			}
			*/
		},

		center: [latitude, longitude] // 31.205482,-82.4331197 test coordinates
		});
		
			
		

		// satellite-streets map
		/*
		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg80?access_token=pk.eyJ1Ijoic3dhbGRuZXIiLCJhIjoiY2o4ZGpjcnVvMHBhazMzcDVnanZmd2lobCJ9.Kr5329g4YyZIlnYfHNXRWA', {
			//maxZoom: 8,
			//minZoom: 8,
			zoom: zoom,
			id: 'mapbox.streets-satellite'
		}).addTo(map);
		*/
		
		// cj8p1qym6976p2rqut8oo6vxr
		L.tileLayer('https://api.mapbox.com/styles/v1/swaldner/cj8p1qym6976p2rqut8oo6vxr/tiles/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic3dhbGRuZXIiLCJhIjoiY2o4ZGpjcnVvMHBhazMzcDVnanZmd2lobCJ9.Kr5329g4YyZIlnYfHNXRWA', {
			tileSize: 512,
			zoomOffset: -1
		}).addTo(map);	
		
		
		//mapbox://styles/swaldner/cj8owq50n926g2smvagdxg9t8 solid green bg

		var radarWMS = L.nonTiledLayer.wms("https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WMSServer", {
			layers: '1',
			format: 'image/png',
			transparent: true,
			opacity: 0.8
		});
/*	
		var goes_infrared = L.nonTiledLayer.wms("https://nowcoast.noaa.gov/arcgis/services/nowcoast/sat_meteo_imagery_time/MapServer/WMSServer", {
			layers: '1',
			format: 'image/png',
			transparent: true,
			opacity: 0.6,
			attribution: 'NOAA nowCOAST'
		});
	
		var goes_visible_sat = L.nonTiledLayer.wms("https://nowcoast.noaa.gov/arcgis/services/nowcoast/sat_meteo_imagery_time/MapServer/WMSServer", {
			layers: '9',
			format: 'image/png',
			transparent: true,
			opacity: 0.6,
			attribution: 'NOAA nowCOAST'
		});		
*/	
		var proxy = 'js/leaflet/proxy.php';
		var radarTimeLayer = L.timeDimension.layer.wms(radarWMS, {
			proxy: proxy,
			updateTimeDimension: false
		});
/*	
		var infraredTimeLayer = L.timeDimension.layer.wms(goes_infrared, {
			proxy: proxy,
			updateTimeDimension: false
		});
		
		var satellitetimeLayer = L.timeDimension.layer.wms(goes_visible_sat, {
			proxy: proxy,
			updateTimeDimension: false
		});
*/		
		//infraredTimeLayer.addTo(map);	
		//satellitetimeLayer.addTo(map);
		radarTimeLayer.addTo(map);		
			
				
		

	}
}

/* 
 * Workaround for 1px lines appearing in some browsers due to fractional transforms
 * and resulting anti-aliasing.
 * https://github.com/Leaflet/Leaflet/issues/3575
 */
(function(){
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

