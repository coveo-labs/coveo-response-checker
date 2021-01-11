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

let processDetail = (section, data, tests) => {
  let lines = section.attributes.map(attr => {

    let isValidCssClass = '',
      value = data[attr.key],
      hint = '';
    //Check if value is undefined, if so, make it empty string
    if (value == undefined) {
      value = '';
    }
    let additionalClass = '';
    let validColor = '';
    let validIcon = '';
    let mandatoryIcon = '';
    let mandatory = false;
    if (Array.isArray(value)) {
      value = value.sort(caseInsensitiveSort).join('<BR>');
    }
    if (attr.additionalClass !== undefined) {
      additionalClass = attr.additionalClass;
    }
    if (attr.mandatory !== undefined) {
      mandatory = true;
    }
    //Always show hints
    if (attr.hint) {
      // show hints when invalid.
      if (attr.ref) {
        hint = `${attr.hint} <a href="${attr.ref}" target="_blank">&#x2753;</a>`;
      }
      else {
        hint = `${attr.hint}`;
      }
    }

    if (attr.expected !== undefined) {
      let isValid = false;
      if (attr.expected.test) {
        isValid = attr.expected.test(value);
      }
      else {
        isValid = (value === attr.expected);
      }

      // keep a cache of validity test results, re-used in Clipboard data.
      CLIPBOARD_VALID_FIELDS[section.label + attr.key] = isValid;

      if (isValid) {
        //If it should not be calculated for the total score
        if (attr.notForTotal === undefined) {
          tests.passed++;
        }
      }
      else {
      }

      validColor = `color: ${isValid ? '#009830' : '#ce3f00'}`;
      validIcon = `<span style="font-weight:bold;${validColor}">${isValid ? '&#x2713;' : '&#x2718;'}</span>`;

      isValidCssClass = 'valid-' + isValid;
      if (mandatory) {
        mandatoryIcon = `<span class='${isValidCssClass}'>&#x2605;</span>`;
        //check if mandoatory is failed, else we need to set the flag of a total failure
        if (!isValid) {
          tests.mandatoryfail = true;
        }
      }
    }

    //If it should not be calculated for the total score
    if (attr.notForTotal === undefined) {
      tests.total++;
    }

    return `<tr class="${isValidCssClass}">
        <td class="line-mandatory">
          ${mandatoryIcon}
        </td>
        <td class="line-message">
          ${attr.label}
          <small>${hint}</small>
        </td>
        <td class="line-indicator" width="1px">${validIcon}</td>
        <td class="line-result ${additionalClass}">${value}</td>
      </tr>`;
  });

  let score = createWheel({ title: section.title, value: tests.passed, max: tests.total });

  return `<ul id="${section.label}" class="collapsible" data-collapsible="expandable">
  <li>
    <div class="copy-section" style=""></div>
    <button type="button" class="collapsible-header active btn with-icon">
      <div class="msg">
        ${section.title}
      </div>
      <div class="result" style="">${score}</div>
    </button>
    <div class="collapsible-body">
      <table><tbody>
        ${lines.join('\n')}
      </tbody></table>
    </div>
  </li>
</ul>`;
};


let processDetailPerformanceReport = (section, data, tests, smallerIsBetter, total) => {
  let lines = data.map(attr => {

    let isValidCssClass = '';
    let additionalClass = '';
    let validColor = '';
    let validIcon = '';
    let mandatoryIcon = '';
    let mandatory = false;
    let url = '';
    let shorturl = '';
    // show hints when invalid.
    if (attr.url != '') {
      shorturl = attr.url.substring(0, 70) + "...";
      url = `<a href="${attr.url}" title="${attr.url}" target="_blank">${shorturl}</a>`;
    }
    let perc = Math.round((attr.duration / (total / 100)), 0);

    return `<tr class="${isValidCssClass}">
        <td class="line-performance">
          ${attr.name}
          <p style="font-size:10px">${url}</p>
          <div class="progress" data-amount="${perc}"> <div class="amount" style="width:${100 - perc}%"></div></div>
        </td>
        <td class="line-type">${attr.type}</td>
        <td class="line-duration">${attr.duration}</td>
        <td class="line-ttfb">${attr.sent}</td>
        <td class="line-ttfb">${attr.backend}</td>
        <td class="line-ttfb">${attr.receive}</td>
      </tr>`;
  });

  let score = createWheel({ title: section.title, value: tests.passed, max: tests.total, smallerIsBetter: smallerIsBetter });

  return `<ul id="${section.label}" class="collapsible" data-collapsible="expandable">
  <li>
    <div class="copy-section" style=""></div>
    <button type="button" class="collapsible-header active btn with-icon">
      <div class="msg">
        ${section.title}
      </div>
      <div class="result" style="">${score}</div>
    </button>
    <div class="collapsible-body">
      <table><tbody><tr><th class="line-performance">Request</th><th class="line-type">Type</th><th class="line-duration">Total (ms)</th><th class="line-ttfb">Sent (ms)</th><th class="line-ttfb">Processing<br>back-end (ms)</th><th class="line-ttfb">Receive (ms)</th></tr>
        ${lines.join('\n')}
      </tbody></table>
    </div>
  </li>
</ul>`;
};

let renderClipboardHtml = (section, data) => {
  let lines = section.attributes.map(attr => {

    let value = data[attr.key],
      mandatoryIcon = '',
      validColor = '',
      validIcon = '',
      additionalClass = '',
      ref = '',
      hint = '';
    if (Array.isArray(value)) {
      value = value.join('<BR>');
    }
    let isValid = CLIPBOARD_VALID_FIELDS[section.label + attr.key];
    if (isValid !== undefined) {
      validColor = `color: ${isValid ? '#009830' : '#ce3f00'}`;
      validIcon = `<span style="font-weight:bold;${validColor}">${isValid ? '&#x2713;' : '&#x2718;'}</span>`;
    }
    if (attr.hint) {
      ref = `<a href="${attr.ref}" target="_blank">&#x2753;</a>`;
      if (attr.ref) {
        hint = `<div style="font-size: 11px;color: #1d4f76;">${attr.hint} ${ref}</div>`;
      }
      else {
        hint = `<div style="font-size: 11px;color: #1d4f76;">${attr.hint}</div>`;

      }
    }
    if (attr.additionalClass !== undefined) {
      additionalClass = `font-family: courier;font-variant: normal !important;font-weight: normal !important;font-size: 11px; word-wrap: break-word;white-space: pre-wrap;word-break: break-all;`;
    }
    if (attr.mandatory) {
      mandatoryIcon = `<span style="${validColor}">&#x2605;</span>`;
    }

    return `<tr>
    <td width=0 style="border-right: none;font-weight:bold;vertical-align: top">${mandatoryIcon}</td>
    <td style="padding-left:15px;vertical-align: top;border-left: none" width="50%">${attr.label}${hint}</td>
    <td width=0 style="border-right: none;vertical-align: top">${validIcon}</td>
    <td style="padding-left:15px;vertical-align: top;border-left: none;${validColor};${additionalClass}" width="50%">${value}</td></tr>`;
  });

  return `<table border="1" bordercolor="#bcc3ca" cellspacing="0" style="border-collapse: collapse; width:90%; font-size: 13px;box-sizing: border-box;font-family: Lato, Arial, Helvetica, sans-serif;"><tbody><tr>
<td colspan="4" style="border-bottom: 1px solid #bcc3ca;padding: 9px 15px;text-transform: uppercase;font-size: 13px;color: #1d4f76; height: 34px; background: #e6ecf0;">
<span style="background:#e6ecf0;">${section.title}</span><br>
<span style="font-size:8px;background:#e6ecf0;">(<span style='font-weight:bold;color: #009830'>&#x2605;</span> mandatory, <span style='font-weight:bold;color: #ce3f00'>&#x2605;</span> mandatory failed)</span>
</td></tr>
${lines.join('\n')}</tbody></table>
</div>
`; // leave empty last line here, and don't re-indent the strings
};

let renderClipboardPerformanceHtml = (section, data) => {
  let lines = data.map(attr => {

    /*
         <td class="line-performance">
          ${attr.name}
          <small>${url}</small>
          <br><div class="progress" data-amount="${perc}"> <div class="amount" style="width:${100-perc}%"></div></div>
        </td>
        <td class="line-type">${attr.type}</td>
        <td class="line-duration">${attr.duration}</td>
        <td class="line-ttfb">${attr.TTFB}</td>*/
    let url = '';
    let shorturl = '';
    // show hints when invalid.
    if (attr.url != '') {
      shorturl = attr.url.substring(0, 70) + "...";
      url = `<a href="${attr.url}" title="${attr.url}" target="_blank">${shorturl}</a>`;
    }
    return `<tr>

    <td width="40%">${attr.name}<br>${url}</td>
    <td width="10%">${attr.type}</td>
    <td width="10%">${attr.duration}</td>
    <td width="10%">${attr.sent}</td>
    <td width="10%">${attr.backend}</td>
    <td width="10%">${attr.receive}</td>
    </tr>`;
  });

  return `<table border="1" bordercolor="#bcc3ca" cellspacing="0" style="border-collapse: collapse; width:90%; font-size: 13px;box-sizing: border-box;font-family: Lato, Arial, Helvetica, sans-serif;"><tbody><tr>
<td colspan="4" style="border-bottom: 1px solid #bcc3ca;padding: 9px 15px;text-transform: uppercase;font-size: 13px;color: #1d4f76; height: 34px; background: #e6ecf0;">
<span style="background:#e6ecf0;">${section.title}</span><br>
</td></tr>
<tr><td>Request</td><td>Type</td><td>Total (ms)</td><td>Sent (ms)</td><td>Processing<br>back-end (ms)</td><td>Receive (ms)</td></tr>
${lines.join('\n')}</tbody></table>
</div>
`; // leave empty last line here, and don't re-indent the strings
};


let renderClipboardPlain = (section, data) => {
  let lines = section.attributes.map(attr => {

    let value = data[attr.key],
      valid = '',
      hint = '';

    if (CLIPBOARD_VALID_FIELDS[section.label + attr.key] === false) {
      valid = '[X] ';
    }
    if (attr.hint) {
      hint = ` (${attr.hint})`;
    }

    return `${attr.label}${hint}: ${valid}${value}`;
  });

  return `${section.title}

${lines.join('\n')}
`; // leave empty last line here, and don't re-indent the strings
};

/**
 *  Generates the report in the Popup window.
 */
let processReport = (data) => {
  let sections = [];
  var manifestData = chrome.runtime.getManifest();
  data["extversion"] = manifestData.version;
  
    myDownloadTitle = 'Coveo Response Checker Report';
    sections = [
      {
        title: 'Query information', label: 'Query', attributes: [
          { key: 'theUrl', notForTotal: true, label: 'Url', hint: '' },
          { key: 'extversion', label: 'Generated by Version', hint: '' },
          { key: 'theDate', notForTotal: true, label: 'Date', hint: '' },
          { key: 'nrofsearches', label: 'Queries executed', hint: 'At least 1', ref: 'https://docs.coveo.com/en/328', expected: 1 },
          { key: 'analyticsSent', mandatory: true, label: 'Analytics Sent', hint: 'Should be true, proper use of Analytics and ML', ref: 'https://coveo.github.io/search-ui/components/analytics.html', expected: true },
          { key: 'hardcodedAccessTokens', label: 'Hard coded Access Tokens', hint: 'Should NOT be done!!', ref: 'https://docs.coveo.com/en/56/cloud-v2-developers/search-token-authentication', expected: false },
          { key: 'alertsError', mandatory: true, label: 'No Search alerts error', ref: 'https://onlinehelp.coveo.com/en/cloud/deploying_search_alerts_on_a_coveo_js_search_page.htm', hint: `Bad access to search alert subscriptions Or remove component class='CoveoSearchAlerts'`, expected: '' },
          { key: 'analyticsFailures', mandatory: true, label: 'Searches executed without sending analytics', ref: 'https://docs.coveo.com/en/305/javascript-search-framework/implementing-a-custom-component-in-javascript', hint: 'Manual triggered search did not sent analytics', expected: 0 },
        ]
      },
      {
        title: 'Behavior information', label: 'Behavior', attributes: [
          { key: 'nrofsearches', label: 'Number of searches executed', hint: 'Should be 1.', ref: 'https://docs.coveo.com/en/305/javascript-search-framework/implementing-a-custom-component-in-javascript', expected: 1 },
          { key: 'searchSent', mandatory: true, label: 'Search Events Sent', hint: 'Should be true, proper use of our Search API', ref: 'https://developers.coveo.com/display/public/SearchREST/REST+Search+API+Home', expected: true },
          { key: 'analyticsSent', mandatory: true, label: 'Analytics Sent', hint: 'Should be true, proper use of Analytics and ML', ref: 'https://coveo.github.io/search-ui/components/analytics.html', expected: true },
          { key: 'usingVisitor', label: 'Using Visitor', hint: 'Should be true, proper use of Analytics and ML', ref: 'https://docs.coveo.com/en/18/cloud-v2-api-reference/usage-analytics-write-api#operation/get__v15_analytics_visit', expected: true },
          { key: 'visitorChanged', mandatory: true, label: 'Visitor changed during session', hint: 'Should be false, proper use of Analytics and ML', ref: 'https://docs.coveo.com/en/18/cloud-v2-api-reference/usage-analytics-write-api#operation/get__v15_analytics_visit', expected: false },
          { key: 'usingSearchAsYouType', label: 'Using search as you type', hint: 'Degrades performance, should be false', ref: 'https://onlinehelp.coveo.com/en/cloud/enabling_search_as_you_type_from_the_interface_editor.htm', expected: false },
          { key: 'initSuggestSent', mandatory: true, label: 'Searchbox, Using ML Powered Query Completions', hint: 'Should be true, full advantage of ML', ref: 'https://onlinehelp.coveo.com/en/cloud/enabling_coveo_machine_learning_query_suggestions_in_a_coveo_js_search_framework_search_box.htm', expected: true },
          { key: 'initTopQueriesSent', notForTotal: true, label: 'Searchbox, Using Analytics Query Completions', hint: 'Should be false. Use ML Powered Query Completions', ref: 'https://docs.coveo.com/en/340/javascript-search-framework/providing-query-suggestions', expected: false },
          { key: 'suggestSent', mandatory: true, label: 'Full Search Using ML Powered Query Completions', hint: 'Should be true, full advantage of ML', ref: 'https://onlinehelp.coveo.com/en/cloud/enabling_coveo_machine_learning_query_suggestions_in_a_coveo_js_search_framework_search_box.htm', expected: true },
          { key: 'topQueriesSent', notForTotal: true, label: 'Full Search Using Analytics Query Completions', hint: 'Should be false. Use ML Powered Query Completions', ref: 'https://docs.coveo.com/en/340/javascript-search-framework/providing-query-suggestions', expected: false },
          { key: 'usingQuickview', mandatory: true, label: 'Sending Quickview/Open Analytics event', hint: 'Should be true, proper use of Analytics and ML', ref: 'https://developers.coveo.com/x/_oX2AQ', expected: true },
          { key: 'usingCustomEvents', mandatory: true, label: 'Sending Custom Analytics events', hint: 'Make sure the dimensions are also properly set.', ref: 'https://docs.coveo.com/en/2726', expected: false },
          { key: 'customData', label: 'Custom Dimensions sent', hint: 'Make sure the dimensions are also properly set.', ref: 'https://docs.coveo.com/en/2726' },
          { key: 'baddimension', label: 'Dimensions', hint: 'Make sure the dimensions are also properly set.', ref: 'https://docs.coveo.com/en/2726', expected: '' },
        ]
      },
      {
        title: 'Implementation information', label: 'Implementation', attributes: [
          {
            key: 'querycheck', label: 'Queries needs attention', mandatory: true, hint: 'See Details', ref: 'https://docs.coveo.com/en/52', expected: false
          },
          {
            key: 'pageSize', label: 'Total page size (kB) (<3000)', hint: 'Bigger pages are loading slower, bad user experience', ref: 'https://docs.coveo.com/en/295/javascript-search-framework/lazy-versus-eager-component-loading#interacting-with-lazy-components', expected: {
              test: value => (value < 3000)
            }
          },
          {
            key: 'loadtime', label: 'Total load time (s) (<2)', hint: 'Longer loading, bad user experience', ref: 'https://docs.coveo.com/en/295/javascript-search-framework/lazy-versus-eager-component-loading#interacting-with-lazy-components', expected: {
              test: value => (value < 2)
            }
          },
          { key: 'usingState', label: 'Using state in code', hint: 'Retrieving state creates more complicated code logic', ref: 'https://docs.coveo.com/en/344/javascript-search-framework/state', expected: false },
          { key: 'usingPartialMatch', label: 'Using partial match', hint: 'Partial matching needs better tuning, match %, how many words to match', ref: 'https://support.coveo.com/s/article/1988?returnTo=RecentArticles', expected: false },
          { key: 'usingWildcards', label: 'Using wildcards', hint: 'Wildcards will slow down performance', ref: 'https://docs.coveo.com/en/1552', expected: false },
          { key: 'usingLQ', label: 'Using Long Queries (ML)', hint: 'Long Queries need ML capabilities, more tuning', ref: 'https://developers.coveo.com/display/public/SalesforceV2/Activating+Machine+Learning+Intelligent+Term+Detection+%28ITD%29+in+Salesforce', expected: false },
          { key: 'usingDQ', label: 'Using disjunction queries', hint: 'Disjunction (big OR query) could lead to false results, more tuning needed', ref: 'https://docs.coveo.com/en/190/glossary/disjunctive-query-expression', expected: false },
          { key: 'usingQRE', label: 'Using QRE in code', hint: 'QRE needs more finetuning to have better relevance', ref: 'https://developers.coveo.com/display/public/SearchREST/Standard+Query+Extensions', expected: false },
          { key: 'usingQREQuery', label: 'Using QRE in query', hint: 'QRE needs more finetuning to have better relevance', ref: 'https://developers.coveo.com/display/public/SearchREST/Standard+Query+Extensions', expected: false },
          { key: 'usingFilterField', label: 'Using Filter Field (Folding)', hint: 'Folding needs seperate result templates, more UI code', ref: 'https://docs.coveo.com/en/428/javascript-search-framework/folding-results', expected: false },
          { key: 'usingContext', label: 'Using Context', hint: 'Context needs more setup in Analytics/Pipelines and/or ML', ref: 'https://docs.coveo.com/en/399/javascript-search-framework/adding-custom-context-information-to-queries', expected: false },
          { key: 'usingPipeline', mandatory: true, label: 'Using Query Pipeline', hint: 'Dedicated Query Pipelines should be setup', ref: 'https://onlinehelp.coveo.com/en/cloud/query_pipeline_routing_mechanisms_and_rules.htm', expected: true },
          {
            key: 'pipelines', notForTotal: true, label: 'Used Query Pipelines (in code)', hint: 'Dedicated Query Pipelines should be setup', ref: 'https://onlinehelp.coveo.com/en/cloud/query_pipeline_routing_mechanisms_and_rules.htm', expected: {
              test: value => (value !== 'default' && value !== '')
            }
          },
          { key: 'usingTokens', label: 'Using Options.Tokens', hint: 'Hard coded tokens (except for public sites) should not be used', ref: 'https://docs.coveo.com/en/56/cloud-v2-developers/search-token-authentication', expected: false },
          { key: 'hardcodedAccessTokens', mandatory: true, label: 'Using accesToken', hint: 'Hard coded accessToken (except for public sites) should not be used', ref: 'https://docs.coveo.com/en/56/cloud-v2-developers/search-token-authentication', expected: false },
          { key: 'usingCustomEvents', label: 'Using Custom Events', hint: 'Overriding custom events creates more complicated code', ref: 'https://docs.coveo.com/en/417/javascript-search-framework/events', expected: false },
          { key: 'usingAdditionalSearch', label: 'Using Additional Search Events', hint: 'Additional search events could create multiple queries, which could influence performance', ref: 'https://docs.coveo.com/en/415/javascript-search-framework/triggers-and-lifecycle-traces', expected: 0 },
          { key: 'usingAdditionalAnalytics', label: 'Using Additional Analytic Events', hint: 'Addtional Analytic events is a must with custom behavior, if that is not the case it should not be needed', ref: 'https://docs.coveo.com/en/365/javascript-search-framework/sending-custom-analytics-events', expected: 0 },
          { key: 'onpremise', label: 'On-premise Installation', hint: 'On-premise installation, consider moving to the Cloud', ref: 'https://support.coveo.com/s/search/All/Home/%40uri#q=migrating%20to%20cloud&t=All&sort=relevancy', expected: false },
          /* { key: 'queryExecuted', notForTotal: true, additionalClass: 'mycode', label: 'Last Query', hint: '' },*/
          { key: 'searchToken', notForTotal: true, additionalClass: 'mycode', label: 'Search Token used', hint: '' },
          { key: 'analyticsToken', notForTotal: true, additionalClass: 'mycode', label: 'Analytics Token used', hint: '' },
        ]
      },
      {
        title: 'UI information', label: 'UI', attributes: [
          { key: 'usingFacets', mandatory: true, label: 'Using Facets', hint: 'Better user experience', ref: 'https://onlinehelp.coveo.com/en/cloud/understanding_facets.htm', expected: true },
          {
            key: 'nroffacets', label: 'Active Facets in UI (2-5)', hint: 'More Facets, slower queries, users get overwhelmed with information', ref: 'https://onlinehelp.coveo.com/en/cloud/understanding_facets.htm', expected: {
              test: value => (value >= 2 && value <= 5)
            }
          },
          { key: 'usingTabs', label: 'Using Tabs', hint: 'Better user experience', ref: 'https://developers.coveo.com/display/public/JsSearchV1/SearchInterface+Component', expected: true },
          {
            key: 'nrofsorts', label: 'No of Sorts (1-3)', hint: 'More sorts, slower performance, users can get confused', ref: 'https://coveo.github.io/search-ui/components/sort.html', expected: {
              test: value => (value >= 1 && value <= 3)
            }
          },
          { key: 'usingRecommendations', label: 'Using ML Recommendations', hint: 'Better user experience, give them what they do not know', ref: 'https://onlinehelp.coveo.com/en/cloud/coveo_machine_learning_recommendations_deployment_overview.htm', expected: true },
          {
            key: 'nrOfResultTemplates', label: 'No of Result Templates (2-5)', hint: 'More result templates, more complicated implementations', ref: 'https://onlinehelp.coveo.com/en/cloud/configuring_javascript_search_result_templates.htm', expected: {
              test: value => (value >= 2 && value <= 5)
            }
          },
          {
            key: 'underscoretemplates', label: 'No of Underscore Templates (<5)', hint: 'Try to use Result Templates as much as possible', ref: 'https://onlinehelp.coveo.com/en/cloud/configuring_javascript_search_result_templates.htm', expected: {
              test: value => (value < 5)
            }
          },
          {
            key: 'nrofraw', label: 'No raw field access in code', hint: 'More raw, more complicated implementations', ref: 'https://docs.coveo.com/en/420/javascript-search-framework/step-6---result-templates', expected: {
              test: value => (value < 5)
            }
          },
          { key: 'usingCulture', label: 'Cultures used', hint: 'Provide a UI in several cultures, better user experience', ref: 'https://docs.coveo.com/en/421/javascript-search-framework/changing-the-language-of-your-search-interface', expected: true },
          { key: 'cultures', notForTotal: true, label: 'Cultures', hint: 'Provide a UI in several cultures, better user experience', ref: 'https://docs.coveo.com/en/421/javascript-search-framework/changing-the-language-of-your-search-interface' },

        ]
      },
    ];

  // reset clipboard data
  CLIPBOARD_DATA_HTML = {};
  CLIPBOARD_DATA_PLAIN = {};
  CLIPBOARD_VALID_FIELDS = {};

  let sectionCharts = [];
  let html = [];
  sections.forEach(section => {
    let tests = { passed: 0, total: 0, mandatoryfail: false };

    html.push(processDetail(section, data, tests));
    CLIPBOARD_DATA_HTML[section.label] = renderClipboardHtml(section, data);
    CLIPBOARD_DATA_PLAIN[section.label] = renderClipboardPlain(section, data);
    let subtitle = '<BR><span style="color: #009830;">PASSED</span>';
    data['Score_' + section.label] = 'PASSED';
    if (tests.mandatoryfail) {
      data['Score_' + section.label] = 'FAILED';
      subtitle = '<BR><span style="color: #ce3f00;">FAILED</span>';
    }
    SendMessage({ type: 'saveScore', score: 'Score_' + section.label, value: data['Score_' + section.label] });
    if (section.notInMain === undefined) {
      sectionCharts.push({ title: section.label, subtitle: subtitle, value: tests.passed, max: tests.total });
    }
  });

  let scores = sectionCharts.map(createWheel);
  let maintitle = "Implementation Report";

  if (data.forOrgReport) {
    maintitle = "Organization Report<br>" + data.name;
  }
  document.getElementById('scores').innerHTML = '<h2>' + maintitle + '</h2>' + scores.join('\n');
  $('#legend').show();
  $('#download-global').show();

  if (data.errors != "" && data.errors !== undefined) {

    data.details += "<hr><h4 style='color: red;  font-size: 20px;'>Errors during processing:</h4>" + data.errors;
  }
  if (data.badquery != "") {

    data.details += "<hr><h4 style='color:red'>Queries which need attention:</h4>" + data.badquery + "";
  }
  if (data.details_facettolong != "") {

    data.details += "<hr><h4>Facet values which are too long:</h4>" + data.details_facettolong;
  }
  if (data.details_alwaysthesame != "") {

    data.details += "<hr><h4>Fields where the end of the content is the same:</h4>" + data.details_alwaysthesame;
  }
  if (data.details_pipelines != "") {

    data.details += "<hr><h4>Search - Query Pipelines which need attention:</h4>" + data.details_pipelines;
  }

  if (data.usagedetails != "" && data.usagedetails !== undefined) {
    data.details = data.usagedetails + "<br>" + data.details;
  }
  let details = `<ul id="Details" class="collapsible" data-collapsible="expandable">
  <li>
      <button type="button" class="collapsible-header active btn with-icon">
          <div class="msg">
            Details
          </div>
      </button>
      <div class="collapsible-body">
        <table><tbody><tr><td style='padding-left: 1px;max-width: 780px;word-break: break-word;'>
          ${data.details}
        </tbody></td></tr></table>
      </div>
  </li>
  </ul>`;
  document.getElementById('details').innerHTML = html.join('\n') + details;

  $('#details .collapsible').collapsible();
  $('#details .copy-section').click((e) => {
    e.preventDefault();
    let target = $(e.currentTarget)[0], parent = $(target).closest('ul')[0];
    copyToClipboard(parent.outerHTML, parent.id);
    $('#clipboard-copied').removeClass('mod-hidden');
    setTimeout(() => {
      $('#clipboard-copied').addClass('mod-hidden');
    }, 999);
    return true;
  });

  $('#loading').hide();
};

let processPerformanceReport = (data) => {
  myDownloadTitle = 'Performance Report';
  let sections = [
    {
      title: 'Very slow requests (>2s)', label: 'Very Slow'
    },
    {
      title: 'Slow requests (1s-2s)', label: 'Slow'
    },
    {
      title: 'Normal requests (100ms-1s)', label: 'Normal'
    },
    {
      title: 'Fast requests (<100ms)', label: 'Fast'
    },
  ];

  // reset clipboard data
  CLIPBOARD_DATA_HTML = {};
  CLIPBOARD_DATA_PLAIN = {};
  CLIPBOARD_VALID_FIELDS = {};

  let sectionCharts = [];
  let html = [];
  let smallerIsBetter = true;
  //Very slow
  let tests = { passed: 0, total: 0, mandatoryfail: false };
  tests.total = data.T2s + data.T12s + data.T2001s + data.T0200;
  tests.passed = data.T2s;
  html.push(processDetailPerformanceReport(sections[0], data.bad, tests, smallerIsBetter, data.total));
  CLIPBOARD_DATA_HTML[sections[0].label] = renderClipboardPerformanceHtml(sections[0], data.bad);
  sectionCharts.push({ title: sections[0].label, subtitle: '', value: tests.passed, max: tests.total, smallerIsBetter });

  //Slow
  tests.passed = data.T12s;
  html.push(processDetailPerformanceReport(sections[1], data.slow, tests, smallerIsBetter, data.total));
  CLIPBOARD_DATA_HTML[sections[1].label] = renderClipboardPerformanceHtml(sections[1], data.slow);
  sectionCharts.push({ title: sections[1].label, subtitle: '', value: tests.passed, max: tests.total, smallerIsBetter });
  //Normal
  smallerIsBetter = false;
  tests.passed = data.T2001s;
  html.push(processDetailPerformanceReport(sections[2], data.medium, tests, smallerIsBetter, data.total));
  CLIPBOARD_DATA_HTML[sections[2].label] = renderClipboardPerformanceHtml(sections[2], data.medium);
  sectionCharts.push({ title: sections[2].label, subtitle: '', value: tests.passed, max: tests.total, smallerIsBetter });
  //Fast
  smallerIsBetter = false;
  tests.passed = data.T0200;
  html.push(processDetailPerformanceReport(sections[3], data.fast, tests, smallerIsBetter, data.total));
  CLIPBOARD_DATA_HTML[sections[3].label] = renderClipboardPerformanceHtml(sections[3], data.fast);
  sectionCharts.push({ title: sections[3].label, subtitle: '', value: tests.passed, max: tests.total, smallerIsBetter });

  let scores = sectionCharts.map(createWheel);
  document.getElementById('scores').innerHTML = '<h2>Number of Requests</h2>' + scores.join('\n');
  //$('#legend').show();
  $('#download-global').show();
  let details = '';
  details += `<tr>
  <td class="line-type"  width="50%">Total Load time</td>
  <td class="line-duration" width="50%">${Math.round(data.total, 0)}</td></tr>`;
  for (var key in data.totalbytype) {
    details += `<tr>
    <td class="line-type"  width="50%">${key}</td>
    <td class="line-duration" width="50%">${Math.round(data.totalbytype[key], 0)}</td></tr>`;
  }
  let detail = `<ul id="Details" class="collapsible" data-collapsible="expandable">
  <li>
      <button type="button" class="collapsible-header active btn with-icon">
          <div class="msg">
            Details by type
          </div>
      </button>
      <div class="collapsible-body">
        <table><tbody><tr><th class="line-type">Type</th><th class="line-duration">Duration (ms)</th></tr>
          ${details}
        </tbody></table>
      </div>
  </li>
  </ul>`;
  document.getElementById('details').innerHTML = '<hr><h3><a href="' + data.location + '">' + data.location.substring(0, 90) + '...</a></h3>' + html.join('\n') + detail;


  $('#details .collapsible').collapsible();
  $('#details .copy-section').click((e) => {
    e.preventDefault();
    let target = $(e.currentTarget)[0], parent = $(target).closest('ul')[0];
    copyToClipboard(parent.outerHTML, parent.id);
    $('#clipboard-copied').removeClass('mod-hidden');
    setTimeout(() => {
      $('#clipboard-copied').addClass('mod-hidden');
    }, 999);
    return true;
  });

  $('#loading').hide();
};

let processState = (data) => {
  $('#loading').hide();
  if (!data) {
    return;
  }
  if (data.json) {
    $('#push').removeAttr('disabled');
    //$('#showSFDC').removeAttr('disabled');

    processReport(data.json);
  }
  if (data.json || data.image) {
    $('#instructions').hide();
  }

};

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


function getPerformanceReport() {
  $('#loading').show();
  $('#instructions').hide();
  $('#legend').hide();
  $('#myscreenimage').css('background-image', 'none').hide();
  document.getElementById('scores').innerHTML = '';
  document.getElementById('details').innerHTML = '';
  SendMessage('getPerformanceReport');
}


function executeCall(url, report, title, err, typeReq, auth, fd) {
  let typeOfReq = 'GET';
  if (typeReq) {
    typeOfReq = typeReq;
  }
  if (report.nrofrequests) {
    report.nrofrequests += 1;
  }
  else {
    report.nrofrequests = 1;
  }
  document.getElementById('loadSubTitle').innerHTML = 'Nr of requests executed: ' + report.nrofrequests;
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: url,
      type: typeOfReq,
      //data: JSON.stringify(fd),
      processData: false,
      //contentType: "application/json; charset=utf-8",
      //contentType: "application/x-www-form-urlencoded; charset='UTF-8'",
      contentType: false,
      dataType: 'json',
      beforeSend: setHeader,
      //error: errorMessage
      success: function (data) {
        resolve(data);
      },
      error: function (xhr, status, error) {
        report[err] = true;
        report.errors += "During: <b>" + title + "</b><BR>";
        //        report.errors += "Calling: "+url+"<BR>";
        report.errors += "Error: " + error + "<BR><hr>";
        resolve(undefined);
      },
    });
    function setHeader(xhr) {
      if (auth) {
        xhr.setRequestHeader('Authorization', auth);

      }
      else {
        if (report.token) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + report.token);
        }
      }
    };
  });

}


function executeQueryUICall(url, report, title, err, typeReq, auth, fd) {
  let typeOfReq = 'GET';
  if (typeReq) {
    typeOfReq = typeReq;
  }
  if (report.nrofrequests) {
    report.nrofrequests += 1;
  }
  else {
    report.nrofrequests = 1;
  }
  document.getElementById('loadSubTitle').innerHTML = 'Nr of requests executed: ' + report.nrofrequests;
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: url,
      type: typeOfReq,
      data: JSON.stringify(fd),
      //processData: false,
      contentType: "application/json; charset=utf-8",
      //contentType: "application/x-www-form-urlencoded; charset='UTF-8'",
      //contentType: false,
      dataType: 'json',
      beforeSend: setHeader,
      //error: errorMessage
      success: function (data) {
        resolve(data);
      },
      error: function (xhr, status, error) {
        report[err] = true;
        report.errors += "During: <b>" + title + "</b><BR>";
        //        report.errors += "Calling: "+url+"<BR>";
        report.errors += "Error: " + error + "<BR><hr>";
        let data = {};
        data.basicExpression = fd.q;
        data.constantExpression = fd.cq;
        data.advancedExpression = fd.aq;
        data.disjunctionExpression = fd.dq;
        data.rankingExpressions = [];
        resolve(data);
      },
    });
    function setHeader(xhr) {

      if (auth) {
        xhr.setRequestHeader('Authorization', auth);

      }
      else {
        if (report.token) {
          xhr.setRequestHeader('Authorization', 'Bearer ' + report.token);
        }
      }
    };
  });

}

function executeLogBrowserCall(url, source, report) {
  report.nrofrequests += 1;
  document.getElementById('loadSubTitle').innerHTML = 'Nr of requests executed: ' + report.nrofrequests;
  return new Promise(function (resolve, reject) {
    $.ajax({
      url: url,
      type: 'POST',
      dataType: 'json',
      data: source,
      beforeSend: setHeader,
      success: function (data) {
        resolve(data);
      },
      error: function (xhr, status, error) {
        report.thereAreErrors = true;
        report.errors += "During: <b>Getting Log Browser Info</b><BR>";
        report.errors += "Error: " + error + "<BR><hr>";
        resolve(undefined);
      },
    });
    function setHeader(xhr) {
      xhr.setRequestHeader('Authorization', '' + report.token);
      xhr.setRequestHeader('Content-Type', 'application/json');
    };
  });
}

function getPlatformUrl(report, url) {
  if (report.version == "V1") {
    url = url.replace('cloud.', 'cloudplatform.').replace('/organizations', '/workgroups');
  }
  return url;
}

function getSourceInfo(report) {
  let url = getPlatformUrl(report, report.location + '/rest/organizations/' + report.org + '/sources');
  let sources = 0;
  let disabled = 0;
  let promise = new Promise((resolve) => {
    executeCall(url, report, "Getting Source Info", "thereAreErrorsSources").then(function (data) {
      try {
        if (data) {
          report.docsfromsources = 0;
          if (report.version == "V2") {
            report.nrofsources = data.length;
            let sourceTypes = data.map(source => source.sourceType);
            report.types = [...new Set(sourceTypes)].sort(caseInsensitiveSort);
            report.pushnames = data.filter(source => { if (source.pushEnabled || source.sourceType == 'SITECORE') return source.name; });
            report.containsonprem = data.filter(source => { if (source.onPremisesEnabled) return source.name; }).length > 0;
            report.containspush = data.filter(source => { if (source.pushEnabled) return source.name; }).length > 0;
            report.details += "<hr><h4>Source Information:</h4>";
            report.details += "<table><tr><th><b>Source</b></th><th style='text-align:right'><b>Nr of Docs</b></th></tr>"
            data.map(source => {
              //Check for Websources
              if (source.sourceType == "WEB2" && source.information.numberOfDocuments > 100000) {
                report.sourceWebWarning = true;
              }
              report.docsfromsources += source.information.numberOfDocuments;
              report.details += "<tr><td>" + source.name + "</td><td style='text-align:right'>" + source.information.numberOfDocuments.toLocaleString() + "</td></tr>";
            });
            report.details += "</table>"
            report.sourceids = data.map(source => { let obj = { id: source.id, name: source.name }; return obj; });
          }
          else {
            report.nrofsources = data.sources.length;
            let sourceTypes = data.sources.map(source => source.type);
            report.types = [...new Set(sourceTypes)].sort(caseInsensitiveSort);
            report.pushnames = [];
            report.containsonprem = false;
            report.containspush = false;
            report.details += "<hr><h4>Source Information:</h4>";
            report.details += "<table><tr><th><b>Source</b></th><th style='text-align:right'><b>Nr of Docs</b></th></tr>"
            data.sources.map(source => {
              report.docsfromsources += source.numberOfDocuments;
              report.details += "<tr><td>" + source.name + "</td><td style='text-align:right'>" + source.numberOfDocuments.toLocaleString() + "</td></tr>";
            });
            report.details += "</table>"
            report.sourceids = data.sources.map(source => { let obj = { id: source.id, name: source.name }; return obj; });

          }
          report.docsfromsources = (report.docsfromsources / 1000000).toFixed(2);
        }
      }
      catch{
      }

      resolve(report);
    });
  });
  return promise;
}

function getOrgInfo(report) {
  let url = getPlatformUrl(report, report.location + '/rest/organizations/' + report.org);
  let promise = new Promise((resolve) => {
    executeCall(url, report, "Getting Organization Info", "thereAreErrorsOrg").then(function (data) {
      if (data) {
        try {
          report.name = data.displayName;
          if (report.version == "V2") {
            report.orgtype = data.type;
          }
        }
        catch{

        }
      }
      resolve(report);
    });
  });
  return promise;
}

function getNodeInfo(report) {
  let url = getPlatformUrl(report, report.location + '/rest/organizations/' + report.org + '/indexes');
  let promise = new Promise((resolve) => {
    if (report.version == "V2") {
      executeCall(url, report, "Getting Organization Info", "thereAreErrorsOrg").then(function (data) {
        if (data) {
          try {
            report.infra_machine = data[0].machineSpec.architecture;
            report.infra_storage = data[0].machineSpec.storageSpec.storageType;
            report.infra_storage_size = data[0].machineSpec.storageSpec.sizeInGigabytes;
            report.infra_slices = data[0].status.stats.numberOfSlices;
            report.infra_indexes = data.length;
            report.infra_mem_free = Math.round(100 - (data[0].status.stats.totalMemoryUsed / (data[0].status.stats.totalPhysicalMemory / 100)));
            report.infra_disk_free = Math.round(100 - (data[0].status.stats.diskSpaceUsed / ((data[0].status.stats.diskSpaceUsed + data[0].status.stats.remainingDiskSpace) / 100)));
          }
          catch{

          }
        }
        resolve(report);
      });
    }
    else {
      resolve(report);
    }
  });
  return promise;
}


function getSecurityInfo(report) {
  let url = getPlatformUrl(report, report.location + '/rest/organizations/' + report.org + '/securityproviders');
  let requests = [];
  let promise = new Promise((resolve) => {
    if (report.version == "V2") {
      executeCall(url, report, "Getting Security Providers Info", "thereAreErrorsSources").then(function (data) {
        if (data && data.map) {
          try {
            report.securityerrors = data.filter(sec => { if (sec.statistics.numberOfEntitiesInError > 0) return sec.name; }).length;
            data.map(sec => { report.numberofsecurities += sec.statistics.totalNumberOfEntities; });
            if (report.securityerrors > 0) {
              report.details += "<hr><h4>Security Identity Providers with errors:</h4>";
              data.filter(sec => { if (sec.statistics.numberOfEntitiesInError > 0) return sec.name; }).map((sec) => {
                report.details += sec.name + ": <b>" + sec.statistics.numberOfEntitiesInError + "</b> errors<BR>";
              });
            }
            requests = data.map((sec) => {
              if (sec.type == 'EMAIL' || sec.type == 'EXPANDED') {

              } else {
                return new Promise((resolve) => {
                  getSecProvSchedules(report, sec.id).then(function (datas) {
                    if (!datas) {
                      report.noscheduledsecprov.push(sec.name);
                    } else {
                      if (data.map) {
                        let enabled = false;
                        data.map((sec) => {
                          if (sec.enabled) enabled = true;
                        });
                        if (!enabled) {
                          report.noscheduledsecprov.push(sec.name);
                        }
                      }
                    }
                    resolve();
                  });
                });
              }
            });


          }
          catch{

          }
        }
        //Execute the requests
        Promise.all(requests).then(() => {
          resolve(report);
        });
      });
    }
    else {
      resolve(report);
    }
  });
  return promise;
}


function getDimensionsInfo(report) {
  let url = getPlatformUrl(report, report.location + '/rest/ua/v15/dimensions/custom?includeOnlyParents=true&org=' + report.org);
  if (report.version == "V1") {
    url = 'https://usageanalytics.coveo.com/rest/v15/dimensions/custom?includeOnlyParents=true&org=' + report.org;
  }
  let promise = new Promise((resolve) => {
    executeCall(url, report, "Getting Dimensions Info", "thereAreErrorsSearch").then(function (data) {
      if (data && data.map) {
        report.dimensions = data.filter(dim => { if (dim.returnName != 'c_facettitle' && dim.returnName != 'c_facetvalue') return dim.returnName; }).map(dim => dim.returnName).sort(caseInsensitiveSort);
      }
      resolve(report);
    });
  });
  return promise;
}


function getExtensionInfo(report) {
  let url = getPlatformUrl(report, report.location + '/rest/organizations/' + report.org + '/extensions');
  let promise = new Promise((resolve) => {
    if (report.version == "V2") {
      executeCall(url, report, "Getting Extensions Info", "thereAreErrorsExtensions").then(function (data) {
        if (data && data.map) {
          report.nrofextensions = data.length;
          report.disabledextensions = data.filter(source => { if (!source.enabled) return source.name; }).map(source => source.name).sort(caseInsensitiveSort);
          report.nrofdisabledextensions = report.disabledextensions.length;
          report.nrslowextensions = data.filter(source => { if (source.status.dailyStatistics.averageDurationInSeconds > 1) return source.name; }).length;
          report.nrerrorextensions = data.filter(source => { if (source.status.dailyStatistics.numberOfErrors > 0) return source.name; }).length;
          report.nrtimeoutextensions = data.filter(source => { if (source.status.dailyStatistics.numberOfTimeouts > 5) return source.name; }).length;
          report.slowextensions = data.filter(source => { if (source.status.dailyStatistics.averageDurationInSeconds > 1) return source.name; }).map(source => source.name).sort(caseInsensitiveSort);
          report.timeoutextensions = data.filter(source => { if (source.status.dailyStatistics.numberOfTimeouts > 5) return source.name; }).map(source => source.name).sort(caseInsensitiveSort);
          report.errorextensions = data.filter(source => { if (source.status.dailyStatistics.numberOfErrors > 0) return source.name; }).map(source => source.name).sort(caseInsensitiveSort);
          if (data.filter(source => { if (source.status.dailyStatistics.averageDurationInSeconds > 0) return source.name; }).length > 0) {
            report.details += "<hr><h4>Average execution time Extensions:</h4>";
            data.filter(source => { if (source.status.dailyStatistics.averageDurationInSeconds > 0) return source.name; }).map((source) => {
              report.details += source.name + ": <b>" + source.status.dailyStatistics.averageDurationInSeconds.toFixed(2) + "</b> seconds<BR>";
            });
          }
        }
        resolve(report);
      });
    }
    else {
      resolve(report);
    }
  });
  return promise;
}

function getTopQueriesInfo(report) {
  let url = getPlatformUrl(report, report.location + '/rest/ua/v15/stats/topQueries?pageSize=25&org=' + report.org);
  let promise = new Promise((resolve) => {
    executeCall(url, report, "Getting Analytics Top Queries Info", "thereAreErrorsSearch").then(function (data) {
      if (data && data.map) {
        report.topQueries = data;
      }
      resolve(report);
    });
  });
  return promise;
}

function getUsageInfo(report) {
  var now = new Date();
  var from = new Date();
  from = from.setDate(now.getDate() - 30);
  var fromlast = new Date(from);
  var to = new Date();
  var header = "<tr><th><b>Origin 1 (Hub)</b></th><th><b>Origin 2 (Tab)</b></th>"
  header += "<th style='text-align:right'><b>Uniq Visits</b></th>"
  header += "<th style='text-align:right'><b>Avg Response</b></th>"
  //report.details += "<th style='text-align:right'><b>Q with Click</b></th>"
  header += "<th style='text-align:right'><b>Click through</b></th>"
  header += "<th style='text-align:right'><b>Avg Click Rank</b></th>"
  header += "<th style='text-align:right'><b>Session<br>Avg Nr Queries</b></th>"
  header += "<th style='text-align:right'><b>Session<br>Avg Nr Query Change</b></th>"
  header += "<th style='text-align:right'><b>Session<br>Avg Nr Clicks</b></th>"
  header += "<th style='text-align:right'><b>Session<br>% Content Gap</b></th>"
  //  header += "<th style='text-align:right'><b>Session<br>Info</b></th>"
  header += "</tr>"

  let froms = '&from=' + fromlast.toISOString() + '&to=' + to.toISOString();
  //let url = getPlatformUrl(report, report.location + '/rest/ua/v15/stats/combinedData?n=500&m=AverageClickRank&m=SearchWithClick&m=average%28actionresponsetime%29&m=ClickThroughRatio&m=UniqueVisit&d=originLevel1&d=originLevel2&f=%28searchcausev2+IN+%5B%22searchboxSubmit%22%2C%22searchFromLink%22%5D%29&fm=&p=1&s=UniqueVisit&asc=true&includeMetadata=true&bindOnLastSearch=true&org=' + report.org + froms);
  let url = getPlatformUrl(report, report.location + '/rest/ua/v15/stats/combinedData?n=500&m=AverageClickRank&m=SearchWithClick&m=average%28actionresponsetime%29&m=ClickThroughRatio&m=UniqueVisit&d=originLevel1&d=originLevel2&fm=&p=1&s=UniqueVisit&asc=true&includeMetadata=true&bindOnLastSearch=true&org=' + report.org + froms);
  let promise = new Promise((resolve) => {
    executeCall(url, report, "Getting Analytics Usage Info", "thereAreErrorsSearch").then(function (data) {
      if (data) {
        let counterC = 0;
        let counterCL = 0;
        let counterQ = 0;
        let counterP = 0;
        let total = 0;
        //First get summary of the searchCauses
        //  FacetSelection (facetSelect,facetDeselect, facetExclude)
        //  InterfaceChange (interfaceChange)
        //  Sort (resultsSort)
        //  Querysuggestions (omniboxAnalytics, omniboxFromLink)
        //  FieldQuerySuggestions (omniboxField)
        //  Opening (documentOpen,documentQuickview)
        //  Recommendation (recommendationOpen)
        //For each combination get Detailed info
        let responseQDetails = data['combinations'].map(source => {
          let deturl = getPlatformUrl(report, report.location + '/rest/ua/v15/stats/combinedData?n=2000&m=UniqueVisit&d=searchCauseV2&f=%28originlevel1%3D%3D%27' + source.originLevel1 + '%27%29+AND+%28originlevel2%3D%3D%27' + source.originLevel2 + '%27%29&fm=&p=1&s=UniqueVisit&asc=false&includeMetadata=true&bindOnLastSearch=false&org=' + report.org + froms);
          return new Promise((resolve) => {
            executeCall(deturl, report, "Getting Analytics Usage Info", "thereAreErrorsSearch").then(function (datar) {
              data['combinations'][counterQ].ControlSearch = 0;
              data['combinations'][counterQ].ControlFacet = 0;
              data['combinations'][counterQ].ControlInterface = 0;
              data['combinations'][counterQ].ControlSort = 0;
              data['combinations'][counterQ].ControlQuerySuggest = 0;
              data['combinations'][counterQ].ControlFieldQS = 0;
              if (datar) {
                datar['combinations'].map(sourcedet => {
                  if (sourcedet.searchCauseV2 == 'facetSelect' || sourcedet.searchCauseV2 == 'facetDeSelect' || sourcedet.searchCauseV2 == 'facetExclude') {
                    data['combinations'][counterQ].ControlFacet += sourcedet.UniqueVisit;
                  }
                  if (sourcedet.searchCauseV2 == 'interfaceChange') {
                    data['combinations'][counterQ].ControlInterface += sourcedet.UniqueVisit;
                  }
                  if (sourcedet.searchCauseV2 == 'resultsSort') {
                    data['combinations'][counterQ].ControlSort += sourcedet.UniqueVisit;
                  }
                  if (sourcedet.searchCauseV2 == 'omniboxAnalytics' || sourcedet.searchCauseV2 == 'omniboxFromLink') {
                    data['combinations'][counterQ].ControlQuerySuggest += sourcedet.UniqueVisit;
                  }
                  if (sourcedet.searchCauseV2 == 'searchboxSubmit' || sourcedet.searchCauseV2 == 'searchFromLink') {
                    data['combinations'][counterQ].ControlSearch += sourcedet.UniqueVisit;
                  }
                  if (sourcedet.searchCauseV2 == 'omniboxField') {
                    data['combinations'][counterQ].ControlFieldQS += sourcedet.UniqueVisit;
                  }
                });
              }
              counterQ = counterQ + 1;
              resolve();
            });
          });
        });
        let responseQCDetails = data['combinations'].map(source => {
          let deturlc = getPlatformUrl(report, report.location + '/rest/ua/v15/stats/combinedData?n=2000&m=UniqueVisit&d=clickCauseV2&f=%28originlevel1%3D%3D%27' + source.originLevel1 + '%27%29+AND+%28originlevel2%3D%3D%27' + source.originLevel2 + '%27%29&fm=&p=1&s=UniqueVisit&asc=false&includeMetadata=true&bindOnLastSearch=false&org=' + report.org + froms);
          return new Promise((resolve) => {
            executeCall(deturlc, report, "Getting Analytics Usage Info", "thereAreErrorsSearch").then(function (datar) {
              data['combinations'][counterCL].ControlOpening = 0;
              data['combinations'][counterCL].ControlRecommend = 0;
              if (datar) {
                datar['combinations'].map(sourcedet => {
                  if (sourcedet.clickCauseV2 == 'documentOpen' || sourcedet.clickCauseV2 == 'documentQuickview') {
                    data['combinations'][counterCL].ControlOpening += sourcedet.UniqueVisit;
                  }
                  if (sourcedet.clickCauseV2 == 'recommendationOpen') {
                    data['combinations'][counterCL].ControlRecommend += sourcedet.UniqueVisit;
                  }
                });
              }
              counterCL = counterCL + 1;
              resolve();
            });
          });
        });
        //Paging requires a different query
        //  Paging (EventValue: pagerNext,pagerPrevious, pagerScrolling )
        let responsePDetails = data['combinations'].map(source => {
          let deturl = getPlatformUrl(report, report.location + '/rest/ua/v15/stats/combinedData?n=1000&m=UniqueVisit&d=customEventValue&s=UniqueVisit&asc=false&includeMetadata=true&bindOnLastSearch=false&f=%28customeventtype%3D%3D%27getMoreResults%27%29+AND+%28originlevel1%3D%3D%27' + source.originLevel1 + '%27%29+AND+%28originlevel2%3D%3D%27' + source.originLevel2 + '%27%29&fm=&p=1&org=' + report.org + froms);
          return new Promise((resolve) => {
            executeCall(deturl, report, "Getting Analytics Usage Info", "thereAreErrorsSearch").then(function (datar) {
              data['combinations'][counterP].ControlPaging = 0;
              if (datar) {
                datar['combinations'].map(sourcedet => {
                  data['combinations'][counterP].ControlPaging += sourcedet.UniqueVisit;
                });
              }
              counterP = counterP + 1;
              resolve();
            });
          });
        });

        let responseC = data['combinations'].map(source => {
          total += source.UniqueVisit;
          let deturl = getPlatformUrl(report, report.location + '/rest/ua/v15/stats/combinedData?n=1000&m=DocumentView&m=countDistinct%28queryexpression%29&m=ManualQuery&d=sessionGuid&d=hasResult&f=%28searchcausev2+IN+%5B%22searchboxSubmit%22%2C%22searchFromLink%22%5D%29+AND+%28queryexpression%21%3D%27%27%29+AND+%28originlevel1%3D%3D%27' + source.originLevel1 + '%27%29+AND+%28originlevel2%3D%3D%27' + source.originLevel2 + '%27%29&fm=&p=1&s=ManualQuery&asc=false&includeMetadata=true&bindOnLastSearch=false&org=' + report.org + froms);
          return new Promise((resolve) => {
            executeCall(deturl, report, "Getting Analytics Usage Info", "thereAreErrorsSearch").then(function (datar) {
              let manQ = 0;
              let noRes = 0;
              let clicks = 0;
              let uniqQ = 0;
              let totalR = 0;
              let totalNoRes = 0;
              if (datar) {
                datar['combinations'].map(sourcedet => {
                  //Discard weird high ManualQueries (higher than 25)
                  if (sourcedet['ManualQuery'] < 25) {
                    manQ += sourcedet['ManualQuery'];
                    if (sourcedet['hasResult'] == false) {
                      totalNoRes += 1;
                      noRes += sourcedet['ManualQuery'];
                    }
                    else {
                      clicks += sourcedet['DocumentView'];
                      uniqQ += sourcedet['countDistinct(queryexpression)'];
                      totalR += 1;
                    }
                  }
                });
                if (totalR == 0) {
                  data['combinations'][counterC].AvgNoQ = 0;
                  data['combinations'][counterC].AvgNoQChange = 0;
                  data['combinations'][counterC].AvgNoClicks = 0;
                  data['combinations'][counterC].NoQ = 0;
                  data['combinations'][counterC].NoQChange = 0;
                  data['combinations'][counterC].NoClicks = 0;
                  data['combinations'][counterC].No = 0;
                  data['combinations'][counterC].NoRes = 0;
                  data['combinations'][counterC].NoResTotal = 0;
                }
                else {
                  //Update source
                  data['combinations'][counterC].AvgNoQ = manQ / totalR;
                  data['combinations'][counterC].AvgNoQChange = manQ / uniqQ;
                  data['combinations'][counterC].AvgNoClicks = clicks / totalR;
                  data['combinations'][counterC].NoQ = manQ;
                  data['combinations'][counterC].NoQChange = uniqQ;
                  data['combinations'][counterC].NoClicks = clicks;
                  data['combinations'][counterC].No = totalR;
                  data['combinations'][counterC].NoRes = noRes;
                  data['combinations'][counterC].NoResTotal = totalNoRes;
                }
                counterC = counterC + 1;
                resolve();
              }
            });
          });
        });
        responseC = responseC.concat(responsePDetails).concat(responseQDetails).concat(responseQCDetails);
        executeSequentially(responseC).then(() => {
          //Now we need to execute for each originLevel1/originLevel2 combination the Session query
          report.usagedetails += "<hr><h4>Search Usage Information last 30 days:</h4>";
          report.usagedetails += "(Session info based upon ca. last 1000 visits)<br>";
          report.usagedetails += "<div style='overflow:auto;margin:-1px;'>";
          report.usagedetails += "<table style='width: 1400px !important;'>";
          report.usagedetails += header;
          let rowcounter = 0;
          let extraheaders = data['combinations'].length / 5;
          let extraheader = (data['combinations'].length / extraheaders) + 1;
          data['combinations'].map(source => {
            if (rowcounter > extraheader) {
              report.usagedetails += header;
              rowcounter = 0;
            }
            rowcounter += 1;
            let maincolor = 'green';
            if (source.UniqueVisit < 100) {
              report.badUsage.push(source.originLevel1 + "/" + source.originLevel2 + " (" + source.UniqueVisit.toLocaleString() + ")");
              maincolor = 'red';
            }
            source.ClickThroughRatio = source.ClickThroughRatio * 100;
            if (source.ClickThroughRatio < 50) {
              report.badClick.push(source.originLevel1 + "/" + source.originLevel2 + " (" + source.ClickThroughRatio.toFixed(0) + "%)");
              maincolor = 'red';
            }
            if (source.AverageClickRank > 3) {
              report.badRank.push(source.originLevel1 + "/" + source.originLevel2 + " (" + source.AverageClickRank.toFixed(1) + ")");
              maincolor = 'red';
            }
            report.usagedetails += "<tr><td style='color:" + maincolor + ";'>" + source.originLevel1 + "</td><td>" + source.originLevel2 + "</td>";
            let color = 'green';
            if (source.UniqueVisit < 100) {
              color = 'red';
            }
            let perc = (source.UniqueVisit / total) * 100;//(5/10)*100;
            report.usagedetails += "<td style='color:" + color + ";text-align:right'>" + source.UniqueVisit.toLocaleString() + " (" + perc.toFixed(0) + "%)</td>";
            color = 'green';
            if (source['average(actionresponsetime)'] < 500) {
              color = 'red';
            }
            report.usagedetails += "<td style='color:" + color + ";text-align:right'>" + source['average(actionresponsetime)'] + "ms</td>";
            //report.details += "<td style='text-align:right'>" + source.SearchWithClick.toLocaleString() + "</td>";
            color = 'green';
            if (source.ClickThroughRatio < 50) {
              color = 'red';
            }
            report.usagedetails += "<td style='color:" + color + ";text-align:right'>" + source.ClickThroughRatio.toFixed(0) + "%</td>";
            color = 'green';
            if (source.AverageClickRank > 3) {
              color = 'red';
            }
            report.usagedetails += "<td style='color:" + color + ";text-align:right'>" + source.AverageClickRank.toFixed(1) + "</td>";
            color = 'green';
            if (source.AvgNoQ > 2) {
              color = 'red';
            }
            report.usagedetails += "<td style='color:" + color + ";text-align:right'>" + source.AvgNoQ.toFixed(1) + "</td>";
            color = 'green';
            if (source.AvgNoQChange > 2) {
              color = 'red';
            }
            report.usagedetails += "<td style='color:" + color + ";text-align:right'>" + source.AvgNoQChange.toFixed(1) + "</td>";
            color = 'green';
            if (source.AvgNoClicks > 3) {
              color = 'red';
            }
            report.usagedetails += "<td style='color:" + color + ";text-align:right'>" + source.AvgNoClicks.toFixed(1) + "</td>";
            perc = (source.NoResTotal / (source.No + source.NoResTotal)) * 100;
            if (isNaN(perc)) {
              perc = 0;
            }
            color = 'green';
            if (perc > 25) {
              color = 'red';
            }
            report.usagedetails += "<td style='color:" + color + ";text-align:right'>" + perc.toFixed(0) + "%</td>";
            report.usagedetails += "</tr><tr><td></td><td></td>";
            report.usagedetails += "<td colspan=4 style='vertical-align:top;text-align:left;word-break:normal'>" + "<b>Summary Behavior:</b><br>(Based upon visits)<br>";
            report.usagedetails += "<table padding=2><tr><td style='text-align:right'>" + "Total Visits:</td><td style='text-align:right'>" + source.UniqueVisit.toFixed(0) + "</td><td></td></tr>";
            perc = (source.ControlSearch / (source.UniqueVisit)) * 100;
            report.usagedetails += "<tr><td style='text-align:right'>" + "Executing Search:</td><td style='text-align:right'>" + source.ControlSearch.toFixed(0) + "</td><td style='text-align:left'>(" + perc.toFixed(0) + "%)</td></tr>";
            perc = (source.ControlFacet / (source.UniqueVisit)) * 100;
            report.usagedetails += "<tr><td style='text-align:right'>" + "Using Facets:</td><td style='text-align:right'>" + source.ControlFacet.toFixed(0) + "</td><td style='text-align:left'>(" + perc.toFixed(0) + "%)</td></tr>";
            perc = (source.ControlInterface / (source.UniqueVisit)) * 100;
            report.usagedetails += "<tr><td style='text-align:right'>" + "Using Different Interfaces:</td><td style='text-align:right'>" + source.ControlInterface.toFixed(0) + "</td><td style='text-align:left'>(" + perc.toFixed(0) + "%)</td></tr>";
            perc = (source.ControlQuerySuggest / (source.UniqueVisit)) * 100;
            report.usagedetails += "<tr><td style='text-align:right'>" + "Using Query Suggestions:</td><td style='text-align:right'>" + source.ControlQuerySuggest.toFixed(0) + "</td><td style='text-align:left'>(" + perc.toFixed(0) + "%)</td></tr>";
            perc = (source.ControlFacet / (source.UniqueVisit)) * 100;
            report.usagedetails += "<tr><td style='text-align:right'>" + "Using Field Query Suggestions:</td><td style='text-align:right'>" + source.ControlFieldQS.toFixed(0) + "</td><td style='text-align:left'>(" + perc.toFixed(0) + "%)</td></tr>";
            perc = (source.ControlSort / (source.UniqueVisit)) * 100;
            report.usagedetails += "<tr><td style='text-align:right'>" + "Using Sorting:</td><td style='text-align:right'>" + source.ControlSort.toFixed(0) + "</td><td style='text-align:left'>(" + perc.toFixed(0) + "%)</td></tr>";
            perc = (source.ControlPaging / (source.UniqueVisit)) * 100;
            report.usagedetails += "<tr><td style='text-align:right'>" + "Using Paging:</td><td style='text-align:right'>" + source.ControlPaging.toFixed(0) + "</td><td style='text-align:left'>(" + perc.toFixed(0) + "%)</td></tr>";
            perc = (source.ControlOpening / (source.UniqueVisit)) * 100;
            report.usagedetails += "<tr><td style='text-align:right'>" + "Opening Documents:</td><td style='text-align:right'>" + source.ControlOpening.toFixed(0) + "</td><td style='text-align:left'>(" + perc.toFixed(0) + "%)</td></tr>";
            perc = (source.ControlRecommend / (source.UniqueVisit)) * 100;
            report.usagedetails += "<tr><td style='text-align:right'>" + "Opening Recommendations:</td><td style='text-align:right'>" + source.ControlRecommend.toFixed(0) + "</td><td style='text-align:left'>(" + perc.toFixed(0) + "%)</td></tr>";
            report.usagedetails += "</table></td><td colspan=1></td>";
            report.usagedetails += "<td colspan=2 style='vertical-align:top;text-align:left;word-break:normal'>" + "<b>Summary:</b><br>(For above Session calculation)<br>";
            report.usagedetails += "<table padding=2><tr><td style='text-align:right'>Tot Queries:</td><td style='text-align:right'>" + source.NoQ.toFixed(0) + "</td></tr>";
            report.usagedetails += "<tr><td style='text-align:right'>" + "Tot Unique:</td><td style='text-align:right'>" + source.NoQChange.toFixed(0) + "</td></tr>";
            report.usagedetails += "<tr><td style='text-align:right'>" + "Tot Clicks:</td><td style='text-align:right'>" + source.NoClicks.toFixed(0) + "</td></tr>";
            report.usagedetails += "<tr><td style='text-align:right'>" + "Tot Zero Results:</td><td style='text-align:right'>" + source.NoResTotal.toFixed(0) + "</td></tr>";
            report.usagedetails += "<tr><td style='text-align:right'>" + "Tot Checks:</td><td style='text-align:right'>" + source.No.toFixed(0) + "</td></tr>";
            report.usagedetails += "</tr></table></td><td colspan=1></td>";
            report.usagedetails += "</tr>";
          });
          report.usagedetails += "</table>"
          report.usagedetails += "</div>";
          resolve(report);
        });
      }
      else {
        resolve();
      }
    });
  });
  return promise;
}

function getAnalyticsMetricsInfo(report) {
  var now = new Date();
  var from = new Date();
  from = from.setDate(now.getDate() - 7);
  var fromlast = new Date(from);
  var to = new Date();

  let froms = '&from=' + fromlast.toISOString() + '&to=' + to.toISOString();
  let url = getPlatformUrl(report, report.location + '/rest/ua/v15/stats/globalData?m=PerformSearch&m=RefinementQuery&m=average%28actionresponsetime%29&m=UniqueVisitorById&m=UniqueVisit&m=DocumentView&m=AverageClickRank&m=ClickThroughRatio&m=SearchWithClick&tz=Z&i=DAY&bindOnLastSearch=false&org=' + report.org + froms);
  let promise = new Promise((resolve) => {
    executeCall(url, report, "Getting Analtyics Metrics Info", "thereAreErrorsSearch").then(function (data) {
      if (data) {
        report.UniqueVisit = data.globalDatas.UniqueVisit.value;
        report.PerformSearch = data.globalDatas.PerformSearch.total;
        report.SearchWithClick = data.globalDatas.SearchWithClick.total;
        report.ClickThroughRatio = (data.globalDatas.ClickThroughRatio.value * 100).toFixed(2);
        report.AverageClickRank = (data.globalDatas.AverageClickRank.value).toFixed(2);
        report.RefinementQuery = data.globalDatas.RefinementQuery.total;
        report.DocumentView = data.globalDatas.DocumentView.total;
        report.AvgResponse = data.globalDatas['average(actionresponsetime)'].value;
        if (report.PerformSearch > 0 && report.DocumentView > 0) {
          report.det_analyticsSent = true;
        }
      }
      resolve(report);
    });
  });
  return promise;
}

function getAnalyticsMetricsDetails(report) {
  https://platform0.cloud.coveo.com/rest/ua/v15/stats/visitsMetrics?org=coveointernaltesting1&from=2019-07-07T00%3A00%3A00.000%2B0200&to=2019-07-22T13%3A47%3A00.000%2B0200&m=UniqueVisit&f=%28origincontext%3D%3D%27CaseCreation%27%29&tz=Europe%2FAmsterdam&queryId=MTU2Mzc5NjA2M0Y2RDFE
  var now = new Date();
  var from = new Date();
  from = from.setDate(now.getDate() - 7);
  var fromlast = new Date(from);
  var to = new Date();
  var dateusage = new Date();
  dateusage.setMonth(dateusage.getMonth() - 1);
  var dateformetrics = dateusage.getFullYear() + '-' + (dateusage.getMonth() + 1);
  let url1 = getPlatformUrl(report, report.location + '/rest/organizations/' + report.org + '/searchusagemetrics/raw/monthly?month=' + dateformetrics + '&minimumQueries=10');
  let emptyHubsR = new Promise((resolve) => {
    executeCall(url1, report, "Getting Analtyics Metrics Info", "thereAreErrorsSearch", "GET").then(function (data) {
      /*if (debug) {
        console.log(url1);
        console.log('EmptyHubs' + ' :' + report.org);
        console.log(data);
      }*/
      if (data) {
        let totalQ = 0;
        let emptyQ = 0;
        data.searchHubs.map(hub => {
          if (hub.searchHub == "") {
            emptyQ = hub.normalQueries;
            totalQ += hub.normalQueries;
          } else {
            totalQ += hub.normalQueries;
          }
        });
        report.details += "<hr>Usage Metrics info:<br>";
        //EmptyHubs if emptyQ is 10% or higher
        if ((emptyQ / totalQ) * 100 > 10) {
          report.EmptyHubs = true;
          //If so, we also set the det_analyticsSent to false
          report.det_analyticsSent = false;
        } else {
          report.EmptyHubs = false;
        }
        report.details += "Empty Search Hub Queries: " + emptyQ + "<br>";
        report.details += "Total Search Hub Queries: " + totalQ + "<br>";
        report.details += "% Empty Search Hub Queries: " + ((emptyQ / totalQ) * 100).toFixed(0) + "%<br><br>";

      }
      resolve(report);
    });
  });
  let froms = '&from=' + fromlast.toISOString() + '&to=' + to.toISOString();
  let url = getPlatformUrl(report, report.location + '/rest/ua/v15/stats/visitsMetrics?m=UniqueVisit&f=%28origincontext%3D%3D%27CaseCreation%27%29&org=' + report.org + froms);
  let casecreationPageV = new Promise((resolve) => {
    executeCall(url, report, "Getting Analtyics Metrics Info", "thereAreErrorsSearch").then(function (data) {
      if (data) {
        report.NrofCaseCreationPageVisits = data.globalDatas.UniqueVisit.value;
      }
      resolve(report);
    });
  });
  url = getPlatformUrl(report, report.location + '/rest/ua/v15/stats/visitsMetrics?m=UniqueVisit&f=%28customeventvalue%3D%3D%27submitButton%27%29&org=' + report.org + froms);
  let casecreationV = new Promise((resolve) => {
    executeCall(url, report, "Getting Analtyics Metrics Info", "thereAreErrorsSearch").then(function (data) {
      if (data) {
        report.NrofCaseCreations = data.globalDatas.UniqueVisit.value;
      }
      resolve(report);
    });
  });
  url = getPlatformUrl(report, report.location + '/rest/ua/v15/stats/visitsMetrics?&m=UniqueVisit&f=%28customeventtype%3D%3D%27Click%27%29+AND+%28origincontext%3D%3D%27CaseCreation%27%29&fn=%28customeventvalue%21%3Dnull%29+AND+%28customeventvalue%3D%3D%27submitButton%27%29&org=' + report.org + froms);
  let casedeflectionV = new Promise((resolve) => {
    executeCall(url, report, "Getting Analtyics Metrics Info", "thereAreErrorsSearch").then(function (data) {
      if (data) {
        report.NrofCaseDeflections = data.globalDatas.UniqueVisit.value;
      }
      resolve(report);
    });
  });
  url = getPlatformUrl(report, report.location + '/rest/ua/v15/stats/visitsMetrics?m=UniqueVisit&f=%28origincontext%3D%3D%27CaseCreation%27%29&fn=%28customeventtype%3D%3D%27Click%27%29+AND+%28origincontext%3D%3D%27CaseCreation%27%29&fn=%28customeventvalue%21%3Dnull%29+AND+%28customeventvalue%3D%3D%27submitButton%27%29&org=' + report.org + froms);
  let caseabandonV = new Promise((resolve) => {
    executeCall(url, report, "Getting Analtyics Metrics Info", "thereAreErrorsSearch").then(function (data) {
      if (data) {
        report.NrofCaseAbandons = data.globalDatas.UniqueVisit.value;
      }
      resolve(report);
    });
  });
  return casecreationPageV.then(emptyHubsR).then(casecreationV).then(casedeflectionV).then(caseabandonV);
}


function getModelsInfo(report) {
  let url = getPlatformUrl(report, report.location + '/rest/organizations/' + report.org + '/machinelearning/models');
  report.models_platformVersion = 1;
  let promise = new Promise((resolve) => {
    executeCall(url, report, "Getting ML Models Info", "thereAreErrorsSearch").then(function (data) {
      if (data && data.map) {
        report.models = data;
        report.models_platformVersion = data[0].platformVersion;
      }
      resolve(report);
    });
  });
  return promise;
}

function getQueryPipelinesInfo(report) {
  let url = getPlatformUrl(report, report.location + '/rest/search/admin/pipelines/?organizationId=' + report.org);
  let promise = new Promise((resolve) => {
    executeCall(url, report, "Getting Query Pipelines Info", "thereAreErrorsSearch").then(function (data) {
      if (data && data.map) {
        report.nrofpipelines = data.length;
        report.pipelines = data;
      }
      resolve(report);
    });
  });
  return promise;
}

function getQueryPipelinesDetailsResults(report, id, type) {
  let url = getPlatformUrl(report, report.location + '/rest/search/admin/pipelines/' + id + '/statements?organizationId=' + report.org + '&feature=' + type + "&perPage=200");
  let promise = new Promise((resolve) => {
    executeCall(url, report, "Getting Query Pipeline Details for " + type, "thereAreErrorsSearch").then(function (data) {
      if (data) {
        resolve(data);
      }
      else {
        resolve(undefined);
      }

    });
  });
  return promise;
}

function getQueryPipelinesDetailsResultsV2(report, id) {
  let url = getPlatformUrl(report, report.location + '/rest/search/v2/admin/pipelines/' + id + '/ml/model/associations?organizationId=' + report.org + "&perPage=200");
  let promise = new Promise((resolve) => {
    executeCall(url, report, "Getting Query Pipeline Details ", "thereAreErrorsSearch").then(function (data) {
      if (data) {
        resolve(data);
      }
      else {
        resolve(undefined);
      }

    });
  });
  return promise;
}

function getQueryPipelinesDetails(json, pipe) {
  //First get Models
  //If models platformVersion==1 use the below
  let QuerySuggest, Recommendation, Ranking;
  if (json.models_platformVersion == 1) {
    QuerySuggest = new Promise((resolve) => {
      getQueryPipelinesDetailsResults(json, pipe.id, "querySuggest").then(function (data) {
        if (json.details_pipelines.indexOf(pipe.name) == -1) {
          json.details_pipelines += "<BR><BR>Pipeline: <b>" + pipe.name + "</b><BR>";
          json.details_pipelines += "Machine Learning, using old version, consider upgrading to the latest (platformVersion 2).<BR>";
        }
        if (data) {
          if (data.totalCount == 0) {
            if (json.details_pipelines.indexOf(pipe.name) == -1) {
              json.details_pipelines += "<BR><BR>Pipeline: <b>" + pipe.name + "</b><BR>";
            }
            json.details_pipelines += "Machine Learning, Query Suggestions not enabled.<BR>";
            json.mlquerysuggest = false;
          }
        }
        resolve();
      });
    });
    Recommendation = new Promise((resolve) => {
      getQueryPipelinesDetailsResults(json, pipe.id, "recommendation").then(function (data) {
        if (json.details_pipelines.indexOf(pipe.name) == -1) {
          json.details_pipelines += "<BR><BR>Pipeline: <b>" + pipe.name + "</b><BR>";
          json.details_pipelines += "Machine Learning, using old version, consider upgrading to the latest (platformVersion 2).<BR>";
        }
        if (data) {
          if (data.totalCount == 0) {
            if (json.details_pipelines.indexOf(pipe.name) == -1) {
              json.details_pipelines += "<BR><BR>Pipeline: <b>" + pipe.name + "</b><BR>";
            }
            json.details_pipelines += "Machine Learning, Recommendations not enabled.<BR>";
            json.mlrecommendation = false;
          }
        }
        resolve();
      });
    });
    Ranking = new Promise((resolve) => {
      getQueryPipelinesDetailsResults(json, pipe.id, "topClicks").then(function (data) {
        if (json.details_pipelines.indexOf(pipe.name) == -1) {
          json.details_pipelines += "<BR><BR>Pipeline: <b>" + pipe.name + "</b><BR>";
          json.details_pipelines += "Machine Learning, using old version, consider upgrading to the latest (platformVersion 2).<BR>";
        }
        if (data) {
          if (data.totalCount == 0) {
            if (json.details_pipelines.indexOf(pipe.name) == -1) {
              json.details_pipelines += "<BR><BR>Pipeline: <b>" + pipe.name + "</b><BR>";
            }
            json.details_pipelines += "Machine Learning, Automatic Relevancy Tuning not enabled.<BR>";
            json.mlart = false;
          }
        }
        resolve();
      });
    });
  }
  else {
    //Use the new platform V2 calls to retrieve the associations to the ML
    QuerySuggest = new Promise((resolve) => {
      getQueryPipelinesDetailsResultsV2(json, pipe.id).then(function (data) {
        if (data) {
          if (data.totalEntries == 0) {
            json.mlquerysuggest = false;
            json.mlart = false;
            json.mlrecommendation = false;
            json.mldne = false;
          } else {
            data.rules.map((model) => {
              if (model.modelStatus == "ONLINE") {
                if (model.modelId.indexOf("_topclicks_") != -1) {
                  json.mlart = true;
                }
                if (model.modelId.indexOf("_facetsense_") != -1) {
                  json.mldne = true;
                }
                if (model.modelId.indexOf("_eventrecommendation_") != -1) {
                  json.mlrecommendation = true;
                }
                if (model.modelId.indexOf("_querysuggest_") != -1) {
                  json.mlquerysuggest = true;
                }
              }
            });
          }
          if (!json.mlquerysuggest) {
            if (json.details_pipelines.indexOf(pipe.name) == -1) {
              json.details_pipelines += "<BR><BR>Pipeline: <b>" + pipe.name + "</b><BR>";
            }
            json.details_pipelines += "Machine Learning, Query Suggestions not enabled.<BR>";
          }
          if (!json.mlart) {
            if (json.details_pipelines.indexOf(pipe.name) == -1) {
              json.details_pipelines += "<BR><BR>Pipeline: <b>" + pipe.name + "</b><BR>";
            }
            json.details_pipelines += "Machine Learning, Automatic Relevancy Tuning not enabled.<BR>";
          }
          if (!json.mlrecommendation) {
            if (json.details_pipelines.indexOf(pipe.name) == -1) {
              json.details_pipelines += "<BR><BR>Pipeline: <b>" + pipe.name + "</b><BR>";
            }
            json.details_pipelines += "Machine Learning, Recommendations not enabled.<BR>";
          }
          if (!json.mldne) {
            if (json.details_pipelines.indexOf(pipe.name) == -1) {
              json.details_pipelines += "<BR><BR>Pipeline: <b>" + pipe.name + "</b><BR>";
            }
            json.details_pipelines += "Machine Learning, Dynamic Navigation not enabled.<BR>";
          }
        }
        resolve();
      });
    });
  }
  let Featured = new Promise((resolve) => {
    getQueryPipelinesDetailsResults(json, pipe.id, "top").then(function (data) {
      if (data) {
        if (data.totalCount > 50) {
          if (json.details_pipelines.indexOf(pipe.name) == -1) {
            json.details_pipelines += "<BR><BR>Pipeline: <b>" + pipe.name + "</b><BR>";
          }
          json.details_pipelines += "Too many (" + data.totalCount + ") Featured results (>50).<BR>";
        }
        json.nroffeatured += data.totalCount;
      }
      resolve();
    });
  });
  let Filter = new Promise((resolve) => {
    getQueryPipelinesDetailsResults(json, pipe.id, "filter").then(function (data) {
      if (data) {
        data.statements.map((statement) => {
          json.qpl_with_filters.push(pipe.name);
          //Basic (q)
          if (statement.definition.startsWith("filter q")) {
            json = checkQueryUse("Pipeline: " + pipe.name + ", Filter q", pipe.id, statement.detailed.expressions.join(' '), json, true, false, true, false);
          }
          //Advanced (aq)
          if (statement.definition.startsWith("filter aq")) {
            json = checkQueryUse("Pipeline: " + pipe.name + ", Filter aq", pipe.id, statement.detailed.expressions.join(' '), json, false, false, false, false);
          }
          //Constant (cq)
          if (statement.definition.startsWith("filter cq")) {
            json = checkQueryUse("Pipeline: " + pipe.name + ", Filter cq", pipe.id, statement.detailed.expressions.join(' '), json, false, true, true, false);
          }
          //Disjunction (dq)
          if (statement.definition.startsWith("filter dq")) {
            json = checkQueryUse("Pipeline: " + pipe.name + ", Filter dq", pipe.id, statement.detailed.expressions.join(' '), json, false, true, true, false);
          }
        });
      }
      resolve();
    });
  });
  let QRE = new Promise((resolve) => {
    getQueryPipelinesDetailsResults(json, pipe.id, "ranking").then(function (data) {
      if (data) {
        if (data.totalCount > 50) {
          if (json.details_pipelines.indexOf(pipe.name) == -1) {
            json.details_pipelines += "<BR><BR>Pipeline: <b>" + pipe.name + "</b><BR>";
          }
          json.details_pipelines += "Too many (" + data.totalCount + ") Ranking Expressions (>50).<BR>";

        }
        data.statements.map((statement) => {
          json = checkQueryUse("Pipeline: " + pipe.name + ", QRE ", statement.id, statement.detailed.expressions.join(' '), json, false, false, false, true);
        });
        json.nrofqre += data.totalCount;
      }
      resolve();
    });
  });
  let Thesaurus = new Promise((resolve) => {
    getQueryPipelinesDetailsResults(json, pipe.id, "thesaurus").then(function (data) {
      if (data) {
        if (data.totalCount > 500) {
          if (json.details_pipelines.indexOf(pipe.name) == -1) {
            json.details_pipelines += "<BR><BR>Pipeline: <b>" + pipe.name + "</b><BR>";
          }
          json.details_pipelines += "Too many (" + data.totalCount + ") Thesaurus entries (>500).<BR>";
        }
        json.nrofthesaurus += data.totalCount;
      }
      resolve();
    });
  });
  if (json.models_platformVersion == 1) {
    return QuerySuggest.then(Recommendation).then(Ranking).then(Featured).then(Filter).then(QRE).then(Thesaurus);
  }
  else {
    return QuerySuggest.then(Featured).then(Filter).then(QRE).then(Thesaurus);
  }
}

function getSourceSchedules(report, id) {
  let url = getPlatformUrl(report, report.location + '/rest/organizations/' + report.org + '/sources/' + id + '/schedules');
  let promise = new Promise((resolve) => {
    executeCall(url, report, "Getting Source Schedules Info", "thereAreErrorsSources").then(function (data) {
      if (data) {
        resolve(data.length != 0);
      }
      else {
        resolve(false);
      }
    });
  });
  return promise;
}

function getSecProvSchedules(report, id) {
  let url = getPlatformUrl(report, report.location + '/rest/organizations/' + report.org + '/securityproviders/' + id + '/schedules');
  let promise = new Promise((resolve) => {
    executeCall(url, report, "Getting Security Providers Schedules Info", "thereAreErrorsSources").then(function (data) {
      if (data) {
        resolve(data.length != 0);
      }
      else {
        resolve(false);
      }
    });
  });
  return promise;
}


function getFieldPage(report, page) {
  let url = getPlatformUrl(report, report.location + '/rest/organizations/' + report.org + '/sources/page/fields?includeMappings=true&order=ASC&origin=ALL&page=' + page + '&perPage=200&sortBy=name');
  let promise = new Promise((resolve) => {
    executeCall(url, report, "Getting Field Info", "thereAreErrorsFields").then(function (data) {
      try {
        if (data && data.items) {
          resolve(data);
        }
        else {
          resolve(undefined);
        }
      }
      catch
      {
        resolve(undefined);
      }
    });
  });
  return promise;
}


function getFieldPageV1(report, page) {
  let url = getPlatformUrl(report, report.location + '/rest/organizations/' + report.org + '/fields');

  let promise = new Promise((resolve) => {
    executeCall(url, report, "Getting Field Info", "thereAreErrorsFields").then(function (data) {
      try {
        if (data) {
          resolve(data);
        }
        else {
          resolve(undefined);
        }
      }
      catch
      {
        resolve(undefined);
      }
    });
  });
  return promise;
}

// returns a Promise, will be fulfilled after all pages are done. Returning an array of fields.
const getAllFields = (report) => {
  let allFields = [];
  let promise = new Promise((resolve, reject) => {
    let pageIndex = 0;

    // process fields from a page request, this function will call resolve() on getAllFields() when done.
    let processFields = (json) => {
      if (json) {
        allFields.push(...json.items); // appends all items from GET to allFields.
        pageIndex++;
        if (pageIndex < json.totalPages) {
          // get another page.
          getFieldPage(report, pageIndex).then(processFields);
        }
        else {
          resolve(allFields);
        }
      }
      else {
        resolve(undefined);
      }
    };

    let processFieldsV1 = (json) => {
      if (json) {
        //Map fields to proper V2 format
        json.map((field) => {
          let newfield = {};
          newfield.name = field.name;
          newfield.id = field.id;
          newfield.facet = field.facet;
          newfield.multiValueFacet = field.multivalueFacet;
          newfield.sort = field.sort;
          newfield.useCacheForSort = false;
          newfield.useCacheForComputedFacet = false;
          newfield.useCacheForNestedQuery = false;
          newfield.type = field.fieldType;
          newfield.useCacheForNumericQuery = false;
          newfield.mergeWithLexicon = field.freeTextQueries;
          newfield.sources = [];
          allFields.push(newfield);
        });

        resolve(allFields);
      }
      else {
        resolve(undefined);
      }
    };

    // first page, then process
    if (report.version == "V1") {
      getFieldPageV1(report, pageIndex).then(processFieldsV1);

    }
    else {
      getFieldPage(report, pageIndex).then(processFields);
    }
  });

  return promise;
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

function executeSequentially(tasks) {
  return tasks.reduce(function (sequence, curPromise) {
    // Use reduce to chain the promises together
    return sequence.then(sleeper(300)).then(function () {
      return curPromise;
    });
  }, Promise.resolve());
}

function executeQuery(query, aq, report, err, pipeline) {
  let url = getPlatformUrl(report, report.location + '/rest/search/v2?organizationId=' + report.org + '&maximumAge=0&numberOfResults=500&debug=1&viewAllContent=1&sortCriteria=@date descending&q=' + query + '&aq=' + aq);
  if (report.version == "V1") {
    url = getPlatformUrl(report, report.location + '/rest/search/v2?maximumAge=0&numberOfResults=500&superUser=true&debug=1&sortCriteria=@date descending&q=' + query + '&aq=' + aq);
  }
  if (pipeline) {
    url = url + '&pipeline=' + pipeline;
  }
  let promise = new Promise((resolve) => {
    try {
      document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Executing queries and checking usage.<br>500 Results are retrieved, sorted by date.';
      executeCall(url, report, "Getting Query " + query + " " + aq, err, 'POST').then(function (data) {
        try {
          if (data) {
            resolve(data);
          }
          else {
            resolve(undefined);
          }
        }
        catch (e) {
          resolve(undefined);
        }
      });
    }
    catch (ex) {
      resolve(undefined);
    }
  });
  return promise;
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

function executeQueryUI(query, aq, report, err, completeQuery, addfield) {
  if (!completeQuery) {
    if (report.searchURL.indexOf('?') == -1) {
      report.searchURL = report.searchURL + "?";
    }
  }
  var body;
  let url = report.searchURL + '&maximumAge=0&numberOfResults=500&debug=1&sortCriteria=@date descending&q=' + query + '&aq=' + aq;
  if (completeQuery) {
    url = report.searchURL;
    url = url.replace('debug=0', 'debug=1');
    body = completeQuery;
    //Check if body paraemeter is in url, if so remove it
    Object.keys(body).map(attr => {
      if (url.indexOf(attr) != -1) {
        delete body[attr];
      }
    });
    //Check if fieldstoinclude is set
    if (addfield) {
      if (body['fieldsToInclude']) {
        let cleanfield = aq.replace('@', '');
        if (!body['fieldsToInclude'].includes(cleanfield)) {
          body['fieldsToInclude'].push(cleanfield);
        }
      }
    }
    //body = convArrToObj(completeQuery);
    /*Object.keys(completeQuery).map(attr => {
      if (Array.isArray(completeQuery[attr])){
        body+='&'+ attr+'='+ JSON.stringify(completeQuery[attr]) ;

      }
      else
      {
        if (typeof completeQuery[attr]  === 'object'){
          //fd.append( attr, JSON.parse(JSON.stringify(completeQuery[attr] )));
        }
        else
        {
            body+="&"+ attr+"="+ completeQuery[attr] ;
        }
      }
    });*/
  }
  let promise = new Promise((resolve) => {
    try {
      document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Executing queries and checking usage.<br>500 Results are retrieved, sorted by date.';

      executeQueryUICall(url, report, "Getting Query " + query + " " + aq, err, 'POST', report.searchAuth, body).then(function (data) {
        try {
          if (data) {
            resolve(data);
          }
          else {
            resolve(undefined);
          }
        }
        catch (e) {
          resolve(undefined);
        }
      });
    }
    catch (ex) {
      resolve(undefined);
    }
  });
  return promise;
}

function executeLogBrowserQuery(source, report) {
  //Only get stats, we only want to know how many errors and warnings there are
  //Last week
  // Date format: 2019-03-06T13:38:30.000Z
  //              yyyy-mm-ddTHH:mm:ss.000Z (.toISOString())
  var now = new Date();
  var from = new Date();
  from = from.setDate(now.getDate() - 7);
  var fromlast = new Date(from);
  var to = new Date();
  let url = 'https://api.cloud.coveo.com/logs/v1/organizations/' + report.org + '/facetsStats?from=' + fromlast.toISOString() + '&to=' + to.toISOString() + '&documentId=';
  let promise = new Promise((resolve) => {
    document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Checking Log Browser.';
    if (report.version == "V2") {
      executeLogBrowserCall(url, source, report).then(function (data) {
        if (data) {
          resolve(data);
        }
        else {
          resolve(undefined);
        }
      });
    }
    else {
      resolve(undefined);
    }
  });
  return promise;
}

function alreadyInProblems(text, problems) {
  let alreadyIn = false;
  for (let item of problems) {
    if (item.indexOf(text) != -1) {
      alreadyIn = true;
      break;
    }
  }
  return alreadyIn;
}

function checkQueryUse(title, id, query, report, basic, constant, checkbadwords, isrank, fullquery) {
  //Query can be like:
  //$qre(expression:'@sitelanguage="french"', modifier:-100)
  //NOT @objecttype==("feeditem","FeedComment")  NOT @filetype=="Image" NOT (@connectortype==Salesforce2 @documenttype==articleattachment) NOT @filetype=CFComment
  let valid = true;
  //Remove all double spaces, translate \n to " ", ,space to , and add a space in the end
  query = query.replace(/[\n\r]+/g, '').replace(/\s{2,10}/g, ' ').replace(/, /g, ',') + ' ';
  //We also want to replace the {{ }}
  query = query.replace(/{{.*?}}/g, '@queryextension');

  let remarks = "";
  let problems = new Set();
  let validIcon = "";//`<span style="font-weight:bold;color: #009830;padding:5px;">&#x2713;</span>`;
  let inValidIcon = "";//`<span style="font-weight:bold;color: #ce3f00;padding: 5px">&#x2718;</span>`;

  let comment = "";
  let commentnofields = "";
  if (report.allfields.length == 0) {
    commentnofields = "<br>We could not automatically check your field definition, <b>check the above remark in your Coveo Org.</b>";
  }
  if (constant) {
    comment = "Using this will degrade performance, because the dynamic value cannot be cached."
  }
  if (basic) {
    comment = "Put the word inside the aq query, instead of the basic query (q)."
  }
  // Bad words inside query
  let badwordsbasic = ["$q(", "$qf(", "$valuesToResultSet", "$joinOnValues", "$join", "$filterJoin", "$qrf", "$sort", "$some", "<@-", "*=", "~=", "%=", "/=", "=[[", "<=", ">="];
  let badwords = ["today", "tomorrow", "yesterday", "now"];
  //Only needed on basic and cq
  if (checkbadwords) {
    if (basic) {
      badwordsbasic.map((word) => {
        if (query.toUpperCase().includes(word.toUpperCase())) {
          let info = "";
          if (word.toUpperCase() == "$SOME") {
            info += "Do you really need to use $some? This will take longer to execute.<br>";

          }
          else {
            info += "Query should not contain: <b>" + word + "</b><br>" + comment;
          }
          remarks = "<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval>" + word + "</td></tr>";
          remarks += "<tr><td colspan=2 class=myexprcomm>" + inValidIcon;
          remarks += info;
          remarks += "</td></tr></table>"
          problems.add(remarks);
          valid = false;
        }
      });
    }
    else {
      //Is obsolete
      /*
      badwords.map((word) => {
        
        if (query.toUpperCase().search('[><=]'+word.toUpperCase())>=0) {
          let info = "";
          let expression = query.toUpperCase().match('@[\\w ]+[><=]'+word.toUpperCase())[0];
          info += "Query should not contain: <b>" + word + "</b><br>" + comment;
          remarks = "<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + expression + "</span></td></tr>";
          remarks += "<tr><td colspan=2 class=myexprcomm>" + inValidIcon;
          remarks += info;
          remarks += "</td></tr></table>"
          problems.add(remarks);
          valid = false;
        }
      });
      */
    }
  }
  if (constant && !isrank) {
    if (fullquery) {
      report.cq.push(query);
    }
  }
  if (basic) {
    //Do some basic tests when fullquery is supplied
    if (fullquery) {
      // Nr of results requested
      if (fullquery.numberOfResults > 20) {
        remarks = "<table class=mytable><tr><td class=myexpr>Parameter:</td><td class=myexprval>numberOfResults</td></tr>";
        remarks += "<tr><td colspan=2 class=myexprcomm>" + inValidIcon;
        remarks += "Number of requested results <b>" + fullquery.numberOfResults + "</b>, consider a smaller set of results (<20).";
        remarks += "</td></tr></table>"
        problems.add(remarks);
        valid = false;
      }
      //Folding?
      if ('filterField' in fullquery) {
        if (fullquery.filterField != "") {
          report.filterfields.push(fullquery.filterField);
        }
        if ('filterFieldRange' in fullquery) {
          if (fullquery.filterFieldRange > 5) {
            remarks = "<table class=mytable><tr><td class=myexpr>Parameter:</td><td class=myexprval>Folding</td></tr>";
            remarks += "<tr><td class=myexpr>Folding Field:</td><td class=myexprval>" + fullquery.filterField + "</td></tr>";
            remarks += "<tr><td colspan=2 class=myexprcomm>" + inValidIcon;
            remarks += "Folding on field <b>" + fullquery.filterField + "</b> is requesting more then 5 values (filterFieldRange=" + fullquery.filterFieldRange + "), consider a smaller set of filtered results.";
            remarks += "</td></tr></table>"
            problems.add(remarks);
            valid = false;
          }
          //Folding & duplicatefiltering: CANNOT BE DONE
          if ('enableDuplicateFiltering' in fullquery) {
            if (fullquery.enableDuplicateFiltering) {
              remarks = "<table class=mytable><tr><td class=myexpr>Parameter:</td><td class=myexprval>enableDuplicateFiltering<br>AND filterField (Folding)</td></tr>";
              remarks += "<tr><td colspan=2 class=myexprcomm>" + inValidIcon;
              remarks += "Duplicate Filtering is on (enableDuplicateFiltering) and Folding (filterField) is set.<br><b>The Duplicate filtering will be ignored!</b>";
              remarks += "</td></tr></table>"
              problems.add(remarks);
              valid = false;
            }
          }
        }
      }

      //enableDuplicateFiltering 
      if ('enableDuplicateFiltering' in fullquery) {
        if (fullquery.enableDuplicateFiltering) {
          remarks = "<table class=mytable><tr><td class=myexpr>Parameter:</td><td class=myexprval>enableDuplicateFiltering</td></tr>";
          remarks += "<tr><td colspan=2 class=myexprcomm>" + inValidIcon;
          remarks += "Duplicate Filtering is on, slows down queries, consider removing it (enableDuplicateFiltering=false).";
          remarks += "</td></tr></table>"
          problems.add(remarks);
          valid = false;
        }
      }
      //To many words
      if (query.split(" ").length > 15) {
        remarks = "<table class=mytable><tr><td class=myexpr>Parameter:</td><td class=myexprval>To many words</td></tr>";
        remarks += "<tr><td colspan=2 class=myexprcomm>" + inValidIcon;
        remarks += "Query contains to many words (>15)<br>Consider to use Partial Matching.";
        remarks += "</td></tr></table>"
        problems.add(remarks);
        valid = false;
      }
      //partialMatch
      if ('partialMatch' in fullquery) {
        if (fullquery.partialMatch) {
          //Check number of words, if > 50 bad
          if (query.split(" ").length > 50) {
            remarks = "<table class=mytable><tr><td class=myexpr>Parameter:</td><td class=myexprval>partialMatch</td></tr>";
            remarks += "<tr><td colspan=2 class=myexprcomm>" + inValidIcon;
            remarks += "Query contains to many words (>50) and partial matching is enabled.<br>Consider to use the LQ parameter.";
            remarks += "</td></tr></table>"
            problems.add(remarks);
            valid = false;
          }

        }
      }
      //Check facets
      console.log(fullquery);
      var facets=[];
      if ('groupBy' in fullquery){
        facets = fullquery.groupBy;
        console.log('Using Groupby');
      }
      if ('facets' in fullquery){
        facets = fullquery.facets;
        console.log('Using facets');
      }
      facets.map((group) => {
        //InjectionDepth NOT > 10000
        if ('injectionDepth' in group) {
          if (group.injectionDepth > 10000) {
            remarks = "<table class=mytable><tr><td class=myexpr>Parameter:</td><td class=myexprval>injectionDepth</td></tr>";
            remarks += "<tr><td class=myexpr>Facet Field:</td><td class=myexprval>" + group.field + "</td></tr>";
            remarks += "<tr><td colspan=2 class=myexprcomm>" + inValidIcon;
            remarks += "Is requested with injectionDepth " + group.injectionDepth + ".<br>Slower in performance, consider to use a smaller value (10000).";
            remarks += "</td></tr></table>"
            problems.add(remarks);
            valid = false;
          }
        }
        //Automatic ranges
        if ('generateAutomaticRanges' in group) {
          if (group.generateAutomaticRanges) {
            let fieldinfo = report.allfields.filter(fieldi => { if (fieldi.name == group.field.replace('@', '') && (fieldi.useCacheForNumericQuery)) return fieldi.name; }).length;
            if (fieldinfo == 0) {
              remarks = "<table class=mytable><tr><td class=myexpr>Parameter:</td><td class=myexprval>generateAutomaticRanges</td></tr>";
              remarks += "<tr><td class=myexpr>Facet Field:</td><td class=myexprval>" + group.field + "</td></tr>";
              remarks += "<tr><td colspan=2 class=myexprcomm>" + inValidIcon;
              remarks += "Is requested with generateAutomaticRanges and useCacheForNumericQuery is disabled.<br>Slower in performance, enable useCacheForNumericQuery on the field.";
              remarks += "</td></tr></table>"
              problems.add(remarks);

              valid = false;
            }
          }
        }
        //maximumNumberOfValues
        if ('maximumNumberOfValues' in group) {
          if (group.maximumNumberOfValues > 15) {
            remarks = "<table class=mytable><tr><td class=myexpr>Parameter:</td><td class=myexprval>maximumNumberOfValues</td></tr>";
            remarks += "<tr><td class=myexpr>Facet Field:</td><td class=myexprval>" + group.field + "</td></tr>";
            remarks += "<tr><td colspan=2 class=myexprcomm>" + inValidIcon;
            remarks += "Is requested with maximumNumberOfValues " + group.maximumNumberOfValues + ".<br>Slower in performance, consider to use a smaller value (<15)."
            remarks += "</td></tr></table>"
            problems.add(remarks);
            valid = false;

          }
        }
      });

    }
  }
  let allFieldsAndExpressions = []; //Field, Operator, Content, SingleWord, WordCount, Match, insideQRE, isConstant
  let allQRE = []; //Expression, Constant
  // First get all field expressions, FIELD OPERATOR CONTENT => FIELDEX
  // First get all QRE's
  // Check if $qre
  // \$qre\( ?expression: ?'?(.*?)'?, ?modifier(.*?)\)
  var result;
  var reg = RegExp(/\$qre\( ?expression: ?'?(.*?)'?, ?modifier(.*?)\)/, 'ig');
  while ((result = reg.exec(query)) !== null) {
    let constant = false;
    if (result[0].indexOf('isConstant: true') > -1) {
      constant = true;
    }
    let expression = result[1];
    if (expression.endsWith("'")) {
      expression = expression.substring(0, expression.length - 1);
    }
    allQRE.push({ Match: result[0], Expression: expression, Constant: constant });
  }

  //  For field==X
  //   (@?\w+) ?([<>*~%\/:=]+) ?([^"'(]?[\w-]+)
  //   CONTENT ==> "ABC"
  let inQRE = false;
  let isConstant = false;
  reg = RegExp(/(@\w+) ?([!<>*~%\/:=]+) ?([^"'(]?[\w-:.\/\?]+)/, 'g');
  while ((result = reg.exec(query)) !== null) {
    //Warn if field does not start with @
    if (!result[1].startsWith('@')) {
      let field = result[1];
      if (!alreadyInProblems("<b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "<b>Is not valid. Does not start with @", problems)) {
        problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + result[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Field:</td><td class=myexprval><b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "<b>Is not valid. Does not start with @ sign.</b></td></tr></table>");
      }
      valid = false;
    }
    else {
      inQRE = false;
      isConstant = false;
      let info = allQRE.filter(qre => { if (qre.Expression == result[0]) return qre; });
      if (info.length > 0) {
        inQRE = true;
        if (info[0].Constant) {
          isConstant = true;
        }
      }
      allFieldsAndExpressions.push({ Match: result[0], Field: result[1], Operator: result[2], Content: result[3].trim(), SingleWord: true, WordCount: 1, insideQRE: inQRE, isConstant: isConstant });
    }
  }

  // For Field =='ABC'
  //  (@?\w+) ?([<>*~%\/=]+) ?(['](.*?)['])
  reg = RegExp(/(@?\w+) ?([!<>*~%\/=]+) ?(['](.*?)['])/, 'g');
  while ((result = reg.exec(query)) !== null) {
    //Warn if field does not start with @
    if (!result[1].startsWith('@')) {
      let field = result[1];
      if (!alreadyInProblems("<b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "<b>Is not valid. Does not start with @", problems)) {
        problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + result[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Field:</td><td class=myexprval><b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "<b>Is not valid. Does not start with @ sign.</b></td></tr></table>");
      }
      valid = false;
    }
    else {
      let single = true;
      if (result[4].trim().indexOf(' ') != -1) {
        single = false;
      }
      inQRE = false;
      isConstant = false;
      let info = allQRE.filter(qre => { if (qre.Expression == result[0]) return qre; });
      if (info.length > 0) {
        inQRE = true;
        if (info[0].Constant) {
          isConstant = true;
        }
      }
      allFieldsAndExpressions.push({ Match: result[0], Field: result[1], Operator: result[2], Content: result[4].trim(), SingleWord: single, WordCount: 1, insideQRE: inQRE, isConstant: isConstant });
    }
  }

  // For Field =="ABC"
  //  (@?\w+) ?([!<>*~%\/:=]+) ?(["]([^,].*?)["])
  reg = RegExp(/(@?\w+) ?([!<>*~%\/:=]+) ?(["]([^,].*?)["])/, 'g');
  while ((result = reg.exec(query)) !== null) {
    //Warn if field does not start with @
    if (!result[1].startsWith('@')) {
      let field = result[1];
      if (!alreadyInProblems("<b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "<b>Is not valid. Does not start with @", problems)) {
        problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + result[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Field:</td><td class=myexprval><b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "<b>Is not valid. Does not start with @ sign.</b></td></tr></table>");
      }
      valid = false;
    }
    else {
      let single = true;
      if (result[4].trim().indexOf(' ') != -1) {
        single = false;
      }
      inQRE = false;
      isConstant = false;
      let info = allQRE.filter(qre => { if (qre.Expression == result[0]) return qre; });
      if (info.length > 0) {
        inQRE = true;
        if (info[0].Constant) {
          isConstant = true;
        }
      }
      allFieldsAndExpressions.push({ Match: result[0], Field: result[1], Operator: result[2], Content: result[4].trim(), SingleWord: single, WordCount: 1, insideQRE: inQRE, isConstant: isConstant });
    }
  }


  // Get all field with ( ) expressions, FIELD OPERATOR CONTENT => FIELDIN
  // Like @title=("Wim","Peters")
  //   @(\w+) ?([<>*~%\/:=]+) ?\(("?.+?)\) 
  reg = RegExp(/(@?\w+) ?([!<>*~%\/:=]+) ?\(("?.+?)\) /, 'g');
  while ((result = reg.exec(query)) !== null) {
    //Warn if field does not start with @
    let field = result[1];
    if (!result[1].startsWith('@')) {
      if (!alreadyInProblems("<b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "<b>Is not valid. Does not start with @", problems)) {
        problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + result[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Field:</td><td class=myexprval><b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "<b>Is not valid. Does not start with @ sign.</b></td></tr></table>");
      }
      valid = false;
    }
    else {
      //Count words
      let single = true;
      let content = result[3].trim().replace("(").replace(")");
      let words = content.split(',');
      words.map((word) => {
        if (word.trim().indexOf(' ') != -1) {
          single = false;
        }
      });
      inQRE = false;
      isConstant = false;
      let info = allQRE.filter(qre => { if (qre.Expression == result[0]) return qre; });
      if (info.length > 0) {
        inQRE = true;
        if (info[0].Constant) {
          isConstant = true;
        }
      }
      allFieldsAndExpressions.push({ Match: result[0], Field: result[1], Operator: result[2], Content: result[3].trim(), SingleWord: single, WordCount: words.length, insideQRE: inQRE, isConstant: isConstant });
    }
  }

  // Get all field with ( ) expressions, FIELD OPERATOR CONTENT => FIELDIN
  //    Without ""
  //  @(\w+) ?([<>*~%\/:=]+) ?(\([^"][\S ]+?\))
  /*  reg = RegExp(/@(\w+) ?([<>*~%\/:=]+) ?(\([^"][\S ]+?\))/, 'g');
    while ((result = reg.exec(query)) !== null) {
      //Count words
      let single = true;
      let content = result[3].trim().replace("(").replace(")");
      let words = content.split(',');
      words.map((word) => {
        if (word.trim().indexOf(' ') != -1) {
          single = false;
        }
      });
      inQRE = false;
      isConstant = false;
      let info = allQRE.filter(qre => { if (qre.Expression == result[0]) return qre; });
      if (info.length > 0) {
        inQRE = true;
        if (info[0].Constant) {
          isConstant = true;
        }
      }
      allFieldsAndExpressions.push({ Match: result[0], Field: result[1], Operator: result[2], Content: result[3].trim(), SingleWord: single, WordCount: words.length, insideQRE: inQRE, isConstant: isConstant });
    }
  */

  // is $sort inside the query or sortCriteria
  //   \$sort\(([\w:', ]+)field:\ ?'?(@?[\w]+)'?
  //   field = group 2
  //   if field is Sort Cache: OK, else REPORT
  reg = RegExp(/\$sort\(([\w:', ]+)field:\ ?'?(@?[\w]+)'?/, 'gi');
  while ((result = reg.exec(query)) !== null) {
    let sortfield = result[2];
    if (!sortfield.startsWith('@')) {
      if (!alreadyInProblems("<b>" + sortfield + "</b></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "<b>Is not valid. Does not start with @", problems)) {
        problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + result[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Field:</td><td class=myexprval><b>" + sortfield + "</b></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "<b>Is not valid. Does not start with @ sign.</b></td></tr></table>");
      }
      valid = false;
    }
    else {
      //Is sort Cache enabled?
      let fieldinfo = report.allfields.filter(fieldi => { if (fieldi.name == sortfield.replace('@', '') && (fieldi.useCacheForSort)) return fieldi.name; }).length;
      if (fieldinfo == 0) {
        if (!alreadyInProblems("<td class=myexprval><b>" + sortfield + "</b></td></tr><tr><td colspan=2 class=myexprcomm>" + inValidIcon + "Sorting,", problems)) {
          problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + result[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Field:</td><td class=myexprval><b>" + sortfield + "</b></td></tr><tr><td colspan=2 class=myexprcomm>" + inValidIcon + "Sorting, but the field does not have UseCacheForSort enabled." + commentnofields + "</td></tr></table>");
        }
        valid = false;
      }
    }
  }

  // check for bad date queries
  //   y r or mo
  reg = RegExp(/([<>]=) ?([^"'(]?[\w-:.\/\?]+)-(\d+)([\w ]+)/, 'gi');
  while ((result = reg.exec(query)) !== null) {
    let adddates = result[4].trim();
    //Valid = s, m, h, d, mo, y
    if (!['s', 'm', 'h', 'd', 'mo', 'y'].includes(adddates)) {
      if (!alreadyInProblems("Bad syntax, <b>" + adddates + "</b> is being used in (" + result[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + ").<br>Use s, m, h, d, mo or y.<", problems)) {
        problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + query.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "Bad syntax, <b>" + adddates + "</b> is being used in (" + result[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + ").<br>Use s, m, h, d, mo or y.</td></tr></table>");
      }
      valid = false;
    }
  }

  // nested check
  //   \[\[(@?\w+)\]
  //   field = group 1
  //   if field is cached and numeric OK, else REPORT
  //   numeric is already checked upon earlier.
  //   make an exception for salesforce fields which starts with sf
  reg = RegExp(/\[\[(@?\w+)\]/, 'gi');
  while ((result = reg.exec(query)) !== null) {
    let field = result[1];
    //Warn if field does not start with @
    if (!result[1].startsWith('@')) {
      if (!alreadyInProblems("<b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "<b>Is not valid. Does not start with @", problems)) {
        problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + result[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Field:</td><td class=myexprval><b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "<b>Is not valid. Does not start with @ sign.</b></td></tr></table>");
      }
      valid = false;
    }
    else {
      //Check if field starts with sf, if so ignore
      if (!field.startsWith("@sf")) {
        //Is field cached and numeric
        let fieldinfo = report.allfields.filter(fieldi => { if (fieldi.name == field.replace('@', '') && (fieldi.useCacheForNestedQuery)) return fieldi.name; }).length;
        if (fieldinfo == 0) {
          if (!alreadyInProblems("<b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm>" + inValidIcon + "Nested query", problems)) {
            problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + result[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Field:</td><td class=myexprval><b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm>" + inValidIcon + "Nested query, but the field does not have UseCacheForNestedQuery enabled." + commentnofields + "</td></tr></table>");
          }
          valid = false;
        }
      }
    }
  }

  // < or > field
  //   \@(\w+) ?[><]{1}=? ?(\w+)
  //   if field has numeric cache OK, else REPORT
  reg = RegExp(/(@?\w+) ?[><]{1}=? ?(\w+)/, 'gi');
  while ((result = reg.exec(query)) !== null) {
    let field = result[1];
    //Warn if field does not start with @
    if (!result[1].startsWith('@')) {
      if (!alreadyInProblems("<b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "<b>Is not valid. Does not start with @", problems)) {
        problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + result[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Field:</td><td class=myexprval><b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "<b>Is not valid. Does not start with @ sign.</b></td></tr></table>");
      }
      valid = false;
    }
    else {
      //Is field numeric cached
      let fieldinfo = report.allfields.filter(fieldi => { if (fieldi.name == field.replace('@', '') && (fieldi.useCacheForNumericQuery)) return fieldi.name; }).length;
      if (fieldinfo == 0) {
        if (!alreadyInProblems("<b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm>" + inValidIcon + "Numeric query", problems)) {
          problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + result[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Field:</td><td class=myexprval><b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm>" + inValidIcon + "Numeric query, but the field does not have UseCacheForNumericQuery enabled." + commentnofields + "</td></tr></table>");
        }
        valid = false;
      }
    }
  }


  // +or field
  reg = RegExp(/\+or/, 'gi');
  while ((result = reg.exec(query)) !== null) {
    //Is field numeric cached
    let fieldinfo = report.allfields.filter(fieldi => { if (fieldi.name == field.replace('@', '') && (fieldi.useCacheForNumericQuery)) return fieldi.name; }).length;
    if (fieldinfo == 0) {
      if (!alreadyInProblems("Bad syntax, <b>+or</b> is being used.<br>Use OR instead.<", problems)) {
        problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + query.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "Bad syntax, <b>+or</b> is being used.<br>Use OR instead.</td></tr></table>");
      }
      valid = false;
    }
  }


  // big or on same field, also check if expression contains the badwords
  //   Check all field expressions, count the fields and the number of OR's 
  //   if "OR @fieldname" > 5  then REPORT
  let orfields = [];
  allFieldsAndExpressions.map((expression) => {
    reg = RegExp('OR @' + expression.Field, 'gi');
    if ((query.match(reg) || []).length > 5) {
      orfields.push(expression.Field);
    }
    if (constant && checkbadwords) {
      badwordsbasic.map((word) => {
        if (expression.Content.toUpperCase().startsWith(word.toUpperCase())) {
          {
            remarks = "<table class=mytable>";
            remarks += "<tr><td colspan=2 class=myexprcomm>" + inValidIcon;
            remarks += "Query should not contain: <b>" + word + "</b><br>" + comment;
            remarks += "</td></tr></table>"
            problems.add(remarks);

          }
          valid = false;
        }
      });
    }
  });
  orfields = [...new Set(orfields)];
  orfields.map((field) => {
    if (!alreadyInProblems("<td class=myexprval>" + field + "</td></tr><tr><td colspan=2 class=myexprcomm>" + inValidIcon + "Too many OR", problems)) {
      reg = RegExp('OR @' + field + '\\S+', 'gi');
      let or = [];
      while ((result = reg.exec(query)) !== null) {
        or.push(result[0]);
      }
      remarks = "<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval>" + or.join("<BR>") + "</td></tr>";
      remarks += "<tr><td class=myexpr>Field:</td><td class=myexprval>" + field + "</td></tr>";
      remarks += "<tr><td colspan=2 class=myexprcomm>" + inValidIcon;
      remarks += "Too many OR's with the same field (<b>" + field + "</b>).<br>Rewrite the query to @" + field + "=(A,B,C).";
      remarks += "</td></tr></table>"
      problems.add(remarks);
    }
    valid = false;
  });

  // Operator <>
  //   \@(\w+) ?<> ?"?(\w+)"?
  //     should be @field NOT @field=="XXXX"
  //     if operator <> --> REPORT and mention field should be a FACET
  reg = RegExp(/(@?\w+) ?<> ?"?(\w+)"?/, 'gi');
  while ((result = reg.exec(query)) !== null) {
    let field = result[1];
    //Warn if field does not start with @
    if (!result[1].startsWith('@')) {
      if (!alreadyInProblems("<b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "<b>Is not valid. Does not start with @", problems)) {
        problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + result[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Field:</td><td class=myexprval><b>" + field + "</b></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "<b>Is not valid. Does not start with @ sign.</b></td></tr></table>");
      }
      valid = false;
    }
    else {
      if (!alreadyInProblems(field + "</td></tr><tr><td colspan=2 class=myexprcomm>" + inValidIcon + "Query with <>", problems)) {
        remarks = "<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><></td></tr>";
        remarks += "<tr><td class=myexpr>Field:</td><td class=myexprval>" + field + "</td></tr>";
        remarks += "<tr><td colspan=2 class=myexprcomm>" + inValidIcon + "Query with <><br>Do you want to exclude an exact match?<br>Then you should use: " + field + " NOT " + field + "==\"VALUE\".<br>";
        valid = false;
        //Is a Facet?
        let fieldinfo = report.allfields.filter(fieldi => { if (fieldi.name == field.replace('@', '') && (fieldi.facet || fieldi.multiValueFacet)) return fieldi.name; }).length;
        if (fieldinfo == 0) {
          remarks += "In order to do this, make the field " + field + " a Facet or Multi-Value Facet.";
        }
        else {
          remarks += "";
        }
        remarks += "</td></tr></table>"
        problems.add(remarks);
      }
    }
  }
  let allExpressions = "";
  let knownFacetFields = ['@source', '@year', '@month', '@filetype', '@collection', '@author', '@folders', '@language', '@concepts'];
  let fieldstoignore = ['@uri', '@permanentid', '@sysurihash', '@urihash'];
  allFieldsAndExpressions.map((expression) => {
    allExpressions += expression.Match.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "<BR>";//+ ": "+expression.WordCount+"/"+expression.SingleWord+"/"+expression.Operator+"<BR>";
    //Ignore expressions with $context in them
    if (!expression.Match.includes("$context")) {
      //Check bad operators
      if (expression.Operator == '!=') {
        if (!alreadyInProblems("Bad syntax, <b>!=</b> is being used.<br>Use NOT " + expression.Field + "==VALUE instead", problems)) {
          problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + query.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td colspan=2 class=myexprcomm style='color:red'>" + inValidIcon + "Bad syntax, <b>!=</b> is being used.<br>Use NOT " + expression.Field + "==VALUE instead.</td></tr></table>");
          valid = false;
        }
      }

      //*********** FACET ******************* */
      //Is a Facet?
      let fieldinfo = report.allfields.filter(fieldi => { if (fieldi.name == expression.Field.replace('@', '') && (fieldi.facet || fieldi.multiValueFacet)) return fieldi.name; }).length;
      if (fieldinfo > 0 || knownFacetFields.includes(expression.Field)) {
        if (expression.Operator == '<>') {
          if (!alreadyInProblems(expression.Field + "</td></tr><tr><td colspan=2 class=myexprcomm>" + inValidIcon + "Query with <>", problems)) {
            remarks = "<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><></td></tr>";
            remarks += "<tr><td class=myexpr>Field:</td><td class=myexprval>" + expression.Field + "</td></tr>";
            remarks += "<tr><td colspan=2 class=myexprcomm>" + inValidIcon + "Query with <>: better would be to use: " + expression.Field + " NOT " + expression.Field + "==\"VALUE\".<br>";
            valid = false;
            remarks += "</td></tr></table>"
            problems.add(remarks);
          }
        }
        // It is a Facet
        //   CONTENT WordCount = 1 and SingleWord
        //     should be field==A
        //     ACTION: Execute a query to get the values of the field --> if there are only single words = should be used
        //     if operator = --> REPORT
        //     if operator == and content starts with " --> REPORT
        //     if operator == and content starts with ("  --> REPORT
        /*if (expression.WordCount >= 1 && expression.SingleWord) {
          //A query will be executed later to check the field
          if (expression.Operator == "==") {// || expression.Operator == "=") {
            //problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + expression.Match.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Facet Field: <b>" + expression.Operator + expression.Field + "</b><br>Does it only contains single words? Use = .</table>");
            problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + expression.Match.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Field:</td><td class=myexprval>" + expression.Field + "</b></td></tr><tr><td colspan=2 class=myexprcomm>" + ValidIcon + "Do you really want to use <b>contains</b> (=) or are you filtering? <br>If you want to filter, use == (exact match), which is faster.</td></tr></table>");
            /*report.singlewordfields.push(expression.Field);
            if (expression.Operator == "=") {
              report.singlewordfieldscontains.push(expression.Field);
            }
            else {
              report.singlewordfieldsmatch.push(expression.Field);
            }
            valid = false;
          }
        }*/
        //   CONTENT WordCount =1 and NOT SingleWord
        //     should be field=="A B"
        //     if operator = --> REPORT WARNING
        //     if operator == and content starts with ("  --> DO NOT REPORT
        /*if (expression.WordCount == 1 && !expression.SingleWord) {
          //For now just show a warning
          //Exception for uri
          if (expression.Field != "uri") {
            if (expression.Operator == "=") {
              problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + expression.Match.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Facet Field: </td><td class=myexprval><b>" + expression.Field + "</b></td></tr><tr><td colspan=2 class=myexprcomm>" + inValidIcon + "Do you really want to use <b>contains</b> (=) or are you filtering? <br>If you want to filter, use == (exact match), which is faster.</td></tr></table>");
              valid = false;
            }
            if (expression.Operator == "==") {
              problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + expression.Match.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Facet Field: </td><td class=myexprval><b>" + expression.Field + "</b></td></tr><tr><td colspan=2 class=myexprcomm>" + validIcon + "Is used with a == query.<br>Based on the first 500 results, the content contains multiple words. Keep it like this!</td></tr></table>");
              //valid = false;
            }
          }
        }*/
      }
      else {
        //*********** NO FACET ******************* */
        if (expression.Operator == '<>') {
          if (!alreadyInProblems(expression.Field + "</td></tr><tr><td colspan=2 class=myexprcomm>" + inValidIcon + "Query with <>", problems)) {
            remarks = "<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><></td></tr>";
            remarks += "<tr><td class=myexpr>Field:</td><td class=myexprval>" + expression.Field + "</td></tr>";
            remarks += "<tr><td colspan=2 class=myexprcomm>" + inValidIcon + "Query with <>: better would be to use: " + expression.Field + " NOT " + expression.Field + "==\"VALUE\".<br>";
            remarks += "In order to do this, make the field " + expression.Field + " a Facet or Multi-Value Facet." + commentnofields;
            remarks += "</td></tr></table>";
            valid = false;
            problems.add(remarks);
          }
        }

        if (!expression.isConstant || !constant) {
          //   NOT NEEDED IF in CQ or QRE which is set as constant
          //   OPERATOR == and CONTENT WordCount >= 1 --> REPORT set as Facet
          //   OPERATOR == and CONTENT WordCount >= 1 and content starts with ( --> REPORT set as Facet
          if (expression.WordCount >= 1 && expression.SingleWord && (expression.Operator == "==" || expression.Operator == "=")) {
            if (!fieldstoignore.includes(expression.Field)) {
              if (!alreadyInProblems("Field: <b>" + expression.Operator + expression.Field + "</b><br>Are you using a lot of exact matches", problems)) {
                problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + expression.Match.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Field: <b>" + expression.Operator + expression.Field + "</b><br>Are you using a lot of exact matches and are you filtering?<br>Consider to make the field a Facet/Multivalue Facet.<br>If your field content only contains single words, use the = operator (No need to create a facet for it).</table>");
                report.singlewordfields.push(expression.Field);
                if (expression.Operator == "=") {
                  report.singlewordfieldscontains.push(expression.Field);
                }
                else {
                  report.singlewordfieldsmatch.push(expression.Field);
                }
              }
              valid = false;
            }
          }
          //   OPERATOR = and CONTENT WordCount >= 1 --> REPORT WARNING
          //   OPERATOR = and CONTENT WordCount >= 1 and content starts with ( --> REPORT WARNING
          if (expression.WordCount >= 1 && expression.Operator == "=" && !expression.SingleWord) {
            if (!fieldstoignore.includes(expression.Field)) {
              if (!alreadyInProblems("Field:</td><td class=myexprval>" + expression.Field + "</b></td></tr><tr><td colspan=2 class=myexprcomm>" + inValidIcon + "Do you really want to use", problems)) {
                problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + expression.Match.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Field:</td><td class=myexprval>" + expression.Field + "</b></td></tr><tr><td colspan=2 class=myexprcomm>" + inValidIcon + "Do you really want to use <b>contains</b> (=) or are you filtering? <br>If you want to filter, use == (exact match), which is faster.</td></tr></table>");
              }
              valid = false;
            }
          }
        }
      }
    }
  });
  //For now report all expressions all the time
  if (!valid) {
    remarks = [...problems].join('<BR><BR>');
    let subtitle = "";
    if (id != "") {
      subtitle = "Id: " + id + "<BR>";
    }
    if (isrank) {
      report.badquery += "<h4>Query analysis of " + title + "</h4>" + subtitle + remarks;
    }
    else {
      report.badquery += "<h4>Query analysis of " + title + "</h4>" + subtitle + "<table class=mytable><tr><td class=myexpr><b>Query:</b></td><td class=myexprval><span class='mycode'>" + query.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr></table><br>" + remarks;
    }
    if (allExpressions != "") {
      report.badquery += "<table class=mytable><tr><td class=myexprcomm>All Expressions:<br><span class='mycode'>" + allExpressions + "</span></td></tr></table>";
    }
    else {
      report.badquery += "<BR>";
    }
    report.badquery += "<BR>";
    report.querycheck = true;
  }
  return report;
}

function escapeRegExp(str) {
  return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(escapeRegExp(search), 'g'), replacement);
};

function processOrgReport(report) {
  $('#loading').show();
  $('#instructions').hide();
  $('#legend').hide();
  $('#myscreenimage').css('background-image', 'none').hide();
  //Check for V1 or V2
  if (report.location.indexOf('https://cloud.coveo.com') == -1) {
    report.version = "V2";
  }
  else {
    report.version = "V1";
  }
  document.getElementById('scores').innerHTML = '';
  document.getElementById('details').innerHTML = '';
  document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.';
  var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  var today = new Date();
  var checkHTML = new RegExp(/<[a-z][\s\S]*>/ig);
  let json = {
    forOrgReport: true,
    token: report.token,
    version: report.version,
    location: report.location,
    org: report.org,
    theDate: today.toLocaleDateString("en-US", options),
    allfields: [],
    querycheck: false,
    badquery: "",
    nrofrequests: 0,
    cq: [],
    filterfields: [],
    singlewordfields: [],
    singlewordfieldscontains: [],
    singlewordfieldsmatch: [],
    qpl_with_filters: [],
    allmetadatavalues: false,
    nrofextensions: 0,
    nrofdisabledextensions: 0,
    nrofpipelines: 0,
    nrerrorextensions: 0,
    nrslowextensions: 0,
    nrtimeoutextensions: 0,
    sourceids: [],
    badfields_facettolong: [],
    name: "",
    orgtype: "",
    disabledextensions: [],
    errorextensions: [],
    slowextensions: [],
    nroffields: 0,
    nrofsystemfields: 0,
    nrofcustomfields: 0,
    nroffieldsnotused: 0,
    nroffacets: 0,
    nrofsorts: 0,
    errors: "",
    thereAreErrorsOrg: false,
    thereAreErrorsSources: false,
    thereAreErrorsFields: false,
    thereAreErrorsExtensions: false,
    thereAreErrorsSearch: false,
    nroffreetext: 0,
    nroffieldscachesort: 0,
    nroffieldscachecomputed: 0,
    nroffieldscachenested: 0,
    nroffieldscachenumeric: 0,
    timeoutextensions: [],
    badfields_contains_allmeta: [],
    badfields_contains_body: [],
    badfields_contains_html: [],
    badfields_wrong_config: [],
    badfields_filtered: [],
    badfields_query: [],
    types: [],
    sourceWebWarning: false,
    containspush: false,
    containsonprem: false,
    push_without_html: [],
    normal_without_html: [],
    badfields_contains_duplicate_info: [],
    end_content_always_the_same: [],
    logerrors: 0,
    push_without_batch: [],
    logwarnings: 0,
    details: "",
    usagedetails: "",
    details_facettolong: "",
    details_alwaysthesame: "",
    details_pipelines: "",
    infra_machine: "No Access",
    infra_storage: "No Access",
    infra_storage_size: "No Access",
    infra_indexes: 0,
    infra_slices: 0,
    infra_mem_free: 0,
    infra_disk_free: 0,
    securityerrors: 0,
    mlquerysuggest: true,
    mlart: true,
    mlrecommendation: true,
    models_platformVersion: 1,
    mldne: false,
    nrofthesaurus: 0,
    EmptyHubs: false,
    det_analyticsSent: false,
    nrofqre: 0,
    nroffeatured: 0,
    docsfromsources: 0,
    nrofsources: 0,
    logwarnings: 0,
    logerrors: 0,
    notfresh: [],
    numberofsecurities: 0,
    pipelines: [],
    dimensions: [],
    topQueries: [],
    badClick: [],
    badRank: [],
    badUsage: [],
    UniqueVisit: 0,
    PerformSearch: 0,
    SearchWithClick: 0,
    ClickThroughRatio: 0,
    AverageClickRank: 0,
    RefinementQuery: 0,
    DocumentView: 0,
    AvgResponse: 0,
    NrofCaseCreationPageVisits: 0,
    NrofCaseAbandons: 0,
    NrofCaseCreations: 0,
    NrofCaseDeflections: 0,
    noscheduledsecprov: []
  };
  //Get sources
  let sourcenoschedule = [];
  document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Get Source Information.';
  try {
    getSourceInfo(json).then(function (json) {
      let requests = json.sourceids.map((source) => {
        let isPush = json.pushnames.filter(source2 => { if (source2.name == source.name) return source2.name; }).length > 0;
        if (!isPush) {
          return new Promise((resolve) => {
            getSourceSchedules(json, source.id).then(function (data) {
              if (!data) {
                sourcenoschedule.push(source.name);
              }
              resolve();
            });
          });
        }
      });

      document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Get Source - Schedule Information.';
      Promise.all(requests).then(() => {
        //.then(function(){
        json.noscheduledsources = sourcenoschedule;
        json.nrofnoschedulessources = sourcenoschedule.length;
      }).then(
        function () {
          document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Get Security Provider Information.';
          getSecurityInfo(json).then(function () {
            document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Get Extension Information.';
            getExtensionInfo(json).then(function () {
              document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Get Dimension Information.';
              getDimensionsInfo(json).then(function () {
                document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Get Node Information.';
                getNodeInfo(json).then(function () {
                  document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Get Org Information.';
                  getOrgInfo(json).then(function () {
                    document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Get Models Information.';
                    getModelsInfo(json).then(function () {
                      document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Get Metrics Information.';
                      getAnalyticsMetricsInfo(json).then(function () {
                        document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Get Analytics Information.';
                        getAnalyticsMetricsDetails(json).then(function () {
                          document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Get Analytics Information.';
                          getTopQueriesInfo(json).then(function () {
                            document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Get Analytics Usage Information.';
                            getUsageInfo(json).then(function () {

                              document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Get Field Information.';
                              getAllFields(json).then(function (data) {
                                //data is all the fields
                                if (data) {
                                  json.allfields = data;
                                  let fieldsnotused = [];
                                  json.nroffields = data.length;
                                  json.nrofsystemfields = 0;
                                  json.nrofcustomfields = 0;
                                  json.allmetadatavalues = false;
                                  json.nroffieldsnotused = 0;
                                  json.nroffacets = 0;
                                  json.nroffreetext = 0;
                                  json.nrofsorts = 0;
                                  json.nroffieldscachesort = 0;
                                  json.nroffieldscachecomputed = 0;
                                  json.nroffieldscachenested = 0;
                                  json.nroffieldscachenumeric = 0;
                                  data.map((field) => {
                                    if (field.system) {
                                      json.nrofsystemfields += 1;
                                    }
                                    else {
                                      json.nrofcustomfields += 1;
                                    }
                                    if (field.sources.length == 0) {
                                      json.nroffieldsnotused += 1;
                                      fieldsnotused.push(field.name);
                                    }
                                    else {
                                      //Only when field is used
                                      if (field.name.toLowerCase() == "allmetadatavalues") {
                                        //json.allmetadatavalues = true;
                                        //We check it during the execution of the queries
                                      }
                                      if (field.facet || field.multiValueFacet) {
                                        json.nroffacets += 1;
                                      }
                                      if (field.sort) {
                                        json.nrofsorts += 1;
                                      }
                                      if (field.useCacheForSort) {
                                        json.nroffieldscachesort += 1;
                                      }
                                      if (field.useCacheForComputedFacet) {
                                        json.nroffieldscachecomputed += 1;
                                      }
                                      if (field.useCacheForNestedQuery) {
                                        json.nroffieldscachenested += 1;
                                        //Check if field is numeric, if not add a warning
                                        if (field.type != "LONG") {
                                          //Check if field starts with sf, if so ignore
                                          if (!field.name.toLowerCase().startsWith("sf")) {
                                            json.badfields_wrong_config.push("<b>" + field.name + "</b>: is a nested query field, <br>but not of type Int 32 (Long). <br>Performance will suffer.<BR>");
                                          }
                                        }
                                      }
                                      if (field.useCacheForNumericQuery) {
                                        json.nroffieldscachenumeric += 1;
                                      }
                                      if (field.mergeWithLexicon) {
                                        json.nroffreetext += 1;
                                      }
                                    }
                                  });
                                }


                              }).then(function () {
                                document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Executing queries and checking usage.';
                                let requestsQ = json.sourceids.map((source) => {
                                  return new Promise((resolve) => {
                                    let aq = '@source=="' + source.name + '"';
                                    executeQuery("", aq, json, "thereAreErrorsFields").then(function (data) {
                                      if (data) {
                                        //We get results back investigate them for misuse in fields
                                        let tresholdFacet = 150;
                                        let tresholdLongText = 500;
                                        let pushWithoutHtml = true;

                                        let isPush = json.pushnames.filter(source2 => { if (source2.name == source.name) return source2.name; }).length > 0;
                                        let endcontent = [];
                                        data.results.map((result) => {
                                          if (result.hasHtmlVersion) {
                                            pushWithoutHtml = false;
                                          }
                                          let longcontent = "";
                                          let otherlargefield = "";
                                          Object.keys(result.raw).map((field) => {
                                            //Check if field is multivalue or facet
                                            let content = result.raw[field];
                                            if (Array.isArray(content)) {
                                              //Means Multi Value Facet
                                              content.map((fieldcontent) => {
                                                if (fieldcontent.length > tresholdFacet) {
                                                  json.badfields_facettolong.push(field);
                                                  if (json.details_facettolong.indexOf(field) == -1) {
                                                    json.details_facettolong += "Source: <b>" + source.name + "</b><br>";
                                                    json.details_facettolong += "Field: <b>" + field + "</b>, content:<BR>";
                                                    json.details_facettolong += fieldcontent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "<BR><BR>";
                                                  }
                                                }
                                                //Check allfieldvalues script
                                                if (fieldcontent.includes("crawler") && fieldcontent.includes("converter") && fieldcontent.includes("mapping")) {
                                                  json.allmetadatavalues = true;
                                                  json.badfields_contains_allmeta.push(field + " (Source: " + source.name + ")");
                                                }
                                                //Check html tags in field
                                                fieldcontent = fieldcontent.replace(/<br \/>/g, "");
                                                if (checkHTML.test(fieldcontent)) {
                                                  json.badfields_contains_html.push(field);
                                                }
                                              });
                                            }
                                            else {
                                              if (content.constructor === String) {

                                                //Is it a normal facet
                                                let fieldinfo = json.allfields.filter(fieldi => { if (fieldi.name == field && (fieldi.facet || fieldi.multiValueFacet)) return fieldi.name; }).length;
                                                if (fieldinfo > 0) {
                                                  let comment = '';
                                                  if (content.length > tresholdFacet) {
                                                    //Check if content contains ; --> delimiter
                                                    if (content.indexOf(';') != -1) {
                                                      comment = '<b><i>Field content contains a delimiter, configure the field as MultiValue Facet or disable it as a Facet.</b></i><br>';
                                                    }
                                                    else {

                                                    }
                                                    json.badfields_facettolong.push(field);
                                                    if (json.details_facettolong.indexOf(field) == -1) {
                                                      json.details_facettolong += "Source: <b>" + source.name + "</b><br>" + comment;
                                                      json.details_facettolong += "Field: <b>" + field + "</b>, content:<BR>";
                                                      json.details_facettolong += content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "<BR><BR>";
                                                    }
                                                  }
                                                }
                                                //Check allfieldvalues script
                                                if (content.includes("crawler") && content.includes("converter") && content.includes("mapping")) {
                                                  json.allmetadatavalues = true;
                                                  json.badfields_contains_allmeta.push(field + " (Source: " + source.name + ")");
                                                }
                                                //Check HTML tags and long fields
                                                fieldinfo = json.allfields.filter(fieldi => { if (fieldi.name == field && (fieldi.mergeWithLexicon)) return fieldi.name; }).length;
                                                if (fieldinfo > 0) {
                                                  //Check for same end of content
                                                  if (content.length > (tresholdFacet * 2)) {
                                                    if (field in endcontent) {
                                                      if (endcontent[field].content != content.substring(content.length - (tresholdFacet * 2))) {
                                                        endcontent[field].diff = true;

                                                      }
                                                    } else {
                                                      endcontent[field] = { diff: false, field: field, content: content.substring(content.length - (tresholdFacet * 2)) };
                                                    }
                                                  }
                                                  //Check if duplicate fields, only problem when they are free text searchable
                                                  if (content.length > tresholdLongText) {
                                                    if (longcontent != "") {
                                                      if (longcontent == content) {
                                                        json.badfields_contains_duplicate_info.push(field + "<br>also in: " + otherlargefield);
                                                      }
                                                    } else {
                                                      longcontent = content;
                                                      otherlargefield = field;
                                                    }
                                                  }
                                                  //Check html tags in field
                                                  content = content.replace(/<br \/>/g, "");
                                                  if (checkHTML.test(content)) {
                                                    json.badfields_contains_html.push(field);
                                                  }
                                                }
                                                //Check FirstCentences inside field
                                                //Check html tags in field
                                                /* let firstSentence = result.firstSentences.replace("...", "");
                                                 if (content.search(new RegExp(firstSentence, "i")) != -1) {
                                                   json.badfields_contains_body.push(field);
                                                 }*/

                                              }
                                            }
                                          });
                                        });
                                        if (isPush && pushWithoutHtml) {
                                          json.push_without_html.push(source.name);
                                        }
                                        if (!isPush && pushWithoutHtml) {
                                          json.normal_without_html.push(source.name);
                                        }
                                        let containsSameEnds = Object.keys(endcontent).filter((field) => { if (!endcontent[field].diff) return field; });
                                        if (containsSameEnds.length > 0) {
                                          json.end_content_always_the_same.push(source.name + "<br>in: " + containsSameEnds.join(', ') + "");
                                          json.details_alwaysthesame += "Source: <b>" + source.name + "</b><br>";
                                          let contains = Object.keys(endcontent).filter((field) => { if (!endcontent[field].diff) return endcontent[field]; }).map((field) => {
                                            json.details_alwaysthesame += "Field: <b>" + endcontent[field].field + "</b>, ends with:<BR>";
                                            json.details_alwaysthesame += endcontent[field].content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "<BR><BR>";
                                          });
                                        }
                                      }
                                      resolve();
                                    });
                                  });
                                });
                                executeSequentially(requestsQ).then(() => {
                                  //.then(function(){
                                  json.badfields_contains_allmeta = [...new Set(json.badfields_contains_allmeta)].sort(caseInsensitiveSort);
                                  json.badfields_contains_html = [...new Set(json.badfields_contains_html)].sort(caseInsensitiveSort);
                                  json.badfields_facettolong = [...new Set(json.badfields_facettolong)].sort(caseInsensitiveSort);
                                  json.badfields_contains_body = [...new Set(json.badfields_contains_body)].sort(caseInsensitiveSort);
                                  json.badfields_contains_duplicate_info = [...new Set(json.badfields_contains_duplicate_info)].sort(caseInsensitiveSort);
                                }).then(function () {
                                  let requestsQ = json.sourceids.map((source) => {
                                    return new Promise((resolve) => {
                                      let aq = '@source=="' + source.name + '"';
                                      executeQuery("@indexeddate>now-60d", aq, json, "thereAreErrorsSources").then(function (data) {
                                        document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Executing queries (Source: ' + source.name + ') and checking freshness (last 60 days).';
                                        if (data) {
                                          if (data.totalCount == 0) {
                                            json.notfresh.push(source.name);
                                          }
                                        }
                                        resolve();
                                      });
                                    });
                                  });
                                  executeSequentially(requestsQ).then(() => {
                                    document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Check Push Batch calls in Log Browser.';
                                    let requestsQ = json.sourceids.map((source) => {
                                      let isPush = json.pushnames.filter(source2 => { if (source2.name == source.name) return source2.name; }).length > 0;
                                      if (isPush) {
                                        return new Promise((resolve) => {
                                          let aq = JSON.stringify({ sourcesIds: [source.id] });
                                          executeLogBrowserQuery(aq, json).then(function (data) {
                                            if (data) {
                                              let found = false;
                                              if ('operations' in data) {
                                                if ('BATCH_FILE' in data.operations) {
                                                  found = true;
                                                }
                                              }
                                              if (!found) {
                                                json.push_without_batch.push(source.name);
                                              }
                                            }
                                            resolve();
                                          });
                                        });
                                      }
                                    });
                                    executeSequentially(requestsQ).then(() => {
                                      executeLogBrowserQuery("", json).then(function (data) {
                                        if (data) {
                                          if ('results' in data) {
                                            if ('WARNING' in data.results) {
                                              json.logwarnings = data.results['WARNING'];
                                            }
                                            if ('ERROR' in data.results) {
                                              json.logerrors = data.results['ERROR'];
                                            }
                                          }

                                        }
                                      }).then(function () {
                                        document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Get Query Pipeline Info Information.';
                                        getQueryPipelinesInfo(json).then(function (json) {
                                          let requests = json.pipelines.map((pipes) => {
                                            return new Promise((resolve) => {
                                              getQueryPipelinesDetails(json, pipes).then(function (data) {
                                                resolve();
                                              });
                                            });
                                          });
                                          document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Checking Filter and Single words fields with a query.';
                                          executeSequentially(requests).then(() => {
                                            //We need to check if we got any filterfields
                                            //If so we need to check if they contain multi words
                                            json.filterfields = [...new Set(json.filterfields)];
                                            let requestsQ = json.filterfields.map((field) => {
                                              return new Promise((resolve) => {
                                                let aq = field;
                                                let cleanfield = field.replace('@', '');
                                                let multiwords = false;
                                                executeQuery("", aq, json, "thereAreErrorsFields").then(function (data) {
                                                  if (data) {
                                                    data.results.map((result) => {
                                                      if (result.raw[cleanfield]) {
                                                        if (isNaN(result.raw[cleanfield])) {
                                                          //Check if it is an array, if so trim all the results
                                                          if (Array.isArray(result.raw[cleanfield])) {
                                                            result.raw[cleanfield].map((val) => {
                                                              if (val.trim().indexOf(' ') != -1) {
                                                                multiwords = true;
                                                                json.badfields_filtered.push(field);
                                                              }

                                                            });
                                                          }
                                                          else {
                                                            if (result.raw[cleanfield].trim().indexOf(' ') != -1) {
                                                              multiwords = true;
                                                              json.badfields_filtered.push(field);
                                                            }
                                                          }

                                                        }
                                                      }
                                                    });
                                                  }
                                                  resolve();
                                                });
                                              });
                                            });
                                            json.singlewordfields = [...new Set(json.singlewordfields)];
                                            json.singlewordfieldscontains = [...new Set(json.singlewordfieldscontains)];
                                            json.singlewordfieldsmatch = [...new Set(json.singlewordfieldsmatch)];
                                            let requestsSQ = json.singlewordfields.map((field) => {
                                              return new Promise((resolve) => {
                                                let aq = field;
                                                let cleanfield = field.replace('@', '');
                                                let multiwords = false;
                                                let wehaveresults = false;
                                                let examples = new Set();
                                                let badexamples = new Set();
                                                executeQuery("", aq, json, "thereAreErrorsFields").then(function (data) {
                                                  //json.badquery += "Checking for Field: <b>" + field + "</b><br>";
                                                  if (data) {
                                                    //json.badquery += "Checking for Field: <b>" + field + "</b>WE HAVE DATA<br>";
                                                    data.results.map((result) => {
                                                      if (result.raw[cleanfield]) {
                                                        wehaveresults = true;
                                                        if (isNaN(result.raw[cleanfield])) {
                                                          //Check if it is an array, if so trim all the results
                                                          if (Array.isArray(result.raw[cleanfield])) {
                                                            result.raw[cleanfield].map((val) => {
                                                              examples.add(val.trim());
                                                              if (val.trim().indexOf(' ') != -1) {
                                                                multiwords = true;
                                                                badexamples.add(val.trim());
                                                              }

                                                            });
                                                          }
                                                          else {
                                                            examples.add(result.raw[cleanfield].trim());
                                                            if (result.raw[cleanfield].trim().indexOf(' ') != -1) {
                                                              multiwords = true;
                                                              badexamples.add(result.raw[cleanfield].trim());
                                                            }
                                                          }

                                                        }
                                                        else {
                                                          examples.add(result.raw[cleanfield]);
                                                        }
                                                      }
                                                    });
                                                  }
                                                  let containsOperator = false;
                                                  let matchOperator = false;
                                                  if (json.singlewordfieldscontains.includes(field)) {
                                                    containsOperator = true;
                                                  }
                                                  if (json.singlewordfieldsmatch.includes(field)) {
                                                    matchOperator = true;
                                                  }
                                                  // json.badquery += "Checking for Field: <b>" + field + "</b>RESULTS: "+wehaveresults+"/"+multiwords+"<BR>";
                                                  //                                        problems.add("<div class=myexpr>Expression:</div><div class=myexprval><span class='mycode'>" + result[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></div><div class=myexpr>Field:</div><div class=myexprval><b>" + field + "</b></div><div class=myexprcomm>Numeric query, but the field does not have UseCacheForNumericQuery enabled.</div>");
                                                  //problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + result[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Field:</td><td class=myexprval><b>" + sortfield + "</b></td></tr><tr><td colspan=2 class=myexprcomm>Sorting, but the field does not have UseCacheForSort enabled.</td></tr></table>");
                                                  //badexamples.add([...examples]);
                                                  examples.forEach(badexamples.add, badexamples);
                                                  let comment = '';
                                                  if (json.allfields.length == 0) {
                                                    comment = '<br><b>We could not detect if the field is already a facet. Check it in your Coveo Org.</b>';
                                                  }
                                                  if (!wehaveresults) {
                                                    if (matchOperator) {
                                                      json.badquery = json.badquery.replaceAll(">Facet Field: <b>" + "==" + field + "</b><br>Does it only contains single words? Use = .<",
                                                        ">Facet Field: </td><td class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexprval><b>EMPTY</b></td></tr><tr><td colspan=2 class=myexprcomm>Is used with a == query, but we could not check the content from the index.<br>Check your content, if it contains single words, use = instead.<br>When cardinality is < 10.000, create a Facet." + comment + "</b></td></tr><");
                                                      json.badquery = json.badquery.replaceAll(">Field: <b>" + "==" + field + "</b><br>Do you really want to use Contains (=) or are you filtering? <br>If you want to filter, use == (exact match), which is faster.<",
                                                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexprval><b>EMPTY</b></td></tr><tr><td  colspan=2 class=myexprcomm>Is used with a == query, but we could not check the content from the index.<br>Check your content, if it contains single words, use = instead.<br>When cardinality is < 10.000, create a Facet." + comment + "</td></tr><");
                                                      json.badquery = json.badquery.replaceAll(">Field: <b>" + "==" + field + "</b><br>Are you using a lot of exact matches and are you filtering?<br>Consider to make the field a Facet/Multivalue Facet.<br>If your field content only contains single words, use the = operator (No need to create a facet for it).<",
                                                        ">Field:</td><td  class=myexprval> <b>" + field + "</b></td></tr><tr><td  class=myexpr>Values in the index: </td><td class=myexprval><b>EMPTY</b></td></tr><tr><td colspan=2 class=myexprcomm>Is used with a == query, but we could not check the content from the index.<br>Check your content, if it contains single words, use = instead.<br>When cardinality is < 10.000, create a Facet." + comment + "</td></tr><");
                                                    }
                                                    if (containsOperator) {
                                                      json.badquery = json.badquery.replaceAll(">Facet Field: <b>" + "=" + field + "</b><br>Does it only contains single words? Use = .<",
                                                        ">Facet Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index:</td><td class=myexprval><b>EMPTY</b></td></tr><tr><td  colspan=2 class=myexprcomm>Is used with a = (contains) query, but we could not check the content from the index.<br>Check your content, if it contains single words, use = instead.<br>When cardinality is < 10.000, create a Facet." + comment + "</td></tr><");
                                                      json.badquery = json.badquery.replaceAll(">Field: <b>" + "=" + field + "</b><br>Do you really want to use Contains (=) or are you filtering? <br>If you want to filter, use == (exact match), which is faster.<",
                                                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexprval><b>EMPTY</b></td></tr><tr><td  colspan=2 class=myexprcomm>Is used with a = query, but we could not check the content from the index.<br>Check your content, if it contains single words, use = instead.<br>When cardinality is < 10.000, create a Facet." + comment + "</td></tr><");
                                                      json.badquery = json.badquery.replaceAll(">Field: <b>" + "=" + field + "</b><br>Are you using a lot of exact matches and are you filtering?<br>Consider to make the field a Facet/Multivalue Facet.<br>If your field content only contains single words, use the = operator (No need to create a facet for it).<",
                                                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td  class=myexpr>Values in the index: </td><td class=myexprval><b>EMPTY</b></td></tr><tr><td colspan=2 class=myexprcomm>Is used with a == query, but we could not check the content from the index.<br>Check your content, if it contains single words, use = instead.<br>When cardinality is < 10.000, create a Facet." + comment + "</td></tr><");
                                                    }

                                                  }
                                                  if (!multiwords && wehaveresults) {
                                                    if (matchOperator) {
                                                      json.badfields_query.push(field);
                                                      json.badquery = json.badquery.replaceAll(">Facet Field: <b>" + "==" + field + "</b><br>Does it only contains single words? Use = .<",
                                                        ">Facet Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexpr><b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td  colspan=2 class=myexprcomm>Is used with a == query.<br>Based on the first 500 results, it only contains single words. <b>Use = instead.</b><br>When cardinality is < 10.000, create a Facet." + comment + "</td></tr><");
                                                      json.badquery = json.badquery.replaceAll(">Field: <b>" + "==" + field + "</b><br>Do you really want to use Contains (=) or are you filtering? <br>If you want to filter, use == (exact match), which is faster.<",
                                                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexprval><b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td  colspan=2 class=myexprcomm>Is used with a == query.<br>Based on the first 500 results, it only contains single words. <b>Use = instead.</b><br>When cardinality is < 10.000, create a Facet." + comment + "</td></tr><");
                                                      json.badquery = json.badquery.replaceAll(">Field: <b>" + "==" + field + "</b><br>Are you using a lot of exact matches and are you filtering?<br>Consider to make the field a Facet/Multivalue Facet.<br>If your field content only contains single words, use the = operator (No need to create a facet for it).<",
                                                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index:</td><td class=myexprval> <b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td colspan=2 class=myexprcomm>Is used with a == query.<br>Based on the first 500 results, it only contains single words. <b>Use = instead.</b><br>When cardinality is < 10.000, create a Facet." + comment + "</td></tr><");
                                                      //json.badquery += "Contents: <b>" + [...examples].join(', ') + "</b><br>Is used with a == query.<br>Based on the first 500 results, it only contains single words. Use = instead.<BR><BR>";
                                                    }
                                                    if (containsOperator) {
                                                      json.badquery = json.badquery.replaceAll(">Facet Field: <b>" + "=" + field + "</b><br>Does it only contains single words? Use = .<",
                                                        ">Facet Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexprval><b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td  colspan=2 class=myexprcomm>Is used with a = query.<br>Based on the first 500 results, the content contains single words. Keep it like this!</td></tr><");
                                                      json.badquery = json.badquery.replaceAll(">Field: <b>" + "=" + field + "</b><br>Do you really want to use Contains (=) or are you filtering? <br>If you want to filter, use == (exact match), which is faster.<",
                                                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexprval><b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td colspan=2 class=myexprcomm>Is used with a = query.<br>Based on the first 500 results, the content contains single words. Keep it like this!</td></tr><");
                                                      json.badquery = json.badquery.replaceAll(">Field: <b>" + "=" + field + "</b><br>Are you using a lot of exact matches and are you filtering?<br>Consider to make the field a Facet/Multivalue Facet.<br>If your field content only contains single words, use the = operator (No need to create a facet for it).<",
                                                        ">Field:</td><td  class=myexprval> <b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexprval><b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td colspan=2 class=myexprcomm>Is used with a = query.<br>Based on the first 500 results, the content contains single words. Keep it like this!</td></tr><");

                                                    }
                                                  }
                                                  if (multiwords && wehaveresults) {
                                                    if (matchOperator) {
                                                      json.badquery = json.badquery.replaceAll(">Facet Field: <b>" + "==" + field + "</b><br>Does it only contains single words? Use = .<",
                                                        ">Facet Field:</td><td  class=myexprval> <b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index:</td><td class=myexprval><b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td  colspan=2 class=myexprcomm>Is used with a == query.<br>Based on the first 500 results, the content contains multiple words. Keep it like this!</td></tr><");
                                                      json.badquery = json.badquery.replaceAll(">Field: <b>" + "==" + field + "</b><br>Do you really want to use Contains (=) or are you filtering? <br>If you want to filter, use == (exact match), which is faster.<",
                                                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexprval>Values in the index:</td><td class=myexprval> <b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td colspan=2 class=myexprcomm>Based on the first 500 results, the content contains multiple words. Keep it like this!</td></tr><");
                                                      json.badquery = json.badquery.replaceAll(">Field: <b>" + "==" + field + "</b><br>Are you using a lot of exact matches and are you filtering?<br>Consider to make the field a Facet/Multivalue Facet.<br>If your field content only contains single words, use the = operator (No need to create a facet for it).<",
                                                        ">Field:</td><td class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index:</td><td class=myexprval> <b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td colspan=2 class=myexprcomm>Consider to make the field a Facet/Multivalue Facet (When cardinality is < 10.000)." + comment + "</td></tr><");
                                                    }
                                                    if (containsOperator) {
                                                      json.badquery = json.badquery.replaceAll(">Facet Field: <b>" + "=" + field + "</b><br>Does it only contains single words? Use = .<",
                                                        ">Facet Field:</td><td  class=myexprval> <b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexprval><b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td  colspan=2 class=myexprcomm>Is used with a = query.<br>This is not an exact match, but a <b>contains</b> statement.<br>Are you filtering on this field? Consider to use == instead.<br>When cardinality is < 10.000, create a Facet." + comment + "</td></tr><");
                                                      json.badquery = json.badquery.replaceAll(">Field: <b>" + "=" + field + "</b><br>Do you really want to use Contains (=) or are you filtering? <br>If you want to filter, use == (exact match), which is faster.<",
                                                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexprval>Values in the index: </td><td class=myexprval><b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td colspan=2 class=myexprcomm>Is used with a = query.<br>This is not an exact match, but a <b>contains</b> statement.<br>Are you filtering on this field? Consider to make the field a Facet/Multivalue Facet and use == instead." + comment + "</td></tr><");
                                                      json.badquery = json.badquery.replaceAll(">Field: <b>" + "=" + field + "</b><br>Are you using a lot of exact matches and are you filtering?<br>Consider to make the field a Facet/Multivalue Facet.<br>If your field content only contains single words, use the = operator (No need to create a facet for it).<",
                                                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index:</td><td class=myexprval> <b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td colspan=2 class=myexprcomm>Is used with a = query.<br>This is not an exact match, but a <b>contains</b> statement.<br>Are you filtering on this field? Consider to make the field a Facet/Multivalue Facet and use == instead." + comment + "</td></tr><");

                                                    }
                                                  }
                                                  resolve();
                                                });
                                              });
                                            });
                                            requestsQ = requestsQ.concat(requestsSQ);
                                            executeSequentially(requestsQ).then(
                                              function () {
                                                json.qpl_with_filters = [...new Set(json.qpl_with_filters)];
                                                json.badfields_filtered = [...new Set(json.badfields_filtered)];
                                                json.badfields_query = [...new Set(json.badfields_query)];
                                                SendMessage({ type: 'saveOrg', json: json });
                                                document.getElementById('loadTitle').innerHTML = 'Currently loading. Please wait.<br>Generating Report';
                                                processReport(json);
                                              });
                                          });
                                        });
                                      });
                                    });
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        }
      );

    });
  }
  catch{
    document.getElementById('loadTitle').innerHTML = 'Error getting the report. Reload page and try again!';
  }
}

let errorMessage = () => {
  document.getElementById('loadTitle').innerHTML = 'Error getting the report. Do you have proper access? Reload page and try again!';
  return;
};

let getState = () => {
  SendMessage('getState', processState);
};

let getStateForPush = () => {
  SendMessage('getState', processStateForPush);
};

let getStateForSFDC = () => {
  SendMessage('getState', processStateForSFDC);
};

function toggleTracker() {
  let enable = $('#setSearchTracker input').prop('checked') ? true : false;
  SendMessage({ type: 'enablesearch', enable });
}

function reset() {
  //reset all parameters
  $('#instructions').show();
  $('#myscreenimage').css('background-image', 'none').hide();
  $('#setSearchTracker input').prop('checked', false);
  $('#push').attr("disabled", true);
  //$('#showSFDC').attr("disabled", true);
  document.getElementById('scores').innerHTML = '';
  document.getElementById('details').innerHTML = '';

  SendMessage('reset', getState);
  window.close();
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

function setScreenShot(dataurl) {
  $('#myscreenimage').css('background-image', 'url(' + dataurl + ')').show();
}

function setSFDC(values) {
  for (let [curkey, curvalue] of Object.entries(values)) {
    SendMessage({ type: 'saveitemSFDC', item: curkey, value: curvalue });
    if (curkey != 'allfields') {
      $('#' + curkey).val(curvalue);
    }
  }
}

if (chrome && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener(
    function (reportData/*, sender, sendResponse*/) {

      /*      if (reportData === 'disableOrg') {
              console.log("disabling org button");
              $('#getOrgReport').attr("disabled", true);
            }*/
      /* if (reportData.type=='gotLocationBackground'){
         SendMessage({ type: 'getLocation', global: reportData.global });
       }*/
      if (reportData.type === 'gotLocation') {
        let activeTab = '';
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
          activeTab = tabs[0].id;

          if (activeTab == reportData.tabid) {
            //console.log("gotLocation");
            try {
              if (reportData.json.org == '') {
                $('#getOrgReport').attr("disabled", true);
              }
              else {
                $('#getReport').attr("disabled", true);
                $('#getPerformanceReport').attr("disabled", true);

              }
            } catch
            {

            }
          }
        });
      }
      else if (reportData.type === 'gotNumbersBackground') {
        //SendMessage({ type: 'saveOrg', json: reportData });
                processReport(reportData);
      }
      else if (reportData.type === 'gotNumbers') {
        reportData.json.badquery = '';
        //Check searchToken
        var jsontoken;
        try {
          jsontoken = JSON.parse(reportData.json.searchToken);
          if ('filter' in jsontoken) {
            console.log("Checking: " + jsontoken['filter']);
            reportData.json = checkQueryUse("Search Token Filter Query", "", jsontoken['filter'], reportData.json, false, true, true, null);
          }
        }
        catch{
        }
        //We now need to see if we have queries, if so we need to re-execute them with debug=1, then if the executionReport is available use that
        reportData.json.query = [...new Set(reportData.json.query)];
        if (reportData.json.query.length == 0) {
          reportData.json.badquery += "<h4><b>Search Tracker was NOT enabled or we could not catch queries. No queries recorded!!!</b></h4>";
          $('#makequery').removeClass('mod-hidden');
          $('#loading').hide();
          setTimeout(() => {
            $('#makequery').addClass('mod-hidden');
          }, 2999);
          return;

        }
        let lastquery = undefined;
        let requestsNewQuery = reportData.json.query.map((query) => {
          //Create a promise to execute the query again
          lastquery = query;
          if (query.q) {
            return new Promise((resolve) => {
              executeQueryUI("", "", reportData.json, "thereAreErrorsFields", query, false).then(function (data) {
                if (data) {
                  //Check if we have a executionReport, if not use the other data for analysis
                  let executionReport = false;
                  if (data['pipeline']!='default') {
                    reportData.json['usingPipeline'] = true;
                  }
                  if ('executionReport' in data) {
                    let queryExecuted = "<table mytable><tr><td colspan=2 class=myexprcomm><b>Executed Query (executionReport)</b></td></tr>";
                    data['executionReport'].children.map((child) => {
                      if (child['description'] == 'Send query to index' || child['name'] == 'IndexOperationV8' || child['name'] == 'IndexOperationV7') {
                        executionReport = true;
                        //ExecutionReport use that
                        //Check the basics
                        if (child['result']['in'].BasicExpression) {
                          console.log("Checking: " + child['result']['in'].BasicExpression);
                          queryExecuted += "<tr><td class=myexpr>Basic:</td><td class=myexprval><span class='mycode'>" + child['result']['in'].BasicExpression + "</span></td></tr>";
                          reportData.json = checkQueryUse("Basic Query", "", child['result']['in'].BasicExpression, reportData.json, true, false, true, false, query);
                        }
                        if (child['result']['in'].ConstantExpression) {
                          console.log("Checking: " + child['result']['in'].ConstantExpression);
                          queryExecuted += "<tr><td class=myexpr>Constant:</td><td class=myexprval><span class='mycode'>" + child['result']['in'].ConstantExpression + "</span></td></tr>";
                          reportData.json = checkQueryUse("Constant Query", "", child['result']['in'].ConstantExpression, reportData.json, false, true, true, false, query);
                        }
                        if (child['result']['in'].AdvancedExpression) {
                          console.log("Checking: " + child['result']['in'].AdvancedExpression);
                          queryExecuted += "<tr><td class=myexpr>Advanced:</td><td class=myexprval><span class='mycode'>" + child['result']['in'].AdvancedExpression + "</span></td></tr>";
                          reportData.json = checkQueryUse("Advanced Query", "", child['result']['in'].AdvancedExpression, reportData.json, false, false, false, false, query);
                        }
                        if (child['result']['in'].DisjunctionExpression) {
                          console.log("Checking: " + child['result']['in'].DisjunctionExpression);
                          queryExecuted += "<tr><td class=myexpr>Disjunction:</td><td class=myexprval><span class='mycode'>" + child['result']['in'].DisjunctionExpression + "</span></td></tr>";
                          reportData.json = checkQueryUse("Disjunction Query", "", child['result']['in'].DisjunctionExpression, reportData.json, false, false, false, false, query);
                        }
                        //Check Ranking expressions
                        if (child['result']['in'].RankingExpressions) {
                          child['result']['in'].RankingExpressions.map((rank) => {
                            if (rank.Expression) {
                              console.log("Checking: " + rank.Expression);
                              queryExecuted += "<tr><td class=myexpr>Ranking:</td><td class=myexprval><span class='mycode'>" + rank.Expression + ", constant: " + rank.IsConstant + "</span></td></tr>";
                              reportData.json = checkQueryUse("Ranking Expression", "", rank.Expression, reportData.json, false, rank.IsConstant, false, true, query);
                            }

                          });
                        }
                        queryExecuted += "</table><br>";
                        reportData.json.badquery += "<h4>Query summary:</h4><br>" + queryExecuted;

                      }
                    });
                  }
                  if (!executionReport) {
                    //No execution report
                    //Check the basics
                    let queryExecuted = "<table class=mytable><tr><td colspan=2 class=myexprcomm><b>Executed Query</b></td></tr>";
                    if (data.basicExpression) {
                      console.log("Checking: " + data.basicExpression);
                      queryExecuted += "<tr><td class=myexpr>Basic:</td><td class=myexprval><span class='mycode'>" + data.basicExpression + "</span></td></tr>";
                      reportData.json = checkQueryUse("Basic Query", "", data.basicExpression, reportData.json, true, false, true, false, query);
                    }
                    if (data.constantExpression) {
                      console.log("Checking: " + data.constantExpression);
                      queryExecuted += "<tr><td class=myexpr>Constant:</td><td class=myexprval><span class='mycode'>" + data.constantExpression + "</span></td></tr>";
                      reportData.json = checkQueryUse("Constant Query", "", data.constantExpression, reportData.json, false, true, true, false, query);
                    }
                    if (data.advancedExpression) {
                      console.log("Checking: " + data.advancedExpression);
                      queryExecuted += "<tr><td class=myexpr>Advanced:</td><td class=myexprval><span class='mycode'>" + data.advancedExpression + "</span></td></tr>";
                      reportData.json = checkQueryUse("Advanced Query", "", data.advancedExpression, reportData.json, false, false, false, false, query);
                    }
                    if (data.disjunctionExpression) {
                      console.log("Checking: " + data.disjunctionExpression);
                      queryExecuted += "<tr><td class=myexpr>Disjunction:</td><td class=myexprval><span class='mycode'>" + data.disjunctionExpression + "</span></td></tr>";
                      reportData.json = checkQueryUse("Disjunction Query", "", data.disjunctionExpression, reportData.json, false, false, false, false, query);
                    }
                    //Check Ranking expressions
                    if (data.rankingExpressions) {
                      data.rankingExpressions.map((rank) => {
                        if (rank.Expression) {
                          console.log("Checking: " + rank.expression);
                          queryExecuted += "<tr><td class=myexpr>Ranking:</td><td class=myexprval><span class='mycode'>" + rank.expression + ", constant: " + rank.isConstant + "</span></td></tr>";
                          reportData.json = checkQueryUse("Ranking Expression", "", rank.expression, reportData.json, false, rank.isConstant, false, true, query);
                        }

                      });
                    }
                    queryExecuted += "</table><br>";
                    reportData.json.badquery += "<h4>Query summary:</h4><br>" + queryExecuted;

                  }
                }
                resolve();
              });
            });
          }
        });
        executeSequentially(requestsNewQuery).then(
          function () {
            //We now need to check if the cq queries are all the same. If not: add a warning
            if (reportData.json.cq.length > 0) {
              let cq = [...new Set(reportData.json.cq)];
              if (cq.length > 1) {
                //cq.map((query) => {
                //console.log("Checking BAD: " + query);
                reportData.json.badquery += "<hr><h4>Query analysis of CQ:</h4><span class='mycode'>" + cq.join('<hr><br>') + "</span><br>Constant Query is changing during calls.<br>Are you using CQ in a proper way?<br><BR>";
                reportData.json.querycheck = true;

                //});
              }
            }
            //We now need to check if the dimensions from the analytics are the same as the ones sent in the UI
            if (reportData.json.dimensions.length > 0) {
              if (reportData.json.customData.length > 0) {
                let bad = '';
                reportData.json.dimensions.map((dim) => {
                  if (!reportData.json.customData.includes(dim)) {
                    bad += dim + "<BR>";
                  }

                });
                if (bad != '') {
                  reportData.json.baddimension = "Dimensions not found in UI code:<BR>" + bad;
                }
              }
              else {
                reportData.json.baddimension = "Dimensions in Org:<BR>" + reportData.json.dimensions.join('<BR>') + "<BR>Are not defined in UI.";
              }
            }
            if (reportData.json.dimensions.length == 0 && reportData.json.customData.length > 0) {
              reportData.json.baddimension = "Dimensions sent in UI:<BR>" + reportData.json.customData.join('<BR>') + "<BR>Are not defined in Organization.";
            }
            // Execute the queries
            //We need to check if we got any filterfields
            //If so we need to check if they contain multi words
            reportData.json.filterfields = [...new Set(reportData.json.filterfields)];

            let requestsQ = reportData.json.filterfields.map((field) => {
              return new Promise((resolve) => {
                let aq = field;
                let cleanfield = field.replace('@', '');
                let multiwords = false;
                if (lastquery == undefined) {
                  resolve();
                }
                lastquery["q"] = "";
                lastquery["aq"] = aq;
                lastquery["cq"] = "";
                lastquery["dq"] = "";
                lastquery["numberOfResults"] = 500;
                executeQueryUI("", aq, reportData.json, "thereAreErrorsFields", lastquery, true).then(function (data) {
                  if (data.results) {
                    data.results.map((result) => {
                      if (result.raw[cleanfield]) {
                        if (isNaN(result.raw[cleanfield])) {
                          //Check if it is an array, if so trim all the results
                          if (Array.isArray(result.raw[cleanfield])) {
                            result.raw[cleanfield].map((val) => {
                              if (val.trim().indexOf(' ') != -1) {
                                multiwords = true;
                                reportData.json.badfields_filtered.push(field);
                              }

                            });
                          }
                          else {
                            if (result.raw[cleanfield].trim().indexOf(' ') != -1) {
                              multiwords = true;
                              reportData.json.badfields_filtered.push(field);
                            }
                          }

                        }
                      }
                    });
                  }
                  resolve();
                });
              });
            });
            reportData.json.singlewordfields = [...new Set(reportData.json.singlewordfields)];
            reportData.json.singlewordfieldscontains = [...new Set(reportData.json.singlewordfieldscontains)];
            reportData.json.singlewordfieldsmatch = [...new Set(reportData.json.singlewordfieldsmatch)];
            let requestsSQ = reportData.json.singlewordfields.map((field) => {
              return new Promise((resolve) => {
                let aq = field;
                let cleanfield = field.replace('@', '');
                let multiwords = false;
                let wehaveresults = false;
                let examples = new Set();
                let badexamples = new Set();
                if (lastquery == undefined) {
                  resolve();
                }
                lastquery["q"] = "";
                lastquery["aq"] = aq;
                lastquery["cq"] = "";
                lastquery["dq"] = "";
                lastquery["numberOfResults"] = 500;
                executeQueryUI("", aq, reportData.json, "thereAreErrorsFields", lastquery, true).then(function (data) {
                  //json.badquery += "Checking for Field: <b>" + field + "</b><br>";
                  if (data.results) {
                    //json.badquery += "Checking for Field: <b>" + field + "</b>WE HAVE DATA<br>";
                    data.results.map((result) => {
                      if (result.raw[cleanfield]) {
                        wehaveresults = true;
                        if (isNaN(result.raw[cleanfield])) {
                          //Check if it is an array, if so trim all the results
                          if (Array.isArray(result.raw[cleanfield])) {
                            result.raw[cleanfield].map((val) => {
                              examples.add(val.trim());
                              if (val.trim().indexOf(' ') != -1) {
                                multiwords = true;
                                badexamples.add(val.trim());
                              }

                            });
                          }
                          else {
                            examples.add(result.raw[cleanfield].trim());
                            if (result.raw[cleanfield].trim().indexOf(' ') != -1) {
                              multiwords = true;
                              badexamples.add(result.raw[cleanfield].trim());
                            }
                          }

                        }
                        else {
                          examples.add(result.raw[cleanfield]);
                        }
                      }
                    });
                  }
                  let containsOperator = false;
                  let matchOperator = false;
                  if (reportData.json.singlewordfieldscontains.includes(field)) {
                    containsOperator = true;
                  }
                  if (reportData.json.singlewordfieldsmatch.includes(field)) {
                    matchOperator = true;
                  }
                  // json.badquery += "Checking for Field: <b>" + field + "</b>RESULTS: "+wehaveresults+"/"+multiwords+"<BR>";
                  //                                        problems.add("<div class=myexpr>Expression:</div><div class=myexprval><span class='mycode'>" + result[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></div><div class=myexpr>Field:</div><div class=myexprval><b>" + field + "</b></div><div class=myexprcomm>Numeric query, but the field does not have UseCacheForNumericQuery enabled.</div>");
                  //problems.add("<table class=mytable><tr><td class=myexpr>Expression:</td><td class=myexprval><span class='mycode'>" + result[0].replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + "</span></td></tr><tr><td class=myexpr>Field:</td><td class=myexprval><b>" + sortfield + "</b></td></tr><tr><td colspan=2 class=myexprcomm>Sorting, but the field does not have UseCacheForSort enabled.</td></tr></table>");
                  //badexamples.add([...examples]);
                  let comment = '';
                  if (reportData.json.allfields.length == 0) {
                    comment = '<br><b>We could not detect if the field is already a facet. Check it in your Coveo Org.</b>';
                  }

                  examples.forEach(badexamples.add, badexamples);
                  if (!wehaveresults) {
                    if (matchOperator) {
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Facet Field: <b>" + "==" + field + "</b><br>Does it only contains single words? Use = .<",
                        ">Facet Field: </td><td class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexprval><b>EMPTY</b></td></tr><tr><td colspan=2 class=myexprcomm>Is used with a == query, but we could not check the content from the index.<br>Check your content, if it contains single words, use = instead.<br>When cardinality is < 10.000, create a Facet.</b></td></tr><");
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Field: <b>" + "==" + field + "</b><br>Do you really want to use Contains (=) or are you filtering? <br>If you want to filter, use == (exact match), which is faster.<",
                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexprval><b>EMPTY</b></td></tr><tr><td  colspan=2 class=myexprcomm>Is used with a == query, but we could not check the content from the index.<br>Check your content, if it contains single words, use = instead.<br>When cardinality is < 10.000, create a Facet." + comment + "</td></tr><");
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Field: <b>" + "==" + field + "</b><br>Are you using a lot of exact matches and are you filtering?<br>Consider to make the field a Facet/Multivalue Facet.<br>If your field content only contains single words, use the = operator (No need to create a facet for it).<",
                        ">Field:</td><td  class=myexprval> <b>" + field + "</b></td></tr><tr><td  class=myexpr>Values in the index: </td><td class=myexprval><b>EMPTY</b></td></tr><tr><td colspan=2 class=myexprcomm>Is used with a == query, but we could not check the content from the index.<br>Check your content, if it contains single words, use = instead.<br>When cardinality is < 10.000, create a Facet." + comment + "</td></tr><");
                    }
                    if (containsOperator) {
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Facet Field: <b>" + "=" + field + "</b><br>Does it only contains single words? Use = .<",
                        ">Facet Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index:</td><td class=myexprval><b>EMPTY</b></td></tr><tr><td  colspan=2 class=myexprcomm>Is used with a = (contains) query, but we could not check the content from the index.<br>Check your content, if it contains single words, use = instead.<br>When cardinality is < 10.000, create a Facet." + comment + "</td></tr><");
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Field: <b>" + "=" + field + "</b><br>Do you really want to use Contains (=) or are you filtering? <br>If you want to filter, use == (exact match), which is faster.<",
                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexprval><b>EMPTY</b></td></tr><tr><td  colspan=2 class=myexprcomm>Is used with a = query, but we could not check the content from the index.<br>Check your content, if it contains single words, use = instead.<br>When cardinality is < 10.000, create a Facet." + comment + "</td></tr><");
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Field: <b>" + "=" + field + "</b><br>Are you using a lot of exact matches and are you filtering?<br>Consider to make the field a Facet/Multivalue Facet.<br>If your field content only contains single words, use the = operator (No need to create a facet for it).<",
                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td  class=myexpr>Values in the index: </td><td class=myexprval><b>EMPTY</b></td></tr><tr><td colspan=2 class=myexprcomm>Is used with a == query, but we could not check the content from the index.<br>Check your content, if it contains single words, use = instead.<br>When cardinality is < 10.000, create a Facet." + comment + "</td></tr><");
                    }

                  }
                  if (!multiwords && wehaveresults) {
                    if (matchOperator) {
                      reportData.json.badfields_query.push(field);
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Facet Field: <b>" + "==" + field + "</b><br>Does it only contains single words? Use = .<",
                        ">Facet Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexpr><b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td  colspan=2 class=myexprcomm>Is used with a == query.<br>Based on the first 500 results, it only contains single words. <b>Use = instead.<br>When cardinality is < 10.000, create a Facet." + comment + "</b></td></tr><");
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Field: <b>" + "==" + field + "</b><br>Do you really want to use Contains (=) or are you filtering? <br>If you want to filter, use == (exact match), which is faster.<",
                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexprval><b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td  colspan=2 class=myexprcomm>Is used with a == query.<br>Based on the first 500 results, it only contains single words. <b>Use = instead.<br>When cardinality is < 10.000, create a Facet." + comment + "</b></td></tr><");
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Field: <b>" + "==" + field + "</b><br>Are you using a lot of exact matches and are you filtering?<br>Consider to make the field a Facet/Multivalue Facet.<br>If your field content only contains single words, use the = operator (No need to create a facet for it).<",
                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index:</td><td class=myexprval> <b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td colspan=2 class=myexprcomm>Is used with a == query.<br>Based on the first 500 results, it only contains single words. <b>Use = instead.<br>When cardinality is < 10.000, create a Facet." + comment + "</b></td></tr><");
                      //json.badquery += "Contents: <b>" + [...examples].join(', ') + "</b><br>Is used with a == query.<br>Based on the first 500 results, it only contains single words. Use = instead.<BR><BR>";
                    }
                    if (containsOperator) {
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Facet Field: <b>" + "=" + field + "</b><br>Does it only contains single words? Use = .<",
                        ">Facet Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexprval><b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td  colspan=2 class=myexprcomm>Is used with a = query.<br>Based on the first 500 results, the content contains single words. Keep it like this!</td></tr><");
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Field: <b>" + "=" + field + "</b><br>Do you really want to use Contains (=) or are you filtering? <br>If you want to filter, use == (exact match), which is faster.<",
                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexprval><b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td colspan=2 class=myexprcomm>Is used with a = query.<br>Based on the first 500 results, the content contains single words. Keep it like this!</td></tr><");
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Field: <b>" + "=" + field + "</b><br>Are you using a lot of exact matches and are you filtering?<br>Consider to make the field a Facet/Multivalue Facet.<br>If your field content only contains single words, use the = operator (No need to create a facet for it).<",
                        ">Field:</td><td  class=myexprval> <b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexprval><b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td colspan=2 class=myexprcomm>Is used with a = query.<br>Based on the first 500 results, the content contains single words. Keep it like this!</td></tr><");

                    }
                  }
                  if (multiwords && wehaveresults) {
                    if (matchOperator) {
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Facet Field: <b>" + "==" + field + "</b><br>Does it only contains single words? Use = .<",
                        ">Facet Field:</td><td  class=myexprval> <b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index:</td><td class=myexprval><b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td  colspan=2 class=myexprcomm>Is used with a == query.<br>Based on the first 500 results, the content contains multiple words. Keep it like this!</td></tr><");
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Field: <b>" + "==" + field + "</b><br>Do you really want to use Contains (=) or are you filtering? <br>If you want to filter, use == (exact match), which is faster.<",
                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexprval>Values in the index:</td><td class=myexprval> <b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td colspan=2 class=myexprcomm>Based on the first 500 results, the content contains multiple words. Keep it like this!</td></tr><");
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Field: <b>" + "==" + field + "</b><br>Are you using a lot of exact matches and are you filtering?<br>Consider to make the field a Facet/Multivalue Facet.<br>If your field content only contains single words, use the = operator (No need to create a facet for it).<",
                        ">Field:</td><td class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index:</td><td class=myexprval> <b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td colspan=2 class=myexprcomm>Consider to make the field a Facet/Multivalue Facet (When cardinality is < 10.000)." + comment + "</td></tr><");
                    }
                    if (containsOperator) {
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Facet Field: <b>" + "=" + field + "</b><br>Does it only contains single words? Use = .<",
                        ">Facet Field:</td><td  class=myexprval> <b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index: </td><td class=myexprval><b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td  colspan=2 class=myexprcomm>Is used with a = query.<br>This is not an exact match, but a <b>contains</b> statement.<br>Are you filtering on this field? Consider to use == instead.<br>When cardinality is < 10.000, create a Facet." + comment + "</td></tr><");
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Field: <b>" + "=" + field + "</b><br>Do you really want to use Contains (=) or are you filtering? <br>If you want to filter, use == (exact match), which is faster.<",
                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexprval>Values in the index: </td><td class=myexprval><b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td colspan=2 class=myexprcomm>Is used with a = query.<br>This is not an exact match, but a <b>contains</b> statement.<br>Are you filtering on this field? Consider to make the field a Facet/Multivalue Facet and use == instead." + comment + "</td></tr><");
                      reportData.json.badquery = reportData.json.badquery.replaceAll(">Field: <b>" + "=" + field + "</b><br>Are you using a lot of exact matches and are you filtering?<br>Consider to make the field a Facet/Multivalue Facet.<br>If your field content only contains single words, use the = operator (No need to create a facet for it).<",
                        ">Field: </td><td  class=myexprval><b>" + field + "</b></td></tr><tr><td class=myexpr>Values in the index:</td><td class=myexprval> <b>" + [...badexamples].slice(0, 10).join(', ') + "</b></td></tr><tr><td colspan=2 class=myexprcomm>Is used with a = query.<br>This is not an exact match, but a <b>contains</b> statement.<br>Are you filtering on this field? Consider to make the field a Facet/Multivalue Facet and use == instead." + comment + "</td></tr><");

                    }
                  }
                  resolve();
                });
              });
            });
            requestsQ = requestsQ.concat(requestsSQ);
            executeSequentially(requestsQ).then(
              function () {
                reportData.json.badfields_filtered = [...new Set(reportData.json.badfields_filtered)];
                reportData.json.badfields_query = [...new Set(reportData.json.badfields_query)];
                // end execute queries
                SendMessage({ type: 'saveOrg', json: reportData.json });
                processReport(reportData.json);
              });
          });
      }
      else if (reportData.type === 'gotPerformanceReport') {
        processPerformanceReport(reportData.json);
      }
      else if (reportData.type === 'gotOrgReport') {

        processOrgReport(reportData.json);
      }
      if (reportData && reportData.length && reportData[0].value && reportData[0].max && reportData[0].title) {
        processReport(reportData);
      }
      return true;
    }
  );
}
else {
  setTimeout(function () {
    processReport([{
      title: "TestOnly",
      value: 31, max: 60,
      lines: [
        { label: "# of search executed (should be 1)", value: 0, expected: 1 },
        { label: "Search Events sent using our api?", value: false, expected: true },
        { label: "Analytics sent?", value: false, expected: true },
        { label: "Using search as you type (degrades performances)", value: false, expected: false },
        { label: "Using ML Powered Query Completions", value: false, expected: true },
      ]
    }]);
  });
}


document.addEventListener('DOMContentLoaded', function () {
  // Handle clicks on slide-toggle buttons
  var manifestData = chrome.runtime.getManifest();
  $('#myTitle').text("Coveo Response Checker " + manifestData.version);
  $('#legend').hide();
  $('#download-global').hide().click(downloadReport.bind(null, 'globalReport'));
  $('#showInstructions').click(() => {
    $('#instructions').show();
  });
  $('#getPerformanceReport').click(() => {
    //Save the contents
    getPerformanceReport();
    /*SendMessage({ type: 'clearCache' });
    setTimeout(() => {
      getPerformanceReport();
    }, 3000);*/
  });
  $('#getReport').click(getReport);
  $('#clear').click(() => {

    document.getElementById('scores').innerHTML = '';
    document.getElementById('details').innerHTML = '';

    SendMessage('reset', getState);
    window.close();
  });
  getState();
});