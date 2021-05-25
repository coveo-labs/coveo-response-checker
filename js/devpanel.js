'use strict';

// jshint -W110, -W003
/*global chrome, createWheel*/

let myDownloadTitle = '';


//CopyToClipboard so we can copy/paste the part of the report
function copyToClipboard(text, id) {
  if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
    try {
      let listener = (e) => {
        e.clipboardData.setData("text/html",  text);
        e.clipboardData.setData("text/plain",text);
        e.preventDefault();
      };
      document.addEventListener("copy", listener);
      document.execCommand("copy");
      document.removeEventListener("copy", listener);
      return true;
    }
    catch (ex) {
      console.warn("Copy to clipboard failed.", ex);
    }
  }
  return false;
}

function getReportHTML(id) {
  let text = document.getElementById(id).outerHTML;
  let title = myDownloadTitle;//$('#xProjectname').val();
  let html = `<!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato">
  <link rel="stylesheet" href="http://coveo.github.io/vapor/dist/css/CoveoStyleGuide.css">
  <link rel="stylesheet" href="https://static.cloud.coveo.com/styleguide/v2.10.0/css/CoveoStyleGuide.css">
  <style type="text/css">
  body.coveo-styleguide {display:block; padding: 0 30px 30px;}
  div.wheel {display: inline-block; text-align: center; margin: 5px 10px; cursor: default; width: 130px;}
  div.wheel svg {cursor: default; width: 80px; height: 80px; transform: rotate(-90deg);}
  div.wheel .wheel-title {margin-top: 5px; font-size: 1.4em;}
  div.wheel svg .back-ring {stroke: #E4EAED; fill: none;}
  div.wheel svg text {font-weight: bold;}
  div.wheel.good svg text {fill: #00983;}
  div.wheel.warn svg text {fill: #ecad00;}
  div.wheel.bad svg text {fill: #ce3f00;}
  div.wheel.good svg circle.value {stroke: #009830;}
  div.wheel.warn svg circle.value {stroke: #ecad00;}
  div.wheel.bad svg circle.value {stroke: #ce3f00;}
  header.header {min-height: 48px;}
  .header-section {font-size: 1.2em; font-weight: bold;}
  a {outline: none;}
  a img {outline: none;}
  img {border: 0;}
  a:focus {outline: none;}
  
h4 {
  font-size: 17px;
  background-color: lightyellow;
  font-weight: bold;
}

.mytable {
  border: none;
  padding: 5px;
}

.myexpr {
  width: 200px;
}

.myexprval{
  width: 500px;
  font-weight: bold;
  font-size: 0.9em;
}

.myexprcomm{
  font-style: italic;
  padding-left: 15px !important;
}
  h3 {margin: 10px;}
  h3 i {font-style: italic;}
  .popup-content {padding-left: 8px; padding-right: 8px; padding-top: 0px; overflow: auto;}
  #myscreenimage {height: 200px; background-size: contain; background-repeat: no-repeat; background-position: top center; margin: 10px 20px; /*border: 1px solid silver;*/}
  #scores {text-align: center;}
  #scores div.wheel a svg {cursor: pointer;}

  .coveo-styleguide .collapsible .collapsible-header {background-position: left 20px center; display: flex; line-height: 50px;}
  .coveo-styleguide .collapsible .collapsible-header .msg {flex: 1;}
  .coveo-styleguide table:not(.datepicker-table) tr:hover td {background-color: transparent;}

  #details b {font-weight: bold;}
  #details i {font-style: italic;}
  .mycode {font-family: courier; font-variant: normal !important; font-weight: normal !important; word-wrap: break-word; white-space: pre-wrap; word-break: break-all;}
  .coveo-styleguide .collapsible .collapsible-header .details {color: #ce3f00; font-size: 8px;}
  .coveo-styleguide .collapsible .collapsible-header .result {color: #ce3f00; margin: auto;}
  .coveo-styleguide .collapsible .collapsible-header .result .wheel {position: relative; width: auto;}
  .coveo-styleguide .collapsible .collapsible-header .result .wheel svg {width: 40px; position: absolute; margin-top: -40px; margin-left: -10px;}
  .coveo-styleguide .collapsible .collapsible-header .result div.wheel svg .back-ring {stroke: #fff; fill: none;}
  .coveo-styleguide .collapsible .collapsible-header .result .wheel-title {display: none;}
  .coveo-styleguide .collapsible .collapsible-header.active {background-image: none;}
  .coveo-styleguide .collapsible .collapsible-body {padding: 0;}
  .coveo-styleguide table:not(.datepicker-table) td.line-result { text-align: left; font-weight: bold; vertical-align: top;}
  .coveo-styleguide table:not(.datepicker-table) th:last-child, .coveo-styleguide table:not(.datepicker-table) td:last-child {padding-left: 25px;}
  tr td.line-message small {vertical-align: top !important;font-size: small; color: #1d4f76; display: block; /*padding-left:25px;*/}
  tr td.line-mandatory {vertical-align: top !important; text-align: right; width: 48px !important;padding-right: 1px !important;padding-left: 1px !important;}
  tr td.line-indicator {  border-right: none;  vertical-align: top !important;  padding-right: 1px !important;padding-left: 1px !important;}
  tr td.line-message {vertical-align: top !important; text-align: right; width: 350px; padding-left: 1px !important;vertical-align: top !important;}
  tr td.line-result {background-position: left 5px top 12px; background-repeat: no-repeat; background-size: 12px; text-align: left; word-wrap: break-word; white-space: pre-wrap; word-break: break-all; width: 450px;}
  tr td.line-performance, tr th.line-performance {
  text-align: left !important;
  width: 350px;
  word-wrap: break-word;
  word-break: break-all;
  padding-left: 1px !important;
}


tr td.line-type, tr th.line-type {
  text-align: left !important;
  width: 150px;
  padding-left: 1px !important;
}

tr td.line-duration, tr th.line-duration {
  background-position: left 5px top 12px;
  text-align: right  !important;
  width: 45px;
  padding-left: 1px !important;
}

tr td.line-ttfb, tr th.line-ttfb {
  background-position: left 5px top 12px;
  text-align: right  !important;
  width: 45px;
  padding-left: 1px !important;
}

.progress {
  position: relative;
  height: 13px;
  background: rgb(255, 0, 0);
  background: -moz-linear-gradient(left, rgba(0, 255, 0, 1) 0%, rgba(255, 0, 0, 1) 100%);
  background: -webkit-gradient(linear, left top, right top, color-stop(0%, rgba(0, 255, 0, 1)), color-stop(100%, rgba(255, 0, 0, 1)));
  background: -webkit-linear-gradient(left, rgba(0, 255, 0, 1) 0%, rgba(255, 0, 0, 1) 100%);
  background: -o-linear-gradient(left, rgba(0, 255, 0, 1) 0%, rgba(255, 0, 0, 1) 100%);
  background: -ms-linear-gradient(left, rgba(0, 255, 0, 1) 0%, rgba(255, 0, 0, 1) 100%);
  background: linear-gradient(to right, rgba(0, 255, 0, 1) 0%, rgba(255, 0, 0, 1) 100%);
  filter: progid: DXImageTransform.Microsoft.gradient(startColorstr='#00ff00', endColorstr='#ff0000', GradientType=1);
}
.amount {
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  transition: all 0.8s;
  background: lightgray;
  /*width: 0;*/
}
.progress:before {
  content: attr(data-amount)" %";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  text-align: center;
  line-height: 13px;
  font-size: 0.8em;
}

  .mandatory {  color: #009830;}
  .mandatoryFAIL {  color: #ce3f00;}
  .download-global, .copy-section {display;none;}
  .valid-true td.line-result {color: #009830; background-image: url(../images/checkbox-checkmark.svg);}
  .valid-false td.line-result {color: #ce3f00; background-image: url(../images/action-close.svg);}
  .valid-true td.line-mandatory {  color: #009830;}
  .valid-false td.line-mandatory {  color: #ce3f00;}
  </style>
  <title>${title}</title>
  </head>
  <body class="coveo-styleguide">
  ${text}
  </body>
  </html>`;
  return html;
}

