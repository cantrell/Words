<?php
    require('get_url.php');
    $body = get_url($_GET['url']);
    print($body);
?>
