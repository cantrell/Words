var minWordInputWidth;

var intervals = {
    scroll: -1
};

var historyData = {
    wordHistory: null,
    MAX_LENGTH: 50,
    KEY: 'wordHistory'
}

function init() {
    window.addEventListener('beforeunload', onUnload);
    window.addEventListener('keydown', onKeyDown);
    id('wordInput').addEventListener('keyup', onWordInputChange);
    id('dataContainer').addEventListener('dblclick', onDoubleClick);
    minWordInputWidth = id('ruler').clientWidth + 4;
    id('wordInput').style.width = minWordInputWidth + 'px';
    id('wordInput').placeholder = id('ruler').innerHTML;
    id('wordInput').style.visibility = 'visible';

    // Set up the spinner
    var spinner = Spinner.getSpinner('20px', 12, '#000');
    spinner.setAttribute('id', 'spinner');
    spinner.setAttribute('class', 'fadable');
    id('spinnerContainer').appendChild(spinner);

    // Set up history management
    window.onpopstate = onPopState;

    // Check for initial state
    var word = getWordFromUrl();
    if (exists(word)) setWordInput(word);

    loadWordHistory();
}

function onUnload() {
    window.localStorage.setItem(historyData.KEY, JSON.stringify(historyData.wordHistory));
}

function loadWordHistory() {
    // wordHistory.KEY = [{word:'a', id:0}, {word:'b', id:1}, {word:'c', id:2}]
    historyData.wordHistory = eval(window.localStorage.getItem(historyData.KEY));
    if (!exists(historyData.wordHistory)) historyData.wordHistory = [];
    var ol = document.createElement('ol');
    id('historyContainer').appendChild(ol);
    ol.setAttribute('id', 'historyList');
    for (var i = 0; i < historyData.wordHistory.length; ++i) {
        addWordToHistoryDrawer(historyData.wordHistory[i].word, historyData.wordHistory[i].id);
    }
}

function addWordToHistoryDrawer(word, wordId) {
    var historyList = id('historyList');
    var li = document.createElement('li');
    historyList.insertBefore(li, historyList.firstChild);
    li.setAttribute('id', wordId);
    var wordA = document.createElement('a');
    li.appendChild(wordA);
    wordA.setAttribute('href', 'javascript:setWordInput("'+word+'")');
    wordA.setAttribute('tabindex', '-1')
    wordA.innerHTML = word;
    var deleteA = document.createElement('a');
    li.appendChild(deleteA);
    deleteA.setAttribute('href', 'javascript:removeFromHistory("'+wordId+'")');
    deleteA.setAttribute('tabindex', '-1')
    deleteA.innerHTML = '&nbsp;&nbsp;&#10007;';
}

function removeFromHistory(wordId) {
    for (var i = 0; i < historyData.wordHistory.length; ++i) {
        if (historyData.wordHistory[i].id == wordId) {
            historyData.wordHistory.splice(i, 1);
            break;
        }
    }
    var lis = id('historyList').childNodes;
    for (var i = 0; i < lis.length; ++i) {
        if (lis[i].getAttribute('id') == wordId) {
            id('historyList').removeChild(lis[i]);
            break;
        }
    }
}

function clearHistory() {
    historyData.wordHistory = [];
    window.localStorage.removeItem(historyData.KEY);
    removeAllChildren(id('historyList'));
}

function getWordFromUrl() {
    var loc = document.location.href;
    if (loc.indexOf('#') != -1) {
        var word = loc.substr(loc.indexOf('#')+1, loc.length);
        if (word.length != 0) { return word; }
    }
    return null;
}

function onPopState(event) {
    var word = event.state;
    if (!exists(word)) {
        word = getWordFromUrl();
    }
    if (exists(word)) setWordInput(word);
}

function pushState(word) {
    if (historyData.wordHistory.length > 0) {
        var lastWord = historyData.wordHistory[historyData.wordHistory.length - 1].word;
        if (word == lastWord) return;
    }
    window.history.pushState(word, 'Words: ' + word, '#'+word);
    var id = new Date().getTime();
    historyData.wordHistory.push({word:word, id: id});
    addWordToHistoryDrawer(word, id);
    if (historyData.wordHistory.length > historyData.MAX_LENGTH) {
        historyData.wordHistory.shift();
        historyList.removeChild(historyList.lastChild);
    }
}

function setWordInput(word) {
    id('wordInput').value = word;
    onWordInputChange();
}

function onDoubleClick(event) {
    var selectedText = getSelectedText();
    if (!exists(selectedText)) return;
    setWordInput(selectedText);
}

function onKeyDown(event) {
    if (event.keyCode == 27) {
        console.log("WHY AM I BEING CALLED SO MUCH?"); // TODO
        setWordInput('');
        id('dataContainer').style.opacity = 0;
        hideHelp();
        hideHistory();
    }
}

function onWordInputChange(event) {
    var inputVal = id('wordInput').value;
    if (exists(event) && exists(event.keyCode) && ((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode == 8)) ) {
        startLookup(doDictionary, 'spelling');
    }
    id('ruler').innerHTML = inputVal;
    wordInputWidth = id('ruler').clientWidth + 12;
    if (wordInputWidth > minWordInputWidth) {
        id('wordInput').style.width = wordInputWidth + 'px';
    } else {
        id('wordInput').style.width = minWordInputWidth + 'px';
    }
    id('operationContainer').style.opacity = (inputVal.length == 0) ? 0 : 1;
}

function startLookup(searchFunction, arg1, arg2, arg3) {
    if (id('wordInput').value == '') return;
    id('spinner').style.opacity = 1;
    scrollUp();
    if (arg1 == 'spelling') {
        id('dataContainer').style.opacity = 0;
        searchFunction.apply(window, [arg1, arg2, arg3]);
    } else {
        var transitionEnd = (navigator.userAgent.indexOf('WebKit') != -1) ? 'webkitTransitionEnd' : 'transitionend' ;
        var callback = function() {
            id('dataContainer').removeEventListener(transitionEnd, callback);
            searchFunction.apply(window, [arg1, arg2, arg3]);
        };
        id('dataContainer').addEventListener(transitionEnd, callback);
        setTimeout(function(){id('dataContainer').style.opacity = 0}, 1);
    }
}

function finishLookup() {
    id('spinner').style.opacity = 0;
    setTimeout(function(){id('dataContainer').style.opacity = 1}, 1);
}

function scrollUp() { intervals.scroll = setInterval(_scroll, 10); }

function _scroll() {
    window.scrollBy(0, -(window.scrollY / 5));
    if (window.scrollY <= 5) {
        clearInterval(intervals.scroll);
        window.scrollTo(0, 0);
    }
}

// Wikipedia

function doResearch(topic) {
    var title;
    if (exists(topic)) {
        title = topic;
        setWordInput(topic.replace(/_/g, ' '));
    } else {
        title = id('wordInput').value;
    }
    pushState(title);
    title = title.replace(/ /g, '_');
    wikipediaRequest('http://en.wikipedia.org/w/index.php?action=render&title=' + encodeURIComponent(title));
}