//Download the report
function downloadReport(id) {
  try {
    let html = getReportHTML(id);
    let filename = '';
    SendMessage({
      type: 'download',
      name: myDownloadTitle + '.html',
      text: html
    });
  }
  catch (err) {
    console.log('Oops, unable to copy to Clipboard', err);
  }
}


let processState = (data) => {
  console.log('Got state');
  /*$('#loading').hide();
  if (!data) {
    return;
  }
  if (data.json) {
    $('#push').removeAttr('disabled');
    //$('#showSFDC').removeAttr('disabled');

    processReport(data.json);
  }*/
  $('#setSearchTracker input').prop('checked', data.enabledSearch);
  //if we have actual data
  let showReport = data.queryRequests.length > 0 || data.querySuggestRequests.length > 0 || data.analyticRequests.length > 0 || data.ecommerceRequests.length > 0;
  if (showReport) {
    $('#globalReport').show();
    processData(data);
  }
  console.log(data);
  //console.log(data.enabledSearch);
  changeUI(data.enabledSearch, false);
  //console.log(data.tab);
  if (data.tab != 'OverviewA') fixTabs(data.tab);
};

let processData = (state) => {
  //Add warnings to headers
  let overviewValid = state.queryRequests.length > 0 && state.querySuggestRequests.length > 0 && state.analyticRequests.length > 0;
  document.getElementById('OverviewA').className = overviewValid ? "validInd" : "notvalidInd";
  document.getElementById('QRA').className = !state.searchInd ? "validInd" : "notvalidInd";
  document.getElementById('QSA').className = !state.qsInd ? "validInd" : "notvalidInd";
  document.getElementById('ARA').className = !state.analyticInd ? "validInd" : "notvalidInd";
  document.getElementById('ECA').className = !state.ecInd ? "validInd" : "notvalidInd";
  let overview = '';
  overview += `<table class="crs datepicker-table"><tr><th>Valid</th><th>Check</th><th colspan=2>Nr of Requests</th></tr>`;
  overview += `<tr><td class=${state.queryRequests.length > 0 ? "valid" : "notvalid"}></td><td>Queries</td><td class="numbers">${state.queryRequests.length}</td><td class="help"></td></tr>`;
  overview += `<tr><td class=${state.querySuggestRequests.length > 0 ? "valid" : "notvalid"}></td><td>Query Suggest</td><td  class="numbers">${state.querySuggestRequests.length}</td><td class="help"></td></tr>`;
  overview += `<tr><td class=${state.analyticRequests.length > 0 ? "valid" : "notvalid"}></td><td>Analytics</td><td  class="numbers">${state.analyticRequests.length}</td><td class="help"></td></tr>`;
  overview += `<tr><td class='${state.ecommerceRequests.length > 0 ? "valid" : "notvalid"} notmandatory'></td><td>E Commerce</td><td  class="numbers">${state.ecommerceRequests.length}</td><td class="help"></td></tr>`;
  overview += `</table>`;
  //console.log(overview);
  document.getElementById('overview').innerHTML = overview;

  let queries = '';
  queries += `<table class="crs datepicker-table"><tr><th>Valid</th><th>Check</th><th colspan=2>Content</th></tr>`;
  queries += state.searchReport;
  queries += `</table>`;
  document.getElementById('QR').innerHTML = queries;

  queries = '';
  queries += `<table class="crs datepicker-table"><tr><th>Valid</th><th>Check</th><th colspan=2>Content</th></tr>`;
  queries += state.qsReport;
  queries += `</table>`;
  document.getElementById('QS').innerHTML = queries;

  queries = '';
  queries += `<table class="crs datepicker-table"><tr><th>Valid</th><th>Check</th><th colspan=2>Content</th></tr>`;
  queries += state.analyticReport;
  queries += `</table>`;
  document.getElementById('AR').innerHTML = queries;

  queries = '';
  queries += `<table class="crs datepicker-table"><tr><th>Valid</th><th colspan=2>Content</th></tr>`;
  queries += state.ecReport;
  queries += `</table>`;
  document.getElementById('EC').innerHTML = queries;

  /*let nightwatch = '';
  document.getElementById('Nightwatch').innerHTML = '';
  var dt = new NightwatchRenderer();
  dt.items = state.record;
  document.getElementById('Nightwatch').innerHTML = dt.render(false);*/
  //document.getElementById('Nightwatch').innerHTML = nightwatch;
}


