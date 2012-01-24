function id(name) { return document.getElementById(name); }

function log() {
    var s = '';
    for (var i = 0; i < arguments.length; ++i) {
        s += arguments[i];
        if (i != (arguments.length - 1)) s += ', ';
    }
    console.log(s);
}

var _xhr;
function getXHR() {
    if (_xhr == null) _xhr = new XMLHttpRequest();
    _xhr.abort();
    return _xhr;
}

function exists(val) { return (val == null || val == undefined || val == '') ? false : true }

function removeAllChildren(element) { while (element.hasChildNodes()) { element.removeChild(element.firstChild);} };

function getSelectedText() { return getSelection(); }
