function id(name) { return document.getElementById(name); }
function log() {
    var s = '';
    for (var i = 0; i < arguments.length; ++i) {
        s += arguments[i];
        if (i != (arguments.length - 1)) s += ', ';
    }
    console.log(s);
}
function exists(val) { return (val == null || val == undefined || val == '') ? false : true }
function removeAllChildren(element) { while (element.hasChildNodes()) { element.removeChild(element.firstChild);} };
function getSelectedText() { return getSelection();}

function getSpinner(size, numberOfBars, color) {
    var style = document.createElement('style');
    style.innerHTML = '@-webkit-keyframes fade {from {opacity: 1;} to {opacity: 0.25;}}';
    document.getElementsByTagName('head')[0].appendChild(style);
    var spinner = document.createElement('div');
    spinner.style.width = size;
    spinner.style.height = size;
    spinner.style.position = 'relative';
    var rotation = 0;
    var rotateBy = 360 / numberOfBars;
    var animationDelay = 0;
    var frameRate = 1 / numberOfBars;
    for (var i = 0; i < numberOfBars; ++i) {
        var bar = document.createElement('div');
        spinner.appendChild(bar);
        bar.style.width = '12%';
        bar.style.height = '26%';
        bar.style.background = color;
        bar.style.position = 'absolute';
        bar.style.left = '44.5%';
        bar.style.top = '37%';
        bar.style.opacity = '0';
        bar.style['-webkit-border-radius'] = '50px';
        bar.style['-webkit-box-shadow'] = '0 0 3px rgba(0,0,0,0.2)';
        bar.style['-webkit-animation'] = 'fade 1s linear infinite';
        bar.style['-webkit-transform'] = 'rotate('+rotation+'deg) translate(0, -142%)';
        bar.style['-webkit-animation-delay'] = animationDelay + 's';
        rotation += rotateBy;
        animationDelay -= frameRate;
    }
    return spinner;
}