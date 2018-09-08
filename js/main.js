
$(function(){	
	
	var $main = $("#main"),
		$window = $( window ),
	    mainHeight = $main.outerHeight(),
	    mainWidth = $main.outerWidth(),
	    mainAspect = 4/3,
	    resizeTimer;	
	

	$(window).resize( function(e) {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(scaleWindow, 100);	
	});
	
	function scaleWindow() {
		var scale, windowAspect;

		windowAspect = $window.width() / $window.height();

		if (windowAspect>=mainAspect) {
			scale = $window.height() / mainHeight;
		} else {
			scale = $window.width() / mainWidth;
		}

		$main.css({
			transform: "translate(-50%, -50%) " + "scale(" + scale + ")"
		});	 		
	}	
	scaleWindow(); // init
	
});