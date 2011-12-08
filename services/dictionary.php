<?php
    $api_key = 'rq8niwo3i5nzaqskdlisso4p91qbsmrkd07vwvzf1m';
    require('get_url.php');
    $body = get_url($_GET['url'].'&vid='.$api_key);
    header('Content-Type: text/xml');
    print($body);
?>
