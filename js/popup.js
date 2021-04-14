'use strict';
// jshint -W110, -W003
/*global chrome, createWheel*/

let myDownloadTitle = '';
let currentState;

//CopyToClipboard so we can copy/paste the part of the report
function copyToClipboard(text) {
  if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
    try {
      let listener = (e) => {
        e.clipboardData.setData("text/html", text);
        e.clipboardData.setData("text/plain", text);
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

function createReportHTML(title) {
  let html = '';
  html += `<h1>${title}</h1>`;
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  var today = new Date();

  html += '<table><tr><td>Created on</td><td>' + today.toLocaleDateString("en-US", options) + '</td></tr>';
  html += `<tr><td>Url</td><td><a href='${encodeURI(currentState.document_url)}'>${currentState.document_url}</a></td></tr>`;
  html += `<tr><td>UA Version</td><td>${currentState.uaversion}</td></tr>`;
  html += '</table>';
  html += '<BR>';
  html += `<br>Online help resources:<br><br>
   <a href="https://docs.coveo.com/en/52" target="_blank" style='padding-left: 10px;'>Search</a>
   <a href="https://docs.coveo.com/en/1373" target="_blank" style='padding-left: 10px;'>Analytics</a>
   <a href="https://docs.coveo.com/en/3188" target="_blank" style='padding-left: 10px;'>E Commerce</a><br><br>`;
  if (currentState.scen_enabled) {
    html += '<br>Scenario: ' + $("#ScenarioSelector option:selected").text();
    html += '<br>' + document.getElementById('scenarioInstructions').innerHTML;
    html += '<hr>' + document.getElementById('scenarioResults').innerHTML;
  } else {
    html += '<h2>Overview</h2>';
    html += document.getElementById('overview').innerHTML;
    html += '<hr><h2>Queries</h2>';
    html += document.getElementById('QR').innerHTML;
    html += '<hr><h2>Query Suggest</h2>';
    html += document.getElementById('QS').innerHTML;
    html += '<hr><h2>Analytics</h2>';
    html += document.getElementById('AR').innerHTML;
    html += '<hr><h2>E Commerce</h2>';
    html += document.getElementById('EC').innerHTML;
  }
  html += '<hr><h2>Requests</h2>';
  html += '';
  for (var i = 0; i < currentState.dev.length; i++) {
    let empty = "";
    let title = currentState.dev[i].data.title ? " - " + currentState.dev[i].data.title : '';
    let status = currentState.dev[i].statusCode ? "<span class='sc'>statusCode: " + currentState.dev[i].statusCode + "</span>" : "<span class='sc'>(no statusCode received)</span>";
    let statusok = 'notvalidInd';
    if (currentState.dev[i].statusCode) {
      statusok = currentState.dev[i].statusCode == 200 ? "validInd" : "notvalidInd";
    }

    let line = `<span class='spacing'></span><span class='type ${!currentState.dev[i].data.oneisbad && currentState.dev[i].statusCode == 200 ? "validIndB" : "notvalidIndB"}'>${currentState.dev[i].request.type}${title}</span><span class="time">${currentState.dev[i].time}</span>`;
    //line += `<span class=code style='cursor:pointer'" id=${id}>Data sent(click to show):<pre class='mycode' id=${idc}>${JSON.stringify(message.request.data,null,2)}</pre></span>`;
    line += `<span class='url ${statusok}'><a href='${encodeURI(currentState.dev[i].request.url)}' target='_blank'>${currentState.dev[i].request.url}</a>${status}</span>`;
    line += `<details class=code>  <summary>Parameter validation</summary><ul>${currentState.dev[i].data.content}</ul></details>` + empty;
    line += `<details class=code>  <summary>Post/Form Data</summary>  <pre class='mycode'>${JSON.stringify(currentState.dev[i].request.data, null, 2)}</pre></details>`;
    //document.getElementById('ALL').innerHTML=line+document.getElementById('ALL').innerHTML;
    html += line;
  }
  return html;
}

function getReportHTML() {
  let text = createReportHTML(myDownloadTitle);
  let title = myDownloadTitle;//$('#xProjectname').val();
  let html = `<!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato">
  <link rel="stylesheet" href="http://coveo.github.io/vapor/dist/css/CoveoStyleGuide.css">
  <link rel="stylesheet" href="https://static.cloud.coveo.com/styleguide/v2.10.0/css/CoveoStyleGuide.css">
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
.req{
  font-size: 0.7em;
  padding-left: 10px;
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
}

  </style>
  <link rel="shortcut icon" href="https://www.coveo.com/public/img/favicon.png?v=1.0.72">
  <title>${title}</title>
  </head>
  <body class="coveo-styleguide">
  <header class="header bg-polygon">
    <div class="header-section">
      <a href="http://coveo.com" target="_blank">
        <div class="admin-logo">
          <div id="LogoV2" class="flex full-content"> <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 409.6 103.7" style="enable-background: new 0 0 409.6 103.7;" xml:space="preserve" class="pr1 flex flex-auto"> <style type="text/css"> .st0{fill: #ffffff;}.st1{fill: #00adff;}.st2{fill: #f05245;}.st3{fill: #1cebcf;}.st4{fill: #ffe300;}.st5{opacity: 0.87; fill: #ffffff; enable-background: new;}</style> <path class="st0" d="M164.7,36.2l-4.9,5.2c-3.4-3.3-7-5.2-11.9-5.2c-8.5,0-14.9,6.7-14.9,16.1s6.4,16.1,14.9,16.1c4.6,0,9-1.9,12.2-5.2l4.6,5.2c-4,4.6-9.7,7-16.4,7c-14,0-23.1-10-23.1-23.1c0-13.4,9.1-23.4,23.1-23.4C154.6,28.8,160.6,31.5,164.7,36.2L164.7,36.2z"></path> <path class="st0" d="M219.4,52.3c0,13.1-10,23.1-23.4,23.1c-13.7,0-23.7-10-23.7-23.1c0-13.4,10-23.4,23.7-23.4C209.4,28.9,219.4,38.9,219.4,52.3z M180.2,52.3c0,9.4,6.7,16.1,15.8,16.1c8.8,0,15.5-6.7,15.5-16.1s-6.7-16.1-15.5-16.1C186.9,36.2,180.2,42.9,180.2,52.3L180.2,52.3z"></path> <polygon class="st0" points="252.3,74.5 243.1,74.5 224.3,30.1 232.8,30.1 247.7,66.9 262.6,30.1 270.8,30.1 252.3,74.5 "></polygon> <path class="st0" d="M318.8,52v3h-35c0.9,9.1,7.3,13.7,14.9,13.7c5.1,0.1,10.1-1.8,14-5.2l4,5.2c-5.5,5.2-11.6,6.8-18.3,6.8c-13.4,0-22.8-9.1-22.8-23.1c0-13.7,9.4-23.4,22.2-23.4C310,28.9,318.8,38.6,318.8,52L318.8,52z M283.9,48.6h27.4c-0.9-7.6-6.1-12.8-13.4-12.8C290,35.9,285.1,41,283.9,48.6L283.9,48.6z"></path> <path class="st0" d="M376,52.3c0,13.1-10,23.1-23.4,23.1c-13.7,0-23.7-10-23.7-23.1c0-13.4,10-23.4,23.7-23.4C365.9,28.9,376,38.9,376,52.3z M336.8,52.3c0,9.4,6.7,16.1,15.8,16.1c8.8,0,15.5-6.7,15.5-16.1s-6.7-16.1-15.5-16.1C343.4,36.2,336.8,42.9,336.8,52.3z"></path> <path class="st1" d="M88.1,14.9C79.5,6.4,68.3,1.2,56.2,0c-0.9,0-1.6,0.8-1.6,1.8c0,0.4,0.1,0.7,0.4,1l18.8,18.5c0,0.3,0,0.3-0.3,0.3c-5.2-3.8-11.3-6.1-17.6-6.7c-0.6-0.1-1.1,0.3-1.2,0.9c0,0.3,0.1,0.6,0.3,0.9l12.8,12.8c0,0,0,0.3-0.3,0c-3.5-2.2-7.4-3.6-11.6-4c-0.6,0-0.9,0.6-0.6,1.2l21.6,21.6c0.6,0.6,1.5,0,1.2-0.6c-0.3-4.1-1.7-8.1-4-11.6c-0.3,0,0-0.3,0,0l12.5,12.2c0.6,0.6,1.8,0,1.8-0.9c-0.7-6.4-3-12.6-6.7-17.9c-0.3,0,0-0.3,0,0L100.6,48c0.5,0.6,1.3,0.7,1.9,0.3c0.5-0.3,0.7-0.9,0.5-1.5C101.9,34.7,96.6,23.4,88.1,14.9L88.1,14.9z"></path> <path class="st2" d="M14.9,14.9C23.6,6.5,34.8,1.2,46.8,0c0.9,0,1.6,0.6,1.7,1.5c0,0.4-0.1,0.9-0.5,1.2L29.5,21.3c-0.3,0.3,0,0.3,0,0.3c5.3-3.8,11.5-6.1,17.9-6.7c0.9,0,1.5,1.2,0.9,1.8L35.6,29.5c-0.3,0,0,0.3,0,0c3.5-2.2,7.4-3.5,11.6-4c0.6,0,1.2,0.6,0.6,1.2L26.1,48.3c-0.6,0.6-1.2,0-1.2-0.6c0.4-4.1,1.9-8.1,4.3-11.6c0,0-0.3-0.3-0.3,0L16.7,48.3c-0.9,0.6-2.1,0-1.8-0.9c0.6-6.5,2.9-12.7,6.7-17.9c0,0-0.3-0.3-0.3,0L2.7,48C1.5,49.2,0,48.3,0,46.8C1.2,34.8,6.5,23.6,14.9,14.9z"></path> <path class="st3" d="M14.9,88.8c8.5,8.6,19.8,13.9,31.9,14.9c0.8,0.1,1.5-0.4,1.6-1.2c0.1-0.5-0.1-0.9-0.4-1.3L29.5,82.4c-0.3,0,0-0.3,0,0c5.3,3.8,11.5,6.1,17.9,6.6c0.9,0,1.5-1.2,0.9-1.8L35.6,74.5c-0.3-0.3,0-0.3,0-0.3C39,76.5,43,78,47.1,78.4c0.6,0,1.2-0.9,0.6-1.2L26.1,55.6c-0.6-0.6-1.2-0.3-1.2,0.6c0.4,4.1,1.9,8.1,4.3,11.6c0,0-0.3,0.3-0.3,0L16.7,55.6c-0.9-0.6-2.1-0.3-1.8,0.9c0.6,6.4,2.9,12.5,6.7,17.6c0,0.2-0.1,0.3-0.3,0.3c0,0,0,0,0,0L2.7,55.6C2,55,0.9,55.2,0.4,55.9c-0.2,0.3-0.3,0.6-0.4,1C1.1,68.9,6.4,80.2,14.9,88.8z"></path> <path class="st4" d="M88.1,88.8c-8.5,8.7-19.8,14-31.9,14.9c-1.2,0.3-2.1-1.5-1.2-2.4l18.8-18.8c0,0,0-0.3-0.3,0c-5.2,3.8-11.3,6.1-17.6,6.7c-0.6,0.1-1.1-0.4-1.2-1c0-0.3,0.1-0.6,0.3-0.9l12.8-12.8c0-0.3,0-0.3-0.3-0.3c-3.4,2.4-7.4,3.9-11.5,4.2c-0.5-0.1-0.8-0.5-0.7-0.9c0-0.1,0-0.2,0.1-0.3l21.6-21.6c0.6-0.6,1.5-0.3,1.2,0.6c-0.3,4.1-1.7,8.1-4,11.6c-0.3,0,0,0.3,0,0l12.5-12.2c0.4-0.4,1.1-0.4,1.5,0c0.2,0.2,0.3,0.6,0.3,0.9c-0.7,6.3-3,12.4-6.7,17.6c-0.3,0.3,0,0.3,0,0.3l18.8-18.8c0.9-0.9,2.7,0,2.4,1.2C102,68.9,96.7,80.2,88.1,88.8L88.1,88.8z"></path> <path class="st5" d="M390.8,31.9V43h-1.9V31.9h-3.5v-1.8h9v1.8H390.8z"></path> <path class="st5" d="M407.7,43v-8.6l-3,6.2h-1.4l-3-6.2V43h-2V30.2h2l3.7,8l3.7-8h1.9V43H407.7z"></path> </svg> <div class="logo-text flex flex-center pl1 my3"></div></div>
        </div>
      </a>
    </div>
    <div class="flex-auto"></div>
    <div class="header-section mod-padded flex flex-center" id="myTitle">Coveo's Response Checker Report</div>
  </header>
  ${text}
  </body>
  </html>`;
  return html;
}

//Download the report
function downloadReport() {
  try {
    let url = new URL(currentState.document_url);
    let title = url.hostname.replaceAll('.',' ');
    if (currentState.scen_enabled) {
      title += ' - Scenario ' + currentState.scenarioId;
    }
    myDownloadTitle = title;
    let html = getReportHTML();
    let filename = '';
    SendMessage({
      type: 'download',
      name: myDownloadTitle + '.html',
      text: html
    });
  }
  catch (err) {
    console.log('Oops, unable to download', err);
  }
}

//Download the report
function downloadReportJSON() {
  try {
    let url = new URL(currentState.document_url);
    let title = url.hostname.replaceAll('.',' ');
    if (currentState.scen_enabled) {
      title += ' - Scenario ' + currentState.scenarioId;
    }
    myDownloadTitle = title;
    var dt = new NightwatchRenderer();
    dt.items = currentState.record;
    let json = dt.render(false, null, true);
  
    let filename = '';
    SendMessage({
      type: 'downloadjson',
      name: myDownloadTitle + '.json',
      text: json
    });
  }
  catch (err) {
    console.log('Oops, unable to download', err);
  }
}


let processState = (data) => {
  currentState = data;
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
  $('#setScenario input').prop('checked', data.scen_enabled);
  //if we have actual data
  let showReport = data.queryRequests.length > 0 || data.querySuggestRequests.length > 0 || data.analyticRequests.length > 0 || data.ecommerceRequests.length > 0;
  console.log(data);
  if (data.scen_enabled) {
    $('#globalReport').hide();
    $('#scenario').show();
    $('#instructions').hide();
    g_scenarios = data.scenario;
    if (data.scenario == undefined || data.scenario.length==0) {
      SendMessage({ type: 'getScenarios' }, fillScenarios);
    }
    if (data.scenario && data.scenarioId=='') {
      fillScenarios(data.scenario);
    }
    if (data.scenarioId!='') {
      updateScenario(data.scenarioId, data);
      fillScenarios(data.scenario);
      $('#ScenarioSelector').val(data.scenarioId).change();
      $(`#ScenarioSelector option[value=${data.scenarioId}]`).attr('selected', 'selected');
    }
    if (data.scenario != undefined && data.scenarioId!='') {
      processDataSC(data);
    }

  } else {
    if (showReport) {
      $('#btnscenario').removeClass('activeButton');
      $('#globalReport').show();
      $('#scenario').hide();

      processData(data);
    }
  }
  //Enable Scneario onChange
  $('#ScenarioSelector').on('change', selectScenario);

  //console.log(data.enabledSearch);
  changeUI(data.enabledSearch, false);
  //console.log(data.tab);
  //if (data.tab != 'OverviewA')  
  fixTabs(data.tab);

};

let createTests = (state) => {
  let tests = '';
  return tests;
}

let processDataSC = (state) => {
  let queries = '';
  //Final check, is scenario properly done
  let final = true;
  if (state['searchIndData']==true) final = final && state.searchInd;
  if (state['qsIndData']==true) final = final && state.qsInd;
  if (state['analyticIndData']==true) final = final && state.analyticInd;
  if (state['ecIndData']==true) final= final && state.ecInd;
  if (state['searchIndData']!=undefined && state['searchIndData']==false) final = true;
  if (state['qsIndData']!=undefined && state['qsIndData']==false) final = true;
  if (state['analyticIndData']!=undefined && state['analyticIndData']==false) final = true;
  if (state['ecIndData']!=undefined && state['ecIndData']==false) final= true;
  queries += `<h2 class="${!final?'validInd':'notvalidInd'}">Scenario ${!final?'properly':'NOT properly'} executed</h2>`;
  if (state.searchReport != '') {
    queries += `<hr><h2 class="${!state.searchInd?'validInd':'notvalidInd'}">Queries</h2>`;
    queries += `<table class="crs datepicker-table"><tr><th>Valid</th><th>Check</th><th colspan=2>Content (last request)</th></tr>`;
    queries += state.searchReport;
    queries += `</table>`;
  }

  if (state.qsReport != '') {
    queries += `<hr><h2 class="${!state.qsInd?'validInd':'notvalidInd'}">Query Suggestions</h2>`;
    queries += `<table class="crs datepicker-table"><tr><th>Valid</th><th>Check</th><th colspan=2>Content (last request)</th></tr>`;
    queries += state.qsReport;
    queries += `</table>`;
  }
  if (state.analyticReport != '') {
    queries += `<hr><h2 class="${!state.analyticInd?'validInd':'notvalidInd'}">Analytics</h2>`;
    queries += `<table class="crs datepicker-table"><tr><th>Valid</th><th>Check</th><th colspan=2>Content (last request)</th></tr>`;
    queries += state.analyticReport;
    queries += `</table>`;
  }

  if (state.ecReport != '') {
    queries += `<hr><h2 class="${!state.ecInd?'validInd':'notvalidInd'}">E Commerce</h2>`;
    queries += `<table class="crs datepicker-table"><tr><th>Valid</th><th>Event</th><th colspan=2>Checks (all requests)</th></tr>`;
    queries += state.ecReport;
    queries += `</table>`;
  }
  document.getElementById('scenarioResults').innerHTML = queries;
}

let processData = (state) => {
  //Add warnings to headers
  let overviewValid = state.queryRequests.length > 0 && state.querySuggestRequests.length > 0 && state.analyticRequests.length > 0;
  document.getElementById('OverviewA').className = overviewValid ? "validInd" : "notvalidInd";
  document.getElementById('QRA').className = !state.searchInd ? "validInd" : "notvalidInd";
  document.getElementById('QSA').className = !state.qsInd ? "validInd" : "notvalidInd";
  document.getElementById('ARA').className = !state.analyticInd ? "validInd" : "notvalidInd";
  document.getElementById('ECA').className = !state.ecInd ? "validInd" : "notvalidInd";
  let overview = '';
  overview += `<table class="crs datepicker-table"><tr><th>Valid</th><th>Check</th><th>Nr of Requests</th></tr>`;
  overview += `<tr><td class=${state.queryRequests.length > 0 ? "valid" : "notvalid"}></td><td>Queries</td><td class="numbers">${state.queryRequests.length}</td></tr>`;
  overview += `<tr><td class=${state.querySuggestRequests.length > 0 ? "valid" : "notvalid"}></td><td>Query Suggest</td><td  class="numbers">${state.querySuggestRequests.length}</td></tr>`;
  overview += `<tr><td class=${state.analyticRequests.length > 0 ? "valid" : "notvalid"}></td><td>Analytics</td><td  class="numbers">${state.analyticRequests.length}</td></tr>`;
  overview += `<tr><td class='${!state.ecInd ? "valid" : "notvalid"} notmandatory'></td><td>E Commerce</td><td  class="numbers">${state.ecommerceRequests.length}</td></tr>`;
  overview += `<tr><td class='${state.uaversion != '' ? "valid" : "notvalid"} notmandatory'></td><td>UA Version</td><td  class="numbers">${state.uaversion}</td></tr>`;
  overview += `</table>`;
  //console.log(overview);
  document.getElementById('overview').innerHTML = overview;

  let queries = '';
  queries += `<table class="crs datepicker-table"><tr><th>Valid</th><th>Check</th><th colspan=2>Content (last request)</th></tr>`;
  queries += state.searchReport;
  queries += `</table>`;
  document.getElementById('QR').innerHTML = queries;

  queries = '';
  queries += `<table class="crs datepicker-table"><tr><th>Valid</th><th>Check</th><th colspan=2>Content (last request)</th></tr>`;
  queries += state.qsReport;
  queries += `</table>`;
  document.getElementById('QS').innerHTML = queries;

  queries = '';
  queries += `<table class="crs datepicker-table"><tr><th>Valid</th><th>Check</th><th colspan=2>Content (last request)</th></tr>`;
  queries += state.analyticReport;
  queries += `</table>`;
  document.getElementById('AR').innerHTML = queries;

  queries = '';
  queries += `<table class="crs datepicker-table"><tr><th>Valid</th><th>Event</th><th colspan=2>Checks (all requests)</th></tr>`;
  queries += state.ecReport;
  queries += `</table>`;
  document.getElementById('EC').innerHTML = queries;

  let nightwatch = '';
  document.getElementById('Nightwatch').innerHTML = '';
  var dt = new NightwatchRenderer();
  dt.items = state.record;
  //Add the tests to the nightwatch file
  let tests = createTests(state);
  document.getElementById('Nightwatch').innerHTML = dt.render(false, tests, false);
  //Add the tests to the nightwatch file

  //document.getElementById('Nightwatch').innerHTML = nightwatch;
}

let processStateForPush = (data) => {
  if (!data) {
    return;
  }
  push(data);
};


function getReport() {
  $('#loading').show();
  $('#instructions').hide();
  document.getElementById('scores').innerHTML = '';
  document.getElementById('details').innerHTML = '';
  SendMessage('getNumbersBackground');
}





function caseInsensitiveSort(a, b) {
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

//For queries, else get to many requests
function sleeper(ms) {
  return function (x) {
    return new Promise(resolve => setTimeout(() => resolve(x), ms));
  };
}


var convArrToObj = function (array) {
  var thisEleObj = new Object();
  if (typeof array == "object") {
    for (var i in array) {
      var thisEle = convArrToObj(array[i]);
      thisEleObj[i] = thisEle;
    }
  } else {
    thisEleObj = array;
  }
  return thisEleObj;
}


function escapeRegExp(str) {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(escapeRegExp(search), 'g'), replacement);
};


let getState = () => {
  console.log('sending getState');
  SendMessage('getState', processState);
};


function toggleTracker() {
  let enable = $('#setSearchTracker input').prop('checked') ? true : false;
  currentState.enabledSearch = enable;
  SendMessage({ type: 'enablesearch', enable });
}

function updateScenario(scenarioId, data) {
  //Find the scenarioId in global scenario and show instructions
  let html = '';
  let selectedsc;
  if (g_scenarios == undefined && data != undefined) {
    g_scenarios = data.scenario;

  }
  if (scenarioId == "-1") return;
  g_scenarios.all.map((sc) => {
    if (sc.id == scenarioId) {
      html = sc.instructions;
    }
  });
  $('#InstructionSet').html(html);
  //document.getElementById('scenarioInstructions').innerHTML = 'Instructions:<BR><div class="InstructionSet">' + (html)+"</div>";
  //Add the tests
  if (data != undefined) {

  }
}

function getScenarioState(){
  //get the scenario created state, so that we can process the data
  SendMessage('getState', processDataSC);

}
function selectScenario() {
  let scenarioId = $('#ScenarioSelector').val();
  if (scenarioId != "-1") {
    SendMessage({ type: 'selectscenario', scenarioId: scenarioId });
    updateScenario(scenarioId);
    
    //Check if tracker needs to be set
    if (!currentState.enabledSearch) {
      //Start tracker
      $('#setSearchTracker input').prop('checked', true);
      //toggleTracker();
      currentState.enabledSearch = true;
  SendMessage({ type: 'enablesearch', enable: true });
      getScenarioState();
    } else {
      getScenarioState();
    }
    
    //getState();
  }
}

function reset() {
  //reset all parameters
  $('#instructions').show();

  $('#myscreenimage').css('background-image', 'none').hide();
  $('#push').attr("disabled", true);
  //$('#showSFDC').attr("disabled", true);
  document.getElementById('scenarioResults').innerHTML = '';
  $('#setScenario input').prop('checked', false);
  $('#setSearchTracker input').prop('checked', false);
  $('#recording').hide();
  $('#copyNightwatch').hide();
  $('#loading').hide();
  $('#globalReport').hide();
  $('#scenario').hide();

  SendMessage('reset', getState);
  //window.close();
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
    $('#download-json').show();
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

function toggleScenario() {
  let enable = $('#setScenario input').prop('checked') ? true : false;
  if (enable) {
    SendMessage({ type: 'enableSc',enabled: true });
    SendMessage({ type: 'getScenarios' }, fillScenarios);
    $('#globalReport').hide();
    $('#instructions').hide();
    $('#scenario').show();
  } else {
    SendMessage({ type: 'enableSc',enabled: false });
    $('#instructions').show();
    $('#scenario').hide();
    $('#btnscenario').removeClass('activeButton');
  }

}
function fixTabs(current) {
  if (current == 'NightwatchA') {
    $('#copyNightwatch').show();
  } else {
    $('#copyNightwatch').hide();
  }
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

let g_scenarios = undefined;

function fillScenarios(scenario) {
  g_scenarios = scenario;
  $('#ScenarioSelector')
    .find('option')
    .remove();
  $('#ScenarioSelector').append(`<option value="-1">--SELECT--</option>`);
  scenario.all.map((sc) => {
    $('#ScenarioSelector').append(`<option value="${sc.id}">${sc.title}</option>`);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  // Handle clicks on slide-toggle buttons
  var manifestData = chrome.runtime.getManifest();
  $('#myTitle').text("Coveo Request Checker " + manifestData.version);
  $('#recording').hide();
  $('#copyNightwatch').hide();
  $('#loading').hide();
  $('#globalReport').hide();
  $('#scenario').hide();
  $('#tabs').click((e) => { fixTabs(e.target.id); return false; });
  $('#setScenario input').prop('checked', false);
  $('#setScenario').on('change', toggleScenario);
  $('#setSearchTracker input').prop('checked', false);
  $('#setSearchTracker').on('change', toggleTracker);
  $('#setSearchTrackerButton').click((e) => {
    e.preventDefault();
    $('#setSearchTracker input').prop('checked', $('#setSearchTracker input').prop('checked') ? false : true);
    toggleTracker();
    return true;
  });
  $('#download-global').hide();
  $('#download-global').click(() => {
    downloadReport();
  });
  $('#download-json').hide();
  $('#download-json').click(() => {
    downloadReportJSON();
  });
  $('#btnscenario').click((e) => {
    e.preventDefault();
    $('#setScenario input').prop('checked', $('#setScenario input').prop('checked') ? false : true);
    toggleScenario();
  })
  $('#showInstructions').click(() => {
    $('#instructions').toggle();
  });
  $('#copyNightwatch').click((e) => {
    e.preventDefault();

    copyToClipboard(document.getElementById('NightwatchCode').innerText);
    $('#clipboard-copied').removeClass('mod-hidden');
    setTimeout(() => {
      $('#clipboard-copied').addClass('mod-hidden');
    }, 999);
    return true;
  });

  $('#getReport').click(getReport);
  $('#clear').click(() => {
    reset();
    /*document.getElementById('details').innerHTML = '';
    $('#recording').hide();
    $('#copyNightwatch').hide();
    $('#loading').hide();
    $('#globalReport').hide();
    SendMessage({ type: 'selectscenario', scenarioId: '' });

    SendMessage('reset', getState);*/
    //window.close();
  });
  getState();
});