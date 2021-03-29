'use strict';
// jshint -W003
/*global chrome*/

//this is used for the automated scripts
function getUrlParameter(sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split('&');
  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split('=');
    if (sParameterName[0] == sParam) {
      return sParameterName[1];
    }
  }
}
var isPopup;
isPopup = getUrlParameter('popup') === 'true';

if (!isPopup) {
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
      downloadReportPop(request.name, request.text);
    }
    if (request.type === 'downloadjson') {
      //console.log('Got Download');
      downloadJSONPop(request.name, request.text);
    }

    return true;
  }
  );
}
}


function downloadReportPop(filename, text) {
  var element = document.createElement('a');
  element.id='myDownloadContent';
  element.setAttribute('href', '' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  //element.click();

  //document.body.removeChild(element);
}


function downloadJSONPop(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