let getState = () => {
  console.log('sending getState');
  SendMessage('getState', processState);
};


function toggleTracker() {
  let enable = $('#setSearchTracker input').prop('checked') ? true : false;
  SendMessage({ type: 'enablesearch', enable });
}

function reset() {
  //reset all parameters
  /*$('#instructions').show();
  $('#myscreenimage').css('background-image', 'none').hide();
  $('#setSearchTracker input').prop('checked', false);
  $('#push').attr("disabled", true);
  //$('#showSFDC').attr("disabled", true);
  document.getElementById('scores').innerHTML = '';
  document.getElementById('details').innerHTML = '';

  SendMessage('reset', getState);
  window.close();*/
}

function SendMessage(typeOrMessage, callback) {
  if (typeof typeOrMessage === 'string') {
    typeOrMessage = { type: typeOrMessage };
  }

  if (callback) {
    chrome.runtime.sendMessage(typeOrMessage, null, callback);
  }
  else {
    //console.log("SEnding message");
    chrome.runtime.sendMessage(typeOrMessage);
  }
}


function changeUI(enable, message = true) {
  console.log('ChangeUI');
  if (enable) {
    $('#recording').show();
    $('#download-global').show();
    $('#instructions').hide();
    $('#loading').hide();
    if (message) {
      $('#startrecord').removeClass('mod-hidden');
      setTimeout(() => {
        $('#startrecord').addClass('mod-hidden');
      }, 2999);
    }

    document.getElementById('details').innerHTML = '';
  } else {
    $('#recording').hide();
  }

}
function toggleTracker() {
  let enable = $('#setSearchTracker input').prop('checked') ? true : false;
  changeUI(enable);

  SendMessage({ type: 'enablesearch', enable });
}

function fixTabs(current) {
  var tab_lists_anchors = document.querySelector("#tabbs").getElementsByTagName("a");
  var divs = document.querySelector("#tabbs").getElementsByClassName("tab-content");
  for (var i = 0; i < tab_lists_anchors.length; i++) {
    if (tab_lists_anchors[i].classList.contains('active')) {
      divs[i].style.display = "block";
    }

  }

  for (i = 0; i < tab_lists_anchors.length; i++) {


    for (i = 0; i < divs.length; i++) {
      divs[i].style.display = "none";
    }

    for (i = 0; i < tab_lists_anchors.length; i++) {
      tab_lists_anchors[i].classList.remove("active");
    }
  }
  var clicked_tab = document.getElementById(current);

  clicked_tab.classList.add('active');
  var div_to_show = clicked_tab.getAttribute('href');

  document.querySelector(div_to_show).style.display = "block";
  SendMessage({ type: 'tabset', tab: current });


}
function clearTabs() {
  document.getElementById('ALL').innerHTML = '';

  backgroundPageConnection.postMessage({
    name: 'cleardev'
  });

}


function toggleScenario() {
  let enable = $('#setScenario input').prop('checked') ? true : false;
  if (enable) {
    document.getElementById('ALL').innerHTML = '';

  } else {
    document.getElementById('ALL').innerHTML = '';
  }
  
backgroundPageConnection.postMessage({
  name: 'getnew'
});


}

document.addEventListener('DOMContentLoaded', function () {
  // Handle clicks on slide-toggle buttons
  var manifestData = chrome.runtime.getManifest();
  $('#myTitle').text("Coveo Request Checker " + manifestData.version);
  /*  document.querySelectorAll("#tabs").forEach(function(a){
      a.addEventListener("click", function(e){
        fixTabs(e.target.id);return false;
        })
        });*/
  document.getElementById('clear').onclick = function () { clearTabs(); return true; };
  $('#setScenario input').prop('checked', false);
  $('#setScenario').on('change', toggleScenario);
  
  //getState();
});

