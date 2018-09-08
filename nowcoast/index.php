<?php
	$url = 'https://nowcoast.noaa.gov/arcgis/services/nowcoast/sat_meteo_imagery_time/MapServer/WMSServer?'.$_SERVER['QUERY_STRING'];
	$ua = 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13';
	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_USERAGENT, $ua);
	curl_setopt($ch, CURLOPT_HEADER_OUT, 1);
	curl_setopt($ch, CURLOPT_BINARYTRANSFER, 1);
	$content = curl_exec($ch);
	$info = curl_getinfo($ch);


	//header('Content-Type:' . $info['content_type']);
	//echo $content
		
		
		
		
		
		
//$decoded = base64_decode("$_REQUEST[sigImageData]"); 
$im   = imagecreatefromstring($content);
$mask = imagecreatefromstring($content);
imagefilter($mask, IMG_FILTER_NEGATE);

$white = imagecolorallocate($im, 255, 255, 255);
imagefilledrectangle($im, 0, 0, 1000, 1000, $white);

imagealphamask( $im, $mask );

// Output

//header('Content-Type: image/png');
header('Content-Type:' . $info['content_type']);
imagesavealpha($im, TRUE); // it took me a good 10 minutes to figure this part out
imagepng($im);
imagedestroy($im);

exit();


function imagealphamask( &$picture, $mask ) {
    // Get sizes and set up new picture
    $xSize = imagesx( $picture );
    $ySize = imagesy( $picture );
    $newPicture = imagecreatetruecolor( $xSize, $ySize );
    imagesavealpha( $newPicture, true );
    imagefill( $newPicture, 0, 0, imagecolorallocatealpha( $newPicture, 0, 0, 0, 127 ) );

    // Resize mask if necessary
    if( $xSize != imagesx( $mask ) || $ySize != imagesy( $mask ) ) {
        $tempPic = imagecreatetruecolor( $xSize, $ySize );
        imagecopyresampled( $tempPic, $mask, 0, 0, 0, 0, $xSize, $ySize, imagesx( $mask ), imagesy( $mask ) );
        imagedestroy( $mask );
        $mask = $tempPic;
    }

    // Perform pixel-based alpha map application
    for( $x = 0; $x < $xSize; $x++ ) {
        for( $y = 0; $y < $ySize; $y++ ) {
            $alpha = imagecolorsforindex( $mask, imagecolorat( $mask, $x, $y ) );
            $alpha = 127 - floor( $alpha[ 'red' ] / 2 );
            $color = imagecolorsforindex( $picture, imagecolorat( $picture, $x, $y ) );
            imagesetpixel( $newPicture, $x, $y, imagecolorallocatealpha( $newPicture, $color[ 'red' ], $color[ 'green' ], $color[ 'blue' ], $alpha ) );
        }
    }

    // Copy back to original picture
    imagedestroy( $picture );
    $picture = $newPicture;
}
		
?>