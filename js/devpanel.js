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
  if (message.all) {
    document.getElementById('ALL').innerHTML = '';
    for (var i = 0; i < message.all.length; i++) {
      let empty = "";
      let id = document.getElementById('ALL').innerHTML.length;
      let idc = id + 'c';
      let title = message.all[i].title ? " - " + message.all[i].title : '';
      let status = message.all[i].statusCode ? "<span class='sc'>statusCode: " + message.all[i].statusCode + "</span>" : "";
      let statusok = '';
      if (message.all[i].statusCode) {
        statusok = message.all[i].statusCode == 200 ? "validInd" : "notvalidInd";
      }
      let line = `<span class='spacing'></span><span class='type ${!message.all[i].data.flag && message.all[i].statusCode ? "validIndB" : "notvalidIndB"}'>${message.all[i].request.type}${title}</span><span class="time">${message.all[i].time}</span>`;
      //line += `<span class=code style='cursor:pointer'" id=${id}>Data sent(click to show):<pre class='mycode' id=${idc}>${JSON.stringify(message.request.data,null,2)}</pre></span>`;
      line += `<span class='url ${statusok}'><a href='${encodeURI(message.all[i].request.url)}' target='_blank'>${message.all[i].request.url}</a>${status}</span>`;
      line += `<ul>${message.all[i].data.content}</ul>` + empty;
      line += `<details class=code>  <summary>Post/Form Data</summary>  <pre class='mycode' id=${idc}>${JSON.stringify(message.all[i].request.data, null, 2)}</pre></details>`;
      //document.getElementById('ALL').innerHTML=line+document.getElementById('ALL').innerHTML;
      document.getElementById('ALL').insertAdjacentHTML('beforeend', line);
    }

  } else {
    let empty = "";
    let id = document.getElementById('ALL').innerHTML.length;
    let idc = id + 'c';
    let title = message.title ? " - " + message.title : '';
    let status = message.statusCode ? "<span class='sc'>statusCode: " + message.statusCode + "</span>" : "";
    let statusok = '';
    if (message.statusCode) {
      statusok = message.statusCode == 200 ? "validInd" : "notvalidInd";
    }
    let line = `<span class='spacing'></span><span class='type ${!message.data.flag && message.statusCode == 200 ? "validIndB" : "notvalidIndB"}'>${message.request.type}${title}</span><span class="time">${message.time}</span>`;
    //line += `<span class=code style='cursor:pointer'" id=${id}>Data sent(click to show):<pre class='mycode' id=${idc}>${JSON.stringify(message.request.data,null,2)}</pre></span>`;
    line += `<span class='url ${statusok}'><a href='${encodeURI(message.request.url)}' target='_blank'>${message.request.url}</a>${status}</span>`;
    line += `<ul>${message.data.content}</ul>` + empty;
    line += `<details class=code>  <summary>Post/Form Data</summary>  <pre class='mycode' id=${idc}>${JSON.stringify(message.request.data, null, 2)}</pre></details>`;
    //document.getElementById('ALL').innerHTML=line+document.getElementById('ALL').innerHTML;
    document.getElementById('ALL').insertAdjacentHTML('afterbegin', line);
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