function addCss() {
  return `<head><meta charset="UTF-8">
  <style type="text/css">
  body.coveo-styleguide {display:block; padding: 0 30px 30px;}
  header.header {min-height: 48px;}
  .header-section {font-size: 1.2em; font-weight: bold;}
  a {outline: none;}
  a img {outline: none;}
  img {border: 0;}
  a:focus {outline: none;}
  .bg-polygon {
    background-color: rgb(51, 51, 87) !important;
      background-image: none;
  }
  .admin-logo {
    width: 139px !important;
    padding-left: 15px !important;
    margin-top: 5px;
  }
  
  hr {
    clear: both;
}
h1 {
  font-weight: bold;
}
h2, .h2 {
  font-size: 20px;
  font-weight: bold;
}
  .popup-content {padding-left: 8px; padding-right: 8px; padding-top: 0px; overflow: auto;}

  .coveo-styleguide .collapsible .collapsible-header {background-position: left 20px center; display: flex; line-height: 50px;}
  .coveo-styleguide .collapsible .collapsible-header .msg {flex: 1;}
  .coveo-styleguide table:not(.datepicker-table) tr:hover td {background-color: transparent;}

  .mycode {margin-top: 10px;font-family: courier; font-variant: normal !important; font-weight: normal !important; word-wrap: break-word; white-space: pre-wrap; word-break: break-all;}
  .coveo-styleguide .collapsible .collapsible-header .details {color: #ce3f00; font-size: 8px;}
  .coveo-styleguide .collapsible .collapsible-header .result {color: #ce3f00; margin: auto;}
  .coveo-styleguide .collapsible .collapsible-header .result .wheel {position: relative; width: auto;}
  .coveo-styleguide .collapsible .collapsible-header .result .wheel svg {width: 40px; position: absolute; margin-top: -40px; margin-left: -10px;}
  .coveo-styleguide .collapsible .collapsible-header .result div.wheel svg .back-ring {stroke: #fff; fill: none;}
  .coveo-styleguide .collapsible .collapsible-header .result .wheel-title {display: none;}
  .coveo-styleguide .collapsible .collapsible-header.active {background-image: none;}
  .coveo-styleguide .collapsible .collapsible-body {padding: 0;}
  .coveo-styleguide table:not(.datepicker-table) td.line-result { text-align: left; font-weight: bold; vertical-align: top;}
  .coveo-styleguide table:not(.datepicker-table) th:last-child, .coveo-styleguide table:not(.datepicker-table) td:last-child {padding-left: 25px;}
  
.mycode {
  font-family: courier;
  font-variant: normal !important;
  font-weight: normal !important;
  font-size: 14px;
  word-wrap: break-word;
  white-space: pre-wrap;
  word-break: break-all;
}
.valid { width:30px !important;background-position: center;background-size:25px;background-repeat:no-repeat;background-image:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM0MUFENDk7fQo8L3N0eWxlPjxnPjxwb2x5Z29uIGNsYXNzPSJzdDAiIHBvaW50cz0iNDM0LjgsNDkgMTc0LjIsMzA5LjcgNzYuOCwyMTIuMyAwLDI4OS4yIDE3NC4xLDQ2My4zIDE5Ni42LDQ0MC45IDE5Ni42LDQ0MC45IDUxMS43LDEyNS44IDQzNC44LDQ5ICAgICAiLz48L2c+PC9zdmc+)}
.notvalid { width:30px !important;background-position: center;background-size:25px;background-repeat:no-repeat;background-image:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDYxMiA3OTI7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA2MTIgNzkyIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNFNDQwNjE7fQo8L3N0eWxlPjxnPjxwb2x5Z29uIGNsYXNzPSJzdDAiIHBvaW50cz0iMzgyLjIsMzk2LjQgNTYwLjgsMjE3LjggNDg0LDE0MSAzMDUuNCwzMTkuNiAxMjYuOCwxNDEgNTAsMjE3LjggMjI4LjYsMzk2LjQgNTAsNTc1IDEyNi44LDY1MS44ICAgIDMwNS40LDQ3My4yIDQ4NCw2NTEuOCA1NjAuOCw1NzUgMzgyLjIsMzk2LjQgICIvPjwvZz48L3N2Zz4=)}
.validInd { background-position: left;padding-left:17px !important;background-size:15px;background-repeat:no-repeat;background-image:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM0MUFENDk7fQo8L3N0eWxlPjxnPjxwb2x5Z29uIGNsYXNzPSJzdDAiIHBvaW50cz0iNDM0LjgsNDkgMTc0LjIsMzA5LjcgNzYuOCwyMTIuMyAwLDI4OS4yIDE3NC4xLDQ2My4zIDE5Ni42LDQ0MC45IDE5Ni42LDQ0MC45IDUxMS43LDEyNS44IDQzNC44LDQ5ICAgICAiLz48L2c+PC9zdmc+)}
.notvalidInd { background-position: left;padding-left:17px !important;background-size:15px;background-repeat:no-repeat;background-image:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDYxMiA3OTI7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA2MTIgNzkyIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNFNDQwNjE7fQo8L3N0eWxlPjxnPjxwb2x5Z29uIGNsYXNzPSJzdDAiIHBvaW50cz0iMzgyLjIsMzk2LjQgNTYwLjgsMjE3LjggNDg0LDE0MSAzMDUuNCwzMTkuNiAxMjYuOCwxNDEgNTAsMjE3LjggMjI4LjYsMzk2LjQgNTAsNTc1IDEyNi44LDY1MS44ICAgIDMwNS40LDQ3My4yIDQ4NCw2NTEuOCA1NjAuOCw1NzUgMzgyLjIsMzk2LjQgICIvPjwvZz48L3N2Zz4=)}
.validIndB { background-position: left;padding-left:30px !important;background-size:25px;background-repeat:no-repeat;background-image:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM0MUFENDk7fQo8L3N0eWxlPjxnPjxwb2x5Z29uIGNsYXNzPSJzdDAiIHBvaW50cz0iNDM0LjgsNDkgMTc0LjIsMzA5LjcgNzYuOCwyMTIuMyAwLDI4OS4yIDE3NC4xLDQ2My4zIDE5Ni42LDQ0MC45IDE5Ni42LDQ0MC45IDUxMS43LDEyNS44IDQzNC44LDQ5ICAgICAiLz48L2c+PC9zdmc+)}
.notvalidIndB { background-position: left;padding-left:30px !important;background-size:25px;background-repeat:no-repeat;background-image:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDYxMiA3OTI7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA2MTIgNzkyIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNFNDQwNjE7fQo8L3N0eWxlPjxnPjxwb2x5Z29uIGNsYXNzPSJzdDAiIHBvaW50cz0iMzgyLjIsMzk2LjQgNTYwLjgsMjE3LjggNDg0LDE0MSAzMDUuNCwzMTkuNiAxMjYuOCwxNDEgNTAsMjE3LjggMjI4LjYsMzk2LjQgNTAsNTc1IDEyNi44LDY1MS44ICAgIDMwNS40LDQ3My4yIDQ4NCw2NTEuOCA1NjAuOCw1NzUgMzgyLjIsMzk2LjQgICIvPjwvZz48L3N2Zz4=)}
li.notvalidInd.notmandatory {
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iNTEycHgiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB3aWR0aD0iNTEycHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnIGlkPSJyb2FkX194MkNfX3NpZ25fX3gyQ19fYWxlcnRfX3gyQ19fZGFuZ2VyX194MkNfIj48Zz48bGluZWFyR3JhZGllbnQgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGlkPSJTVkdJRF8xXyIgeDE9IjE2IiB4Mj0iNDk2IiB5MT0iMjU2IiB5Mj0iMjU2Ij48c3RvcCBvZmZzZXQ9IjAiIHN0eWxlPSJzdG9wLWNvbG9yOiNENTk2MzIiLz48c3RvcCBvZmZzZXQ9IjAuMDA2OCIgc3R5bGU9InN0b3AtY29sb3I6I0Q3OUIzMiIvPjxzdG9wIG9mZnNldD0iMC4wNDU2IiBzdHlsZT0ic3RvcC1jb2xvcjojREZCNDM0Ii8+PHN0b3Agb2Zmc2V0PSIwLjA4OTMiIHN0eWxlPSJzdG9wLWNvbG9yOiNFNkM3MzUiLz48c3RvcCBvZmZzZXQ9IjAuMTM5NyIgc3R5bGU9InN0b3AtY29sb3I6I0VBRDUzNSIvPjxzdG9wIG9mZnNldD0iMC4yMDMyIiBzdHlsZT0ic3RvcC1jb2xvcjojRURERDM2Ii8+PHN0b3Agb2Zmc2V0PSIwLjMyMTQiIHN0eWxlPSJzdG9wLWNvbG9yOiNFRURGMzYiLz48c3RvcCBvZmZzZXQ9IjAuODA2MSIgc3R5bGU9InN0b3AtY29sb3I6I0VFREYzNiIvPjxzdG9wIG9mZnNldD0iMC44NzkiIHN0eWxlPSJzdG9wLWNvbG9yOiNFREREMzYiLz48c3RvcCBvZmZzZXQ9IjAuOTE3IiBzdHlsZT0ic3RvcC1jb2xvcjojRUJENTM1Ii8+PHN0b3Agb2Zmc2V0PSIwLjk0NjkiIHN0eWxlPSJzdG9wLWNvbG9yOiNFNkM3MzUiLz48c3RvcCBvZmZzZXQ9IjAuOTcyNiIgc3R5bGU9InN0b3AtY29sb3I6I0RGQjQzNCIvPjxzdG9wIG9mZnNldD0iMC45OTU0IiBzdHlsZT0ic3RvcC1jb2xvcjojRDc5QzMyIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojRDU5NjMyIi8+PC9saW5lYXJHcmFkaWVudD48cGF0aCBkPSJNMTk5Ljk2OCw3Mi45MDVMMjQuODcyLDM3My45NyAgICBjLTI1LjExMSw0My4xODgsNi4wNzMsOTcuMzUsNTUuOTk3LDk3LjM1aDM1MC4yNjRjNDkuOTIzLDAsODEuMTAzLTU0LjE2MSw1NS45OTctOTcuMzVMMzEyLjA0Miw3Mi45MDUgICAgQzI4Ny4wMDIsMjkuOTM5LDIyNSwyOS45MzksMTk5Ljk2OCw3Mi45MDVMMTk5Ljk2OCw3Mi45MDV6IiBzdHlsZT0iZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7ZmlsbDp1cmwoI1NWR0lEXzFfKTsiLz48cmFkaWFsR3JhZGllbnQgY3g9IjI1Ni4wMDc4IiBjeT0iMjI1Ljk0NDMiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoNi44MTM4IDAgMCA2LjgxMzggLTE0ODguMzgwMSAtMTI4My42MDY3KSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGlkPSJTVkdJRF8yXyIgcj0iMjguNzM1NiI+PHN0b3Agb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojMDAwMDAwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojM0Q0MTQ4Ii8+PC9yYWRpYWxHcmFkaWVudD48cGF0aCBkPSJNNDI4LjA2Miw0MzkuMjZIODMuOTQ0ICAgIGMtMTIuODEzLDAtMjQuMzAzLTYuNjU4LTMwLjY3LTE3Ljc4N2MtNi40NDEtMTEuMTIxLTYuMzY3LTI0LjM3MywwLjA3NC0zNS41MDNMMjI1LjM3LDkwLjE4NCAgICBjNi40MzgtMTAuOTgxLDE3Ljg1My0xNy41NzUsMzAuNTk2LTE3LjU3NWMxMi44MTMsMCwyNC4yMjksNi41OTQsMzAuNjc1LDE3LjU3NUw0NTguNjU3LDM4NS45NyAgICBjNi40NDcsMTEuMTMsNi41MTMsMjQuMzgyLDAuMDc1LDM1LjUwM0M0NTIuMzYsNDMyLjYwMiw0NDAuODcsNDM5LjI2LDQyOC4wNjIsNDM5LjI2TDQyOC4wNjIsNDM5LjI2eiBNMjU1Ljk2Niw4OC4xMzQgICAgYy03LjE3OSwwLTEzLjYxNCwzLjY1My0xNy4yMDMsOS44NzdMNjYuNzM5LDM5My44MDZjLTMuNjU4LDYuMjIzLTMuNjU4LDEzLjY5MS0wLjA2OCwxOS45MTEgICAgYzMuNjU5LDYuMjk5LDEwLjA5OSwxMC4wMjYsMTcuMjczLDEwLjAyNmgzNDQuMTE4YzcuMTcsMCwxMy42MTQtMy43MjgsMTcuMjcxLTEwLjAyNmMzLjU4OC02LjIyLDMuNTE0LTEzLjY4OC0wLjA3NS0xOS45MTEgICAgTDI3My4yMzksOTguMDExQzI2OS42NjEsOTEuNzg3LDI2My4yMTEsODguMTM0LDI1NS45NjYsODguMTM0TDI1NS45NjYsODguMTM0eiIgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO2ZpbGw6dXJsKCNTVkdJRF8yXyk7Ii8+PHJhZGlhbEdyYWRpZW50IGN4PSIyNTYuMDA3OCIgY3k9IjIyOS40NTgiIGdyYWRpZW50VHJhbnNmb3JtPSJtYXRyaXgoNi44MTM4IDAgMCA2LjgxMzggLTE0ODguMzgwMSAtMTI4My42MDY3KSIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIGlkPSJTVkdJRF8zXyIgcj0iMTEuMTE2MSI+PHN0b3Agb2Zmc2V0PSIwIiBzdHlsZT0ic3RvcC1jb2xvcjojMDAwMDAwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdHlsZT0ic3RvcC1jb2xvcjojM0Q0MTQ4Ii8+PC9yYWRpYWxHcmFkaWVudD48cGF0aCBkPSJNMjM2LjM1MSwzMDYuNzA0VjE3NC41NzloMzkuMzA4djEzMi4xMjVIMjM2LjM1MSAgICBMMjM2LjM1MSwzMDYuNzA0eiBNMjM2LjM1MSwzODUuMTczdi00NC4zNTloMzkuMzA4djQ0LjM1OUgyMzYuMzUxeiIgc3R5bGU9ImZpbGwtcnVsZTpldmVub2RkO2NsaXAtcnVsZTpldmVub2RkO2ZpbGw6dXJsKCNTVkdJRF8zXyk7Ii8+PC9nPjwvZz48ZyBpZD0iTGF5ZXJfMSIvPjwvc3ZnPg==);
}
td.notvalid.notmandatory {
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgZGF0YS1uYW1lPSJMYXllciAxIiBpZD0iTGF5ZXJfMSIgdmlld0JveD0iMCAwIDY0IDY0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxzdHlsZT4uY2xzLTF7ZmlsbDojZWZjYzAwO30uY2xzLTJ7ZmlsbDojMzUzNTM1O308L3N0eWxlPjwvZGVmcz48dGl0bGUvPjxwYXRoIGNsYXNzPSJjbHMtMSIgZD0iTTMwLjE2LDExLjUxLDYuODQsNTEuOWEyLjEzLDIuMTMsMCwwLDAsMS44NCwzLjE5SDU1LjMyYTIuMTMsMi4xMywwLDAsMCwxLjg0LTMuMTlMMzMuODQsMTEuNTFBMi4xMywyLjEzLDAsMCwwLDMwLjE2LDExLjUxWiIvPjxwYXRoIGNsYXNzPSJjbHMtMiIgZD0iTTI5LDQ2YTMsMywwLDEsMSwzLDNBMi44OCwyLjg4LDAsMCwxLDI5LDQ2Wm0xLjA5LTQuNjYtLjc2LTE1aDUuMjZsLS43MywxNVoiLz48L3N2Zz4=);
}

.help {  cursor:pointer;width:30px !important;background-position: center;background-size:25px;background-repeat:no-repeat;background-image:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIGZpbGw9Im5vbmUiIHI9IjI0IiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCBmaWxsPSJub25lIiBoZWlnaHQ9IjUwIiB3aWR0aD0iNTAiLz48Zz48cGF0aCBkPSJNMjMuNTMzLDMwLjQwN3YtMS40N2MwLTEuNDM2LDAuMzIyLTIuMTg4LDEuMDc1LTMuMjI5bDIuNDA0LTMuM2MxLjI1NC0xLjcyMSwxLjY4NC0yLjU0NiwxLjY4NC0zLjc2NiAgIGMwLTIuMDQ0LTEuNDM0LTMuMzM1LTMuNDc5LTMuMzM1Yy0yLjAwOCwwLTMuMjk5LDEuMjE5LTMuNzI5LDMuNDA3Yy0wLjAzNiwwLjIxNS0wLjE3OSwwLjMyMy0wLjM5NSwwLjI4N2wtMi4yNTktMC4zOTUgICBjLTAuMjE2LTAuMDM2LTAuMzIzLTAuMTc5LTAuMjg4LTAuMzk1YzAuNTM5LTMuNDQzLDMuMDE0LTUuNzAzLDYuNzQ0LTUuNzAzYzMuODcyLDAsNi40OSwyLjU0Niw2LjQ5LDYuMDk3ICAgYzAsMS43MjItMC42MDgsMi45NzctMS44MjgsNC42NjNsLTIuNDAzLDMuM2MtMC43MTcsMC45NjgtMC45MzMsMS40Ny0wLjkzMywyLjY4OXYxLjE0N2MwLDAuMjE1LTAuMTQzLDAuMzU4LTAuMzU4LDAuMzU4aC0yLjM2NyAgIEMyMy42NzYsMzAuNzY2LDIzLjUzMywzMC42MjIsMjMuNTMzLDMwLjQwN3ogTTIzLjM1NCwzMy44NTFjMC0wLjIxNSwwLjE0My0wLjM1OCwwLjM1OS0wLjM1OGgyLjcyNiAgIGMwLjIxNSwwLDAuMzU4LDAuMTQ0LDAuMzU4LDAuMzU4djMuMDg0YzAsMC4yMTYtMC4xNDQsMC4zNTgtMC4zNTgsMC4zNThoLTIuNzI2Yy0wLjIxNywwLTAuMzU5LTAuMTQzLTAuMzU5LTAuMzU4VjMzLjg1MXoiLz48L2c+PC9zdmc+)}
.notmandatory { opacity:0.7}  
.crs th {color: #1e2541;font-weight: bold;} 
.crs {border:none;margin-top: 5px;width: auto;float:left;padding:10px;border-spacing: 0px;} 
.crs  th {	text-align: left;		padding:7px;font-family:Arial !important;	font-size:11pt !important;	background:#F0F0F0;	}	
.crs td { white-space: nowrap;max-width: 500px;min-width: 30px;vertical-align: top;font-family:Arial !important;	font-size:11pt !important;		border-bottom:1px solid #C0C0C0;		padding:5px;}	
.numbers { text-align:right}
td.nobord {border:none !important;}
.propvalue,.propex,.sc {
  display: block;
    font-weight: normal;
    font-family: courier;
    padding-top: 5px;
    word-break: break-all;
}
.propex {
  word-break: break-word;
}

.proptitle {
  background-color: #e8e9ec5c;
    border-radius: 4px;
    padding: 2px;
    padding-left: 4px;
    padding-right: 4px;
    font-size: 0.9em;
    box-shadow: 1px 1px 1px 0px rgb(56 169 240 / 50%);
}
.propvalue{
  font-weight:bold;
  padding-top: 8px;
}
.propex {
  font-style: normal;
  font-size: 0.8em;
  opacity:0.6;
}
.notmandatory .propex {
  opacity: 1.0;
}
.url a {
  cursor: pointer;
  font-weight:normal;
}

span.spacing {
  font-size: 1.5em;
  display: block;
  padding: 5px;
  clear: both;
}
span.persistent {
  background-color: #fea1a1;
  font-family: courier;
  word-break: break-all;
  clear: both;
    display: block;
  /* width: 200px; */
}

span.type {
  font-size: 1.6em;
  display: block;
  padding: 5px;
  /* margin-top: 42px; */
  border-top: 1px solid #bcc3ca;
  clear: both;
  font-weight: bold;
}

span.time {
  font-size: 1.3em;
  display: block;
  padding: 5px;
  margin-left: 23px;
}
span.url{
  padding-bottom: 10px;
    display: block;
    margin-left: 30px;
    background-size: 15px;
    font-size: 1.1em;
    font-weight: bold;
    
}
.code {
  margin-left: 30px;
  font-weight: normal;
  padding-bottom: 10px !important;
    display: block;
    cursor: pointer;
    clear:both;
}

.popup-content {
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 0px;
  overflow: auto;
}
.copy-section {
  display: none;
}
ul {
  font-size:1.1em;
  font-weight: bold;
  margin-left: 25px;
  margin-top: 10px;
}
li {
  font-size: 0.9em;
  font-weight: normal;
  /* display: block; */
  padding-right: 15px;
  padding-bottom: 10px;

}
ul.item {
  font-size: 1em;
    font-weight: normal;
    margin-left: 0px;
    margin-top: 0px;
}
details.code:focus {
  outline: none !important;
}
summary:focus {
  outline: none;
}

ul.tabs{
  list-style-type:none;
  bottom: -1px;
  position:relative;
}
.tabs li{
  float:left;
}</style> </head>`;
}

function SelectText(element) {
  var doc = document;
  if (doc.body.createTextRange) {
      var range = document.body.createTextRange();
      range.moveToElementText(element);
      range.select();
  } else if (window.getSelection) {
      var selection = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
  }
}

function addCopy(){
  $('.copy-section').click((e) => {
    e.preventDefault();
    let target = $(e.currentTarget)[0], parent = $(target).closest('ul')[0];
    let html = '<html><body><table>';
    html+='<tr><td>Action/type:</td><td>'+$('#'+parent.id+' .type').text()+'</td></tr>';
    html+='<tr><td>Url:</td><td>'+$('#'+parent.id+' .url').html().replace("<span","<br><span")+'</td></tr>';
    html+='<tr><td colspan=2>Parameter validation:</td></tr>';
    let cont = $('#'+parent.id+' ul').html();
    cont = cont.replace(/<li/g,'<tr><td colspan=2><li');
    cont = cont.replace(/\/li>/g,'/li></td></tr>');
    html+=cont;
    html+='</table></body></html>';
    html = html.replace(/<\/span>/g,'<br></span>');
    copyToClipboard(html, parent.id);
    $('#clipboard-copied').removeClass('mod-hidden');
    setTimeout(() => {
      $('#clipboard-copied').addClass('mod-hidden');
    }, 999);
    return true;
  });
}