function wikipediaRequest(url) {
    var fullUrl = 'http://www.christiancantrell.com/words/services/wikipedia.php?url=' + encodeURIComponent(url);
    var xhr = getXHR();
    xhr.onreadystatechange = function ()
    {
        if (this.readyState == 4 && this.status == 200) {
            id('dataContainer').innerHTML = this.responseText;
            var anchors = id('dataContainer').getElementsByTagName('a');
            for (var i = 0; i < anchors.length; ++i) {
                var href = anchors[i].getAttribute('href');
                if (href.match(/^\/\/en\.wikipedia\.org\/wiki\//)) {
                    anchors[i].setAttribute('href', 'javascript:startLookup(doResearch, "' + href.substring(href.lastIndexOf('/') + 1, href.length) + '");');
                } else {
                    anchors[i].setAttribute('target', '_new');
                }
            }
            finishLookup();
        }
    };
    xhr.open('GET', fullUrl);
    xhr.send();
}

// Dictionary

function doDictionary(site, word) {
    var q = (word != null) ? word: id('wordInput').value;
    if (site != 'spelling') pushState(q);
    if (site == 'dictionary') {
        dictionaryRequest('http://api-pub.dictionary.com/v001?type=define&site='+site+'&q='+q);
    } else if (site == 'thesaurus') {
        thesaurusRequest('http://api-pub.dictionary.com/v001?type=define&site='+site+'&q='+q);
    } else if (site == 'spelling') {
        spellingRequest('http://api-pub.dictionary.com/v001?type='+site+'&q='+q);
    }
}

function spellingRequest(url) {
    var fullUrl = 'http://www.christiancantrell.com/words/services/dictionary.php?url=' + encodeURIComponent(url);
    var xhr = getXHR();
    xhr.onreadystatechange = function ()
    {
        if (this.readyState == 4 && this.status == 200) {
            removeAllChildren(id('dataContainer'));
            var outputDiv = document.createElement('div');
            var response = this.responseXML;
            var ul = document.createElement('ol');
            outputDiv.appendChild(ul);
            var bestMatch = response.getElementsByTagName('bestmatch');
            if (bestMatch.length > 0) {
                var bestMatchText = bestMatch[0].getElementsByTagName('dictionary')[0].childNodes[0].nodeValue;
                var bmLi = document.createElement('li');
                ul.appendChild(bmLi);
                bmLi.setAttribute('id', 'dictionaryBestMatch');
                var bmA = document.createElement('a');
                bmLi.appendChild(bmA);
                bmA.setAttribute('href', 'javascript:setWordInput("'+bestMatchText+'");');
                bmA.innerHTML = bestMatchText;
            }

            var suggestions = response.getElementsByTagName('suggestion');

            for (var i = 0; i < suggestions.length; ++i) {
                var suggestion = suggestions[i];
                var suggestionText = suggestion.childNodes[0].nodeValue;
                var sugLi = document.createElement('li');
                ul.appendChild(sugLi);
                var sugA = document.createElement('a');
                sugLi.appendChild(sugA);
                sugA.setAttribute('href', 'javascript:setWordInput("'+suggestionText+'");');
                sugA.innerHTML = suggestionText;
            }
            id('dataContainer').appendChild(outputDiv);
            finishLookup();
        }
    };
    xhr.open('GET', fullUrl);
    xhr.send();
}

function thesaurusRequest(url) {
    var fullUrl = 'http://www.christiancantrell.com/words/services/dictionary.php?url=' + encodeURIComponent(url);
    var xhr = getXHR();
    xhr.onreadystatechange = function ()
    {
        if (this.readyState == 4 && this.status == 200) {

            removeAllChildren(id('dataContainer'));
            var outputDiv = document.createElement('div');
            var response = this.responseXML;
            var entries = response.getElementsByTagName('entry');

            if (entries.length == 0) {
                outputDiv.innerHTML = 'No synonyms found.';
            }

            for (var i = 0; i < entries.length; ++i) {
                var entry = entries[i];
                var entryDiv = document.createElement('div');
                outputDiv.appendChild(entryDiv);

                var headwordSpan = document.createElement('span');
                headwordSpan.setAttribute('class', 'dictionaryHeadword');
                entryDiv.appendChild(headwordSpan);
                headwordSpan.innerHTML = entry.getElementsByTagName('headword')[0].childNodes[0].nodeValue;

                var posSpan = document.createElement('span');
                posSpan.setAttribute('class', 'dictionaryPos');
                entryDiv.appendChild(posSpan);
                posSpan.innerHTML = '&nbsp;' + entry.getElementsByTagName('partofspeech')[0].childNodes[0].nodeValue;

                var defSpan = document.createElement('span');
                entryDiv.appendChild(defSpan);
                defSpan.innerHTML = '&nbsp;' + entry.getElementsByTagName('definition')[0].childNodes[0].nodeValue;

                var synonymsDiv = document.createElement('div');
                entryDiv.appendChild(synonymsDiv);
                var synonymsBq = document.createElement('blockquote');
                synonymsDiv.appendChild(synonymsBq);
                var synonymsText = entry.getElementsByTagName('synonyms')[0].childNodes[0].nodeValue;
                synonymsText = synonymsText.replace(/<a.*?>(.+?)<\/a>/img, '$1');
                synonymsBq.innerHTML = synonymsText;
            }

            id('dataContainer').appendChild(outputDiv);
            finishLookup();
        }
    };
    xhr.open('GET', fullUrl);
    xhr.send();
}

function dictionaryRequest(url) {
    var fullUrl = 'http://www.christiancantrell.com/words/services/dictionary.php?url=' + encodeURIComponent(url);
    var xhr = getXHR();
    xhr.onreadystatechange = function ()
    {
        if (this.readyState == 4 && this.status == 200) {
            removeAllChildren(id('dataContainer'));
            var outputDiv = document.createElement('div');
            var response = this.responseXML;
            var entries = response.getElementsByTagName('entry');

            if (entries.length == 0) {
                outputDiv.innerHTML = 'No definitions found.';
            }

            for (var i = 0; i < entries.length; ++i) {
                var entry = entries[i];
                var displayFormDiv = document.createElement('div');
                var displayFormSpan = document.createElement('span');
                displayFormDiv.appendChild(displayFormSpan);
                displayFormSpan.setAttribute('class', 'dictionaryHeadword');
                displayFormSpan.innerHTML = entry.getElementsByTagName('display_form')[0].childNodes[0].nodeValue;

                // Are we an idiom?
                var idiomTest = (entry.getElementsByTagName('partofspeech')[0].getAttribute('pos') == 'idiom') ? true : false;
                if (idiomTest) {
                    var idiomSpan = document.createElement('span');
                    displayFormSpan.appendChild(idiomSpan);
                    idiomSpan.setAttribute('class', 'dictionaryPos');
                    var labelTest = entry.getElementsByTagName('partofspeech')[0].getAttribute('label');
                    idiomSpan.innerHTML = (exists(labelTest) && labelTest == "Informal") ? '&nbsp;(idiom,&nbsp;informal)' : '&nbsp;(idiom)' ;
                }

                var pron = entry.getElementsByTagName('pron')[0];
                if (pron != undefined) {
                    var pronSpan = document.createElement('span');
                    pronSpan.setAttribute('class', 'dictionaryPron');
                    pronSpan.innerHTML = '&nbsp;' + pron.childNodes[0].nodeValue;
                    displayFormDiv.appendChild(pronSpan);
                }

                // parts of speech
                var partsOfSpeech = entry.getElementsByTagName('partofspeech');

                var posOl = document.createElement('ol');
                if (partsOfSpeech.length > 0 && !idiomTest) {
                    displayFormDiv.appendChild(posOl);
                }

                for (var j = 0; j < partsOfSpeech.length; ++j) {
                    var pos = partsOfSpeech[j];
                    var posLi = document.createElement('li');
                    posLi.innerHTML = pos.getAttribute('pos');
                    posOl.appendChild(posLi);

                    var defSet = pos.getElementsByTagName('defset')[0];

                    if (defSet != undefined) {
                        var defUl = document.createElement('ul');
                        if (idiomTest) {
                            displayFormDiv.appendChild(defUl);
                        } else {
                            posLi.appendChild(defUl);
                        }
                        var defs = defSet.getElementsByTagName('def');
                        for (var k = 0; k < defs.length; ++k) {
                            var def = defs[k];
                            var defLi = document.createElement('li');
                            defUl.appendChild(defLi);
                            defLi.innerHTML = def.childNodes[0].nodeValue;
                        }
                    }
                }

                // derivatives
                var derivatives = entry.getElementsByTagName('derivatives');
                var derOl = document.createElement('ol');
                if (derivatives.length > 0) {
                    var derP = document.createElement('p');
                    displayFormDiv.appendChild(derP);
                    derP.setAttribute('class', 'dictionaryDerivativesLabel');
                    derP.innerHTML = 'derivatives';
                    displayFormDiv.appendChild(derOl);
                }

                for (var j = 0; j < derivatives.length; ++j) {
                    var derivative = derivatives[j];
                    var derLi = document.createElement('li');
                    derLi.innerHTML = derivative.getAttribute('pos');
                    derOl.appendChild(derLi);

                    var frms = derivative.getElementsByTagName('frm');

                    if (frms.length > 0) {
                        var frmUl = document.createElement('ul');
                        derLi.appendChild(frmUl);
                        for (var k = 0; k < frms.length; ++k) {
                            var frm = frms[k];
                            var headword = frm.getElementsByTagName('headword')[0].childNodes[0].nodeValue;
                            var phon = frm.getElementsByTagName('phon')[0].childNodes[0].nodeValue;
                            var frmLi = document.createElement('li');
                            frmUl.appendChild(frmLi);
                            frmLi.innerHTML = headword + '  (' + phon + ')';
                        }
                    }
                }
                outputDiv.appendChild(displayFormDiv);
            }
            id('dataContainer').appendChild(outputDiv);
            finishLookup();
        }
    };
    xhr.open('GET', fullUrl);
    xhr.send();
}

var isShowing = {
    help:false,
    wordHistory:false
};

function showHelp() {
    if (isShowing.help) {
        hideHelp();
        return;
    }
    id('helpBox').style.left = '5px';
    isShowing.help = true;
}

function hideHelp() {
    id('helpBox').style.left=((parseInt(id('helpBox').style.width)+25)*-1)+'px';
    isShowing.help = false;
}

function showHistory() {
    if (isShowing.wordHistory) {
        hideHistory();
        return;
    }
    id('historyBox').style.right = '5px';
    isShowing.wordHistory = true;
}

function hideHistory() {
    id('historyBox').style.right='-195px';
    isShowing.wordHistory = false;
    cancelClearHistory();
}

function confirmClearHistory() {
    id('historyClearContainer').style.display = 'none';
    id('historyConfirmClearContainer').style.display = 'inline';
}

function cancelClearHistory() {
    id('historyClearContainer').style.display = 'inline';
    id('historyConfirmClearContainer').style.display = 'none';
}

window.onload = init;