'use strict';
// jshint -W003
/*global chrome*/

var expanded = false;

function addConsoleTracker() {
  let tracker_script = `
  function fixTabs(current) {
    tab_lists_anchors = document.querySelector("#tabbs").getElementsByTagName("a");
    divs = document.querySelector("#tabbs").getElementsByTagName("table");
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
            clicked_tab = document.getElementById(current);
 
            clicked_tab.classList.add('active');
            div_to_show = clicked_tab.getAttribute('href');
 
            document.querySelector(div_to_show).style.display = "block";
 
    
  }
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
  `;
  return tracker_script;
}

function addTitle() {
  return ` <div style='padding:5px;color: #f1f3f4;background-color: #1e2541;height:35px;' id="myCoveoResponseCheckerTitle">Coveo's Response Checker</div>`;
  
}

function addButton(state) {
  let enabledText = "Enable Tracking";
  let chklabel = $(`<label id='lblCoveoResponseChecker' style='width: auto;clear: none;min-height: auto !important;font-size:11pt;float:right;color: white;padding: 0px;  padding-left: 5px;  padding-right: 5px;margin:0px;margin-right:10px;height:25px;margin-top: 3px;' for="chkCoveoResponseChecker">${enabledText}</label>`);
  let chk = $(`<input type="checkbox" id="chkCoveoResponseChecker" ${state.enabledSearch?"checked":""} style='position: inherit; opacity: inherit;clear: none;min-height: auto !important;font-size:11pt;float:right;color: white;padding: 0px;  padding-left: 5px; background:white; padding-right: 5px;margin:0px;height:25px;' ></input>`);
  chk.on("click", function(e){
    //e.preventDefault();
    let enable = $('#chkCoveoResponseChecker').prop('checked') ? true : false;
    console.log('enable clicked');
    chrome.runtime.sendMessage({
      type:"enablesearch",
      enable
  });

    //removeDiv();
    if (enable) {
      console.log('url: '+window.location.toString());
      chrome.runtime.sendMessage({
        action:"startrecord",
        recorded_tab: state.tabId,
        start_url: window.location.toString()
    });
    } else {
      chrome.runtime.sendMessage({
        action:"stoprecord" });
        
    }
    

  });

  let button = $(`<button id="clearCoveoResponseChecker" style='clear: none;min-height: auto !important;font-size:11pt;float:right;color: black;padding: 0px;  padding-left: 5px; background:white; padding-right: 5px;margin:0px;margin-right:10px;height:25px;' alt='RESET' >RESET</button>`);
  button.on("click", function(){
    console.log('RESET clicked');
    //removeDiv();
    chrome.runtime.sendMessage({
        type:"reset"
    })
 });
 let max = $("<img src='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgZmlsbD0ibm9uZSIgaGVpZ2h0PSIyNCIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS13aWR0aD0iMiIgdmlld0JveD0iMCAwIDI0IDI0IiB3aWR0aD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBvbHlsaW5lIHBvaW50cz0iMTUgMyAyMSAzIDIxIDkiLz48cG9seWxpbmUgcG9pbnRzPSI5IDIxIDMgMjEgMyAxNSIvPjxsaW5lIHgxPSIyMSIgeDI9IjE0IiB5MT0iMyIgeTI9IjEwIi8+PGxpbmUgeDE9IjMiIHgyPSIxMCIgeTE9IjIxIiB5Mj0iMTQiLz48L3N2Zz4=' height=25px style='clear: none;float:right;background:white;max-height: 24px;' alt='Max'></img>");
 max.on("click", function(){
   if (document.getElementById('myCoveoResponseChecker').style.height=="150px") {
    document.getElementById('myCoveoResponseChecker').style.height="80%";
    expanded = true;
   } else {
    document.getElementById('myCoveoResponseChecker').style.height="150px";
    expanded = false;
   }
});
let close = $("<img src='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMC8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvVFIvMjAwMS9SRUMtU1ZHLTIwMDEwOTA0L0RURC9zdmcxMC5kdGQnPjxzdmcgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgNTEyIDUxMiIgaGVpZ2h0PSI1MTJweCIgaWQ9IkxheWVyXzEiIHZlcnNpb249IjEuMCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHdpZHRoPSI1MTJweCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHBvbHlnb24gcG9pbnRzPSI0NDUuMiwxMDkuMiA0MDIuOCw2Ni44IDI1NiwyMTMuNiAxMDkuMiw2Ni44IDY2LjgsMTA5LjIgMjEzLjYsMjU2IDY2LjgsNDAyLjggMTA5LjIsNDQ1LjIgMjU2LDI5OC40IDQwMi44LDQ0NS4yICAgNDQ1LjIsNDAyLjggMjk4LjQsMjU2ICIvPjwvc3ZnPg==' height=25px style='clear: none;margin-left:3px;float:right;background:white;max-height: 24px;' alt='Close'></img>");
close.on("click", function(){
  if (document.getElementById('myCoveoResponseChecker')!=null) document.getElementById('myCoveoResponseChecker').remove();
  chrome.runtime.sendMessage({
    type:"close"
})

});

$('#myCoveoResponseCheckerTitle').append(close);
$('#myCoveoResponseCheckerTitle').append(max);
$('#myCoveoResponseCheckerTitle').append(button);
$('#myCoveoResponseCheckerTitle').append(chklabel);
$('#myCoveoResponseCheckerTitle').append(chk);

}

function addDiv(state) {
  let height="150px";
  let div = document.createElement('div');
  div.id='myCoveoResponseChecker';
  if (expanded) height = "80%";
  div.style =`margin-top: 5px;font-family:Arial;font-size:12pt;border: 2px white solid;height: ${height};z-index: 99999; -webkit-box-shadow: 0px 1px 6px 4px rgba(0,0,0,0.74); box-shadow: 0px 1px 6px 4px rgba(0,0,0,0.74);;width: 99%;  padding: 0px;  margin: 5px;  position: fixed;  bottom: 0px;background-color: white;`;
  div.innerHTML = addTitle();

  div.innerHTML += '<div style="overflow:auto;width:100%;height:95%;" id=myCoveoResponseCheckerProgress></div>'
  document.documentElement.append(div);
  addButton(state);

}

function removeDiv() {
  if (document.getElementById('myCoveoResponseChecker')!=null) document.getElementById('myCoveoResponseChecker').remove();
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


function processRequest(array) {
  let html='';
  array.map(request => {
      html+=`<tr><td>${request.url}</td>`;
      
  //We now all postedStrings
  html+=`<td style="max-width:inherit"><pre class='mycode'>${JSON.stringify(request.data,null,2)}</pre></td></tr>`;
  //html+=`<td></td></tr>`;
  });
  return html;
}

function update(state) {
  if (document.getElementById('myCoveoResponseCheckerProgress')==null) return;
  let html = '<style>.crs th {color: #1e2541;font-weight: bold;} .crs {border:none;margin-top: 5px;width: auto;max-width: 35%;float:left;padding:10px;border-spacing: 0px;} .crs  th {		border:1px solid #C0C0C0;		padding:5px;font-family:Arial !important;	font-size:11pt !important;	background:#F0F0F0;	}	.crs td { max-width: 500px;min-width: 30px;vertical-align: top;font-family:Arial !important;	font-size:11pt !important;		border:1px solid #C0C0C0;		padding:5px;}	td.nobord {border:none;}';
  html+= '.valid { width:30px !important;background-position: center;background-size:25px;background-repeat:no-repeat;background-image:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiM0MUFENDk7fQo8L3N0eWxlPjxnPjxwb2x5Z29uIGNsYXNzPSJzdDAiIHBvaW50cz0iNDM0LjgsNDkgMTc0LjIsMzA5LjcgNzYuOCwyMTIuMyAwLDI4OS4yIDE3NC4xLDQ2My4zIDE5Ni42LDQ0MC45IDE5Ni42LDQ0MC45IDUxMS43LDEyNS44IDQzNC44LDQ5ICAgICAiLz48L2c+PC9zdmc+)}';
  html+= '.notvalid { width:30px !important;background-position: center;background-size:25px;background-repeat:no-repeat;background-image:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjxzdmcgaWQ9IkxheWVyXzEiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDYxMiA3OTI7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA2MTIgNzkyIiB4bWw6c3BhY2U9InByZXNlcnZlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIj48c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNFNDQwNjE7fQo8L3N0eWxlPjxnPjxwb2x5Z29uIGNsYXNzPSJzdDAiIHBvaW50cz0iMzgyLjIsMzk2LjQgNTYwLjgsMjE3LjggNDg0LDE0MSAzMDUuNCwzMTkuNiAxMjYuOCwxNDEgNTAsMjE3LjggMjI4LjYsMzk2LjQgNTAsNTc1IDEyNi44LDY1MS44ICAgIDMwNS40LDQ3My4yIDQ4NCw2NTEuOCA1NjAuOCw1NzUgMzgyLjIsMzk2LjQgICIvPjwvZz48L3N2Zz4=)}';
  html+= '.help {  cursor:pointer;width:30px !important;background-position: center;background-size:25px;background-repeat:no-repeat;background-image:url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDUwIDUwIiBoZWlnaHQ9IjUwcHgiIGlkPSJMYXllcl8xIiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MCA1MCIgd2lkdGg9IjUwcHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIGZpbGw9Im5vbmUiIHI9IjI0IiBzdHJva2U9IiMwMDAwMDAiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2Utd2lkdGg9IjIiLz48cmVjdCBmaWxsPSJub25lIiBoZWlnaHQ9IjUwIiB3aWR0aD0iNTAiLz48Zz48cGF0aCBkPSJNMjMuNTMzLDMwLjQwN3YtMS40N2MwLTEuNDM2LDAuMzIyLTIuMTg4LDEuMDc1LTMuMjI5bDIuNDA0LTMuM2MxLjI1NC0xLjcyMSwxLjY4NC0yLjU0NiwxLjY4NC0zLjc2NiAgIGMwLTIuMDQ0LTEuNDM0LTMuMzM1LTMuNDc5LTMuMzM1Yy0yLjAwOCwwLTMuMjk5LDEuMjE5LTMuNzI5LDMuNDA3Yy0wLjAzNiwwLjIxNS0wLjE3OSwwLjMyMy0wLjM5NSwwLjI4N2wtMi4yNTktMC4zOTUgICBjLTAuMjE2LTAuMDM2LTAuMzIzLTAuMTc5LTAuMjg4LTAuMzk1YzAuNTM5LTMuNDQzLDMuMDE0LTUuNzAzLDYuNzQ0LTUuNzAzYzMuODcyLDAsNi40OSwyLjU0Niw2LjQ5LDYuMDk3ICAgYzAsMS43MjItMC42MDgsMi45NzctMS44MjgsNC42NjNsLTIuNDAzLDMuM2MtMC43MTcsMC45NjgtMC45MzMsMS40Ny0wLjkzMywyLjY4OXYxLjE0N2MwLDAuMjE1LTAuMTQzLDAuMzU4LTAuMzU4LDAuMzU4aC0yLjM2NyAgIEMyMy42NzYsMzAuNzY2LDIzLjUzMywzMC42MjIsMjMuNTMzLDMwLjQwN3ogTTIzLjM1NCwzMy44NTFjMC0wLjIxNSwwLjE0My0wLjM1OCwwLjM1OS0wLjM1OGgyLjcyNiAgIGMwLjIxNSwwLDAuMzU4LDAuMTQ0LDAuMzU4LDAuMzU4djMuMDg0YzAsMC4yMTYtMC4xNDQsMC4zNTgtMC4zNTgsMC4zNThoLTIuNzI2Yy0wLjIxNywwLTAuMzU5LTAuMTQzLTAuMzU5LTAuMzU4VjMzLjg1MXoiLz48L2c+PC9zdmc+)}';
  html+= ` .tabs{
    overflow:hidden;
    clear:both;
   
  }
  .mycode {font-family: courier; font-variant: normal !important; font-weight: normal !important; word-wrap: break-word; white-space: pre-wrap; word-break: break-all;}
  ul.tabs{
    list-style-type:none;
    bottom: -1px;
    position:relative;
  }
  .tabs li{
    float:left;
  }
   
  .tabs a{
    display:block;
    padding:5px 10px;
    background-color: #EEE;
    color: #000;
    text-decoration: none;
    margin: 0 4px;
    border-top:1px solid #CCC;
    border-left:1px solid #DDD;
    border-right:1px solid #DDD;
    font:13px/18px verdana,arial,sans-serif;
    border-bottom:1px solid #CCC;
  }
  .tabs a.active{
    background-color: #fff;
    border-bottom:1px solid #fff;
  }
  .tabbs table{
    clear: both;
    border:1px solid #CCC;
    padding:5px;
    font-family:verdana;
    font-size:13px;
    background-color: #fff;
    display:none;
  }
  .tabbs active {
    display:block;
  }`;
  html+= '</style>';
  html+= `<table class="crs"><tr><th colspan=4>Queries</th></tr>`;
  html+= `<tr><td></td><td>Check</td><td colspan=2>Nr</td></tr>`;
  
  html+= `<tr><td class=${state.queryRequests.length>0?"valid":"notvalid"}></td><td>No of Searches</td><td>${state.queryRequests.length}</td><td class="help"></td></tr>`;
  html+= state.searchReport;
  html+="</table>";
  html+= `<table style="margin-left:25px;" class="crs"><tr><th colspan=4>Query Suggest</th></tr>`;
  html+= `<tr><td></td><td>Check</td><td colspan=2>Value</td></tr>`;
  html+= `<tr><td class=${state.querySuggestRequests.length>0?"valid":"notvalid"}></td><td>No of Query Suggest</td><td>${state.querySuggestRequests.length}</td><td class="help"></td></tr>`;
  html+= state.qsReport;
  html+="</table>";
  html+= `<table style="margin-left:25px" class="crs"><tr><th colspan=4>Analytics</th></tr>`;
  html+= `<tr><td></td><td>Check</td><td colspan=2>Value</td></tr>`;
  
  html+= `<tr><td class=${state.analyticRequests.length>0?"valid":"notvalid"}></td><td>No of Analytics</td><td>${state.analyticRequests.length}</td><td class="help"></td></tr>`;
  html+= state.analyticReport;
  html+="</table>";
  html+= `<table style="margin-left:25px;max-width:inherit" class="crs"><tr><th colspan=4>E Commerce Events</th></tr>`;
  html+= `<tr><td>Event</td><td colspan=24>Checks</td></tr>`;
  html+= `<tr><td>No of E Commerce events</td><td class=${state.ecommerceRequests.length>0?"valid":"notvalid"} style="border-right:none;"></td><td style="border-left:none">${state.ecommerceRequests.length}</td></tr>`;
  html+= state.ecReport;
  html+="</table>";
  //Add the requests
  html+="<div style='margin-top:10px;padding-top: 10px;clear:both;overflow:auto' id='tabbs'>";

  html+="<ul class='tabs'>";
    html+='<li><a id=QRA href="#QR" onclick="fixTabs(\'QRA\');return false;" class="active">Query Requests</a></li>';
    html+='<li><a id=QSA href="#QS" onclick="fixTabs(\'QSA\');return false;">Query Suggest Requests</a></li>';
    html+='<li><a id=ARA href="#AR" onclick="fixTabs(\'ARA\');return false;">Analytic Requests</a></li>';
    html+='<li><a id=ECA href="#EC" onclick="fixTabs(\'ECA\');return false;">E Commerce Requests</a></li>';
    html+="</ul>";
  
  html+= `<table id=QR class="crs tab-content" style='clear:both;max-width:inherit'><tr><th colspan=4 style='text-align: left;'>Query Requests</th></tr>`;
  html+= processRequest(state.queryRequests);
  html+="</table>";
  html+= `<table id=QS class="crs tab-content" style='clear:both;max-width:inherit'><tr><th colspan=4 style='text-align: left;'>Query Suggest Requests</th></tr>`;
  html+= processRequest(state.querySuggestRequests);
  html+="</table>";
  html+= `<table id=AR class="crs tab-content" style='clear:both;max-width:inherit'><tr><th colspan=4 style='text-align: left;'>Analytic Requests</th></tr>`;
  html+= processRequest(state.analyticRequests);
  html+="</table>";
  html+= `<table id=EC class="crs tab-content" style='clear:both;max-width:inherit'><tr><th colspan=4 style='text-align: left;'>E Commerce Requests</th></tr>`;
  html+= processRequest(state.ecommerceRequests);
  html+="</table>";
  html+= "</div>";
  document.getElementById('myCoveoResponseCheckerProgress').innerHTML = html;
}

chrome.runtime.onMessage.addListener(function(request, sender, response){
//if (chrome && chrome.runtime && chrome.runtime.onMessage) {
  //console.log("In runtime OnMessage");
  //chrome.runtime.onMessage.addListener(
    //function (request/*, sender, sendResponse*/) {
      //console.log("In OnMessage");
      if (request.type === 'enabled') {
        if (request.global.enabled) {
          removeDiv();
          addDiv(request.global);
          update(request.global);
        } else {
          removeDiv();
        }
      }
      else if (request.type === 'update') {
        update(request.global);
      }
      else if (request.type === 'download') {
        downloadReport(request.name, request.text);
      }
       
      return true; 
    }
  );
//}

function downloadReport(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
