'use strict';

// jshint -W110, -W003
/*global chrome, createWheel*/

let CLIPBOARD_DATA_HTML = {}, CLIPBOARD_DATA_PLAIN = {}, CLIPBOARD_VALID_FIELDS = {};
let myDownloadTitle = '';


//CopyToClipboard so we can copy/paste the part of the report
function copyToClipboard(text, id) {
  if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
    try {
      let listener = (e) => {
        e.clipboardData.setData("text/html", CLIPBOARD_DATA_HTML[id] || text);
        e.clipboardData.setData("text/plain", CLIPBOARD_DATA_PLAIN[id] || text);
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

  let nightwatch = '';
  document.getElementById('Nightwatch').innerHTML = '';
  var dt = new NightwatchRenderer();
  dt.items = state.record;
  document.getElementById('Nightwatch').innerHTML = dt.render(false);
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
  $('#myTitle').text("Coveo Response Checker " + manifestData.version);
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

var backgroundPageConnection = chrome.runtime.connect({
  name: "CoveoResponseCheckerPage"
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
    let status = message.one.statusCode ? "statusCode: " + message.one.statusCode + "" : "";
    let statusok = '';
    if (message.one.statusCode) {
      statusok = message.one.statusCode == 200 ? "validInd" : "notvalidInd";
    }
    let newclass = `${!message.one.data.flag && message.one.statusCode ? "validIndB" : "notvalidIndB"}`;
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
      let title = message.all[i].data.title ? " - " + message.all[i].data.title : '';
      let reqid = message.all[i].req+(message.all[i].data.title ? "" + message.all[i].data.title : '');
      let status = message.all[i].statusCode ? `statusCode: ` + message.all[i].statusCode + "" : "";
      let statusok = '';
      if (message.all[i].statusCode) {
        statusok = message.all[i].statusCode == 200 ? "validInd" : "notvalidInd";
      }
      let line = `<span class='spacing'></span><span id=${reqid} class='type ${!message.all[i].data.flag && message.all[i].statusCode ? "validIndB" : "notvalidIndB"}'>${message.all[i].request.type}${title}</span><span class="time">${message.all[i].time}</span>`;
      //line += `<span class=code style='cursor:pointer'" id=${id}>Data sent(click to show):<pre class='mycode' id=${idc}>${JSON.stringify(message.request.data,null,2)}</pre></span>`;
      line += `<span id=${reqid}stat class='url ${statusok}'><a href='${encodeURI(message.all[i].request.url)}' target='_blank'>${message.all[i].request.url}</a><span class='sc' id=${reqid}txt>${status}</span></span>`;
      line += `<ul>${message.all[i].data.content}</ul>` + empty;
      line += `<details class=code>  <summary>Post/Form Data</summary>  <pre class='mycode' id=${idc}>${JSON.stringify(message.all[i].request.data, null, 2)}</pre></details>`;
      //document.getElementById('ALL').innerHTML=line+document.getElementById('ALL').innerHTML;
      if (message.all[i].sc==true && enableSc) {
        document.getElementById('ALL').insertAdjacentHTML('beforeend', line);
      }
      if (enableSc==false) {
        document.getElementById('ALL').insertAdjacentHTML('beforeend', line);
      }
    }

  } else {
    let empty = "";
    let id = document.getElementById('ALL').innerHTML.length;
    let idc = id + 'c';
    let title = message.data.title ? " - " + message.data.title : '';
    let reqid = message.req+(message.data.title ? "" + message.data.title : '');
    let status = message.statusCode ? `<span class='sc' id=${message.req}txt>statusCode: ` + message.statusCode + "</span>" : "";
    let statusok = '';
    if (message.statusCode) {
      statusok = message.statusCode == 200 ? "validInd" : "notvalidInd";
    }
    let line = `<span class='spacing'></span><span id=${reqid} class='type ${!message.data.flag && message.statusCode == 200 ? "validIndB" : "notvalidIndB"}'>${message.request.type}${title}</span><span class="time">${message.time}</span>`;
    //line += `<span class=code style='cursor:pointer'" id=${id}>Data sent(click to show):<pre class='mycode' id=${idc}>${JSON.stringify(message.request.data,null,2)}</pre></span>`;
    line += `<span id=${reqid}stat class='url ${statusok}'><a href='${encodeURI(message.request.url)}' target='_blank'>${message.request.url}</a><span class='sc' id=${reqid}txt>${status}</span></span>`;
    line += `<ul>${message.data.content}</ul>` + empty;
    line += `<details class=code>  <summary>Post/Form Data</summary>  <pre class='mycode' id=${idc}>${JSON.stringify(message.request.data, null, 2)}</pre></details>`;
    //document.getElementById('ALL').innerHTML=line+document.getElementById('ALL').innerHTML;
    if (message.sc==true && enableSc) {
      document.getElementById('ALL').insertAdjacentHTML('afterbegin', line);
    }
    if (enableSc==false) {
      document.getElementById('ALL').insertAdjacentHTML('afterbegin', line);
    }
  //document.getElementById('ALL').insertAdjacentHTML('afterbegin', line);
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
