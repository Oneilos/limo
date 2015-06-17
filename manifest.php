<?php     
    $fichiers = array(

        // CSS
        'css/ld.css',
        'css/jquery-ui.css',

        // JQUERY + MUSTACHE
        'jquery/jquery-1.8.3.min.js',
        'jquery/jquery-ui-1.8.24.min.js',
        'jquery/mustache.min.js',

        // JAF
        'js/jaf.kernel.js',
        'js/jaf.cm.js',
        'js/jaf.eve.js',
        'js/jaf.tm.js',
        'js/gds.js',


        'js/lib/select.js',
        'js/lib/concept.js',
        'js/lib/controller.js',

        'js/jfo.js',

        //CONTROLLEUR
        'js/ld.js',

        //DATA CONTROLLEUR
        'js/dictionnaire.js',

    );
    
    if (filemtime('../../../application/views/scripts/ld/index.tpl')>filemtime('index.html') 
     || filemtime('../../../application/controllers/LdController.php')>filemtime('index.html')) {
            unlink('index.html');
            $home = file_get_contents('https://www.limo-vtc.fr/ld/');
            file_put_contents('index.html', $home);
    }
    
    $cache   = '';
    $version = filemtime( 'manifest.php' )+filemtime('index.html'); 
    foreach ( $fichiers as $e ) { 
        /*$pos      = strrpos($e,'.');
        $temps    = filemtime( '../'.$e );
        $version += $temps;
        $cache   .= substr( $e , 0 , $pos ) . '.' . $temps . substr( $e , $pos ) . "\n";*/
        $cache .= $e . PHP_EOL;
    }

    header( 'Expires: Sat, 26 Jul 1997 05:00:00 GMT' ); 
    header( 'Last-Modified: ' . gmdate( 'D, d M Y H:i:s' ) . ' GMT' ); 
    header( 'Cache-Control: no-store, no-cache, must-revalidate' ); 
    header( 'Cache-Control: post-check=0, pre-check=0', false ); 
    header( 'Pragma: no-cache' ); 
    header( 'Content-type: text/cache-manifest; charset=utf-8' );
/*
*/ 
    
?>CACHE MANIFEST
#v<?php echo $version; ?> 

CACHE:
/ld/
<? echo $cache ?>
/modbop/font/signika.woff
/modbop/font/signika-semibold.woff
/modbop/font/bop_icone-webfont.woff
/ld/apple-touch-icon-114x114-precomposed.png	
/ld/apple-touch-icon-72x72-precomposed.png	
/ld/apple-touch-icon-precomposed.png
/ld/apple-touch-icon.png	
/ld/favicon.ico
/ld/favicon.png

NETWORK:
/proxyUrl.php
*
