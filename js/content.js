'use strict';
// jshint -W003
/*global chrome*/

var expanded = false;

function addConsoleTracker() {
  let tracker_script = `
  
  (function () {
    

		if (window.console && console.log) {
			var oldConsole = console.log;
			console.log = function () {
				var message = Array.prototype.slice.apply(arguments).join(' ');
				if (message.indexOf('A search was triggered, but no analytics') !== -1 || message.indexOf('warnAboutSearchEvent') !== -1) {
					$('body').append('<div id=myanalyticsfailure></div>');
					Array.prototype.unshift.call(arguments, 'MAYDAY: ');
				}
				oldConsole.apply(this, arguments);
			};
    }
    
  })();
  
let decodeRaw = function (raw) {
  let rawString = '';
  if (raw && raw.length) {
    try {
      let totalLen = 0;
      let aUint8 = raw.map(r => {
        let a = new Uint8Array(r.bytes);
        totalLen += a.length;
        return a;
      });

      let c = new (aUint8[0].constructor)(totalLen);
      let len = 0;
      aUint8.forEach(a => {
        c.set(a, len);
        len += a.length;
      });
      rawString = decodeURIComponent(String.fromCharCode.apply(null, c));
    }
    catch (e) {
      //console.error('decodeRaw Error: ', e);
    }
  }

  return (rawString || '');
};

  const constMock = navigator.sendBeacon;
  navigator.sendBeacon = function() {
    var url = arguments[0];
    //console.log(arguments);
    var reader = new FileReader();

    // This fires after the blob has been read
    reader.addEventListener('loadend', (e) => {
      //console.log(e.target.result);
      //console.log(decodeURIComponent(e.target.result));
      try {
      var text = decodeURIComponent(e.target.result);
      const regex = /^.*=/gm;
      text = text.replace(regex,'');
      //console.log(text);
      var obj = JSON.parse(text);
      window.postMessage({url:url, content:obj});
      } catch(e)
      {
        console.error('beacon Error: ', e);
      }
    });

    // Start reading the contents of blob
    //console.log(arguments[1]);
    try {
    reader.readAsText(arguments[1]);
    } catch(e)
    {}

    let returnvalue = constMock.apply(this,arguments);
    //console.log('Beacon response: '+returnvalue);
  }
  `;
  return tracker_script;
}

window.removeEventListener('message', reactOnBeacon);

function reactOnBeacon(event) {
  //console.log('from me');
  //console.log(JSON.stringify(event.data.content));
  if (event.data.content!=undefined) {
  chrome.runtime.sendMessage({
    action: "beacon",
    url: event.data.url,
    data: JSON.stringify(event.data.content)
  });
}
}

window.addEventListener("message", reactOnBeacon, false);

let lastid = 0;
//Fix all html elements, give them a unique id
function addIds() {

  document.querySelectorAll('*').forEach(function (node) {
    // Do whatever you want with the node object.
    if (node.id == undefined || node.id == '' || node.tagName != 'HTML') {
      //Add a new id
      let isUnique = false;
      let newid = node.nodeName;

      //Check if unique
      let result = document.querySelectorAll('#' + newid);

      if ((result.length === 1) && (result[0] === element)) {
        isUnique = true;
        node.id = newid;
      } else {
        node.id = 'CRT' + lastid;
        lastid = lastid + 1;
      }
    }
  });
}

//Add the above div always to track analytics problems
var script = document.createElement('script');
script.textContent = addConsoleTracker();
(document.head || document.documentElement).appendChild(script);

let SendMessage = (parameters) => {
  setTimeout(() => {
    try {
      chrome.runtime.sendMessage(parameters);
    }
    catch (e) { }
  });
};


if (chrome && chrome.runtime && chrome.runtime.onMessage) {
  //console.log('Adding Listener');
  chrome.runtime.onMessage.addListener(function (request, sender, response) {
    //if (chrome && chrome.runtime && chrome.runtime.onMessage) {
    //console.log("In runtime OnMessage");
    //console.log(request);
    //chrome.runtime.onMessage.addListener(
    //function (request/*, sender, sendResponse*/) {
    //console.log("In OnMessage");
    if (request.type === 'download') {
      //console.log('Got Download');
      downloadReport(request.name, request.text);
    }
    if (request.type === 'enabled') {
      //console.log('enabled');
      //setTimeout( function() {addIds();},300);
    }
    if (request.action === 'open') {
      //console.log('open');
      //addIds();
    }

    return true;
  }
  );
}

function downloadReport(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

chrome.runtime.sendMessage({
  action: "gotLoc",
  url: window.location.toString()
});

//get the UA version used
//Version?
var reg = /\/(.{1,5})\/coveoua\.js/gm;
let matches = document.documentElement.innerHTML.match(reg);
if (matches) {
  chrome.runtime.sendMessage({
    action: "setVersion",
    v: matches[0].match('\/(.*)\/')[0].replace('/', '').replace('/', '')

  });

}