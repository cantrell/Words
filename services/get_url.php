<?php

function get_url($url) {
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_HEADER, 0);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array('User-Agent: ' . $_SERVER['HTTP_USER_AGENT']));
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($curl);
    curl_close($curl);

    //header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Origin: http://seeker.home');

    return $result;
}

?>
