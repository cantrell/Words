<?php
    $api_key = 'AIzaSyDi8jk9jRW6a-9y0dRa66o2_4HCkeB_2I8';
    require('get_url.php');
    $body = get_url($_GET['url'].'&key='.$api_key);
    print($body);
?>