var backgroundPageConnection = chrome.runtime.connect({
  name: "CoveoRequestCheckerPage"
});

backgroundPageConnection.postMessage({
  name: 'init',
  tabId: chrome.devtools.inspectedWindow.tabId
});


function processRequest(request) {
  let html = '';
  html += `<tr><td>${request.url}</td>`;

  //We now all postedStrings
  html += `<td style="max-width:inherit"><pre class='mycode'>${JSON.stringify(request.data, null, 2)}</pre></td></tr>`;
  return html;
}

function show(id) {
  if (document.getElementById(id).style.display == 'block') {
    document.getElementById(id).style.display = 'none';

  } else {
    document.getElementById(id).style.display = 'block';

  }
}
backgroundPageConnection.onMessage.addListener(function (message) {
  // Handle responses from the background page, if any
  //Insert the check
  //console.log(message);
  //Check if we are getting everything or a single response
  let enableSc = $('#setScenario input').prop('checked') ? true : false;
  if (message.one) {
    //We have a single record which we only need to update the statuscode
    let status = message.one.statusCode ? "statusCode: " + message.one.statusCode + "" : "(no statusCode received)";
    let statusok = 'notvalidInd';
    if (message.one.statusCode) {
      statusok = message.one.statusCode == 200 ? "validInd" : "notvalidInd";
    }
    let newclass = `${!message.one.data.oneisbad && message.one.statusCode ? "validIndB" : "notvalidIndB"}`;
    let title = message.one.data.title ? " - " + message.one.data.title : '';
    let reqid = message.one.req+(message.one.data.title ? "" + message.one.data.title : '');
    let id = '#'+reqid+'';
    let idstatus = '#'+reqid+'stat';
    let idstatustext = '#'+reqid+'txt';
    $(id).removeClass('validIndB');
    $(id).removeClass('notvalidIndB');
    $(id).addClass(newclass);
    $(idstatus).removeClass('validInd');
    $(idstatus).removeClass('notvalidInd');
    $(idstatus).addClass(statusok);
    $(idstatustext).text(status);
  }
  else if (message.all) {
    document.getElementById('ALL').innerHTML = '';
    for (var i = 0; i < message.all.length; i++) {
      let empty = "";
      let id = document.getElementById('ALL').innerHTML.length;
      let idc = id + 'c';
      let idl = id + 'l';
      let title = message.all[i].data.title ? " - " + message.all[i].data.title : '';
      let reqid = message.all[i].req+(message.all[i].data.title ? ("" + message.all[i].data.title) : '');
      let status = message.all[i].statusCode ? `statusCode: ` + message.all[i].statusCode + "" : "(no statusCode received)";
      let statusok = 'notvalidInd';
      if (message.all[i].statusCode) {
        statusok = message.all[i].statusCode == 200 ? "validInd" : "notvalidInd";
      }
      let line = `<ul class="item" id=${idl}><span class='spacing'></span><span id=${reqid} class='type ${!message.all[i].data.oneisbad && message.all[i].statusCode ? "validIndB" : "notvalidIndB"}'>${message.all[i].request.type}${title}</span><div class="copy-section" style=""></div><span class="time">${message.all[i].time}</span>`;
      //line += `<span class=code style='cursor:pointer'" id=${id}>Data sent(click to show):<pre class='mycode' id=${idc}>${JSON.stringify(message.request.data,null,2)}</pre></span>`;
      line += `<span id=${reqid}stat class='url ${statusok}'><a href='${encodeURI(message.all[i].request.url)}' target='_blank'>${message.all[i].request.url}</a><span class='sc' id=${reqid}txt>${status}</span></span>`;
      line += `<details class=code>  <summary>Parameter validation</summary><ul>${message.all[i].data.content}</ul></details>` + empty;
      line += `<details class=code>  <summary>Post/Form Data</summary>  <pre class='mycode' id=${idc}>${JSON.stringify(message.all[i].request.data, null, 2)}</pre></details></ul>`;
      //document.getElementById('ALL').innerHTML=line+document.getElementById('ALL').innerHTML;
      if (message.all[i].sc==true && enableSc) {
        document.getElementById('ALL').insertAdjacentHTML('beforeend', line);
      }
      if (enableSc==false) {
        document.getElementById('ALL').insertAdjacentHTML('beforeend', line);
      }
    }
    addCopy();

  } else {
    let empty = "";
    let id = document.getElementById('ALL').innerHTML.length;
    let idc = id + 'c';
    let idl = id + 'l';
    let title = message.data.title ? " - " + message.data.title : '';
    let reqid = message.req+(message.data.title ? ("" + message.data.title) : '');
    let status = message.statusCode ? `<span class='sc' id=${message.req}txt>statusCode: ` + message.statusCode + "</span>" : `<span class='sc' id=${message.req}txt>(no statusCode received)</span>`;
    let statusok = 'notvalidInd';
    if (message.statusCode) {
      statusok = message.statusCode == 200 ? "validInd" : "notvalidInd";
    }
    let line = `<ul class="item" id=${idl}><span class='spacing'></span><span id=${reqid} class='type ${!message.data.oneisbad && message.statusCode == 200 ? "validIndB" : "notvalidIndB"}'>${message.request.type}${title}</span><div class="copy-section" style=""></div><span class="time">${message.time}</span>`;
    //line += `<span class=code style='cursor:pointer'" id=${id}>Data sent(click to show):<pre class='mycode' id=${idc}>${JSON.stringify(message.request.data,null,2)}</pre></span>`;
    line += `<span id=${reqid}stat class='url ${statusok}'><a href='${encodeURI(message.request.url)}' target='_blank'>${message.request.url}</a><span class='sc' id=${reqid}txt>${status}</span></span>`;
    line += `<details class=code>  <summary>Parameter validation</summary><ul>${message.data.content}</ul></details>` + empty;
    line += `<details class=code>  <summary>Post/Form Data</summary>  <pre class='mycode' id=${idc}>${JSON.stringify(message.request.data, null, 2)}</pre></details></ul>`;
    //document.getElementById('ALL').innerHTML=line+document.getElementById('ALL').innerHTML;
    if (message.sc==true && enableSc) {
      document.getElementById('ALL').insertAdjacentHTML('afterbegin', line);
    }
    if (enableSc==false) {
      document.getElementById('ALL').insertAdjacentHTML('afterbegin', line);
    }
  //document.getElementById('ALL').insertAdjacentHTML('afterbegin', line);
    addCopy();
  }

  /*  document.getElementById(id).addEventListener("click", function(e){
        show(idc);return false;
      })
    */

  /*.onclick = function() { 
    show(idc);return true;
  };*/
  //document.getElementById(message.type+'T').innerHTML+=message.data;
});
