'use strict';

//const request = require("request");

const STATES = {};
let GLOBAL = {};
var activeTabId;
var testcase_items = [];
var active = false;
var empty = true;
var tab_id = null;

/* globals chrome */
const FILTER_SEARCH = { urls: ["*://*/rest/search/*", "*://*/search/*", "*://*/*/search/*", "*://*/*/CoveoSearch/*", "*://*/?errorsAsSuccess=1", "*://*/*&errorsAsSuccess=1*", "https://*/rest/search/v2/*", "https://*/rest/search/v2*", "https://*/coveo-search/v2*","https://*/*/rest/search/v2*", "https://*/*/*/rest/search/v2*", "https://*/coveo/rest/v2*", "https://cloudplatform.coveo.com/rest/search/*", "*://platform.cloud.coveo.com/rest/search/v2/*", "https://search.cloud.coveo.com/rest/search/v2/*", "*://*/*/coveo/platform/rest/*", "*://*/coveo/rest/*"] };
const FILTER_ANALYTICS = { urls: ["*://*/collect", "*://*/v1/analytics/search*", "*://usageanalytics.coveo.com/rest/*", "*://*/*/coveo/analytics/rest/*", "*://*/*/rest/ua/*","*://*/rest/ua/*", "*://*/*/coveoanalytics/rest/*"] };
const FILTER_OTHERS = { urls: ["*://*/rest/search/alerts*"] };


let getTabId_Then = (callback) => {
  this.getActiveTab((tabs) => {
    callback(activeTabId);
  });
  /*chrome.tabs.query({ active: true, lastFocusedWindow: true}, (tabs) => {
    if (tabs.length>0){
      console.log("TAB ID:"+tabs[0].id);
      callback(tabs[0].id);
    } else
    {
      console.log("TAB ID NOT THERE");
      callback();
    }
  });*/
};

let defaultECResults= ['add','remove','detail','pageview','impression','click','purchase'];

//For search and plan
let searchChecks = [
  { title: 'Search',key: 'usingSearchHub', url: '', prop: 'searchHub' , value: {test: val => (val !== '') }},
  { key: 'usingTab', url: '', prop: 'tab' , value: {test: val => (val !== '') }},
  { key: 'usingPipeline', url: '', prop: 'pipeline' , value: {test: val => (val !== '') }},
  { key: 'usingContext', url: '', prop: 'context' , value: {test: val => (val !== '') }},
  { key: 'usingLocale', url: '', prop: 'locale' , value: {test: val => (val !== '') }},
  { key: 'usingVisitorId', url: '', prop: 'visitorId' , value: {test: val => (val !== '') }},
  { key: 'NOT_usingDQ', url: '', prop: 'dq' , default:false, value: {test: val => (val == '') }},
  { key: 'NOT_usingLQ', url: '', prop: 'lq' , default:false, value: {test: val => (val == '') }},
  { key: 'NOT_usingFilterField', url: '', prop: 'filterField' , default:false, value: {test: val => (val == '') }},
  { key: 'NOT_usingPartialMatch', url: '', prop: 'partialMatch' , default:false, value: {test: val => (val == false) }},
  { key: 'NOT_usingWildcards', url: '', prop: 'enableWildcards',  default:false, value: {test: val => (val == false) }},
  { key: 'NOT_usingDuplicateFilter', url: '', prop: 'enableDuplicateFiltering' ,  default:false, value: {test: val => (val == false) }},
  { key: 'usingCommerce', url: '', prop: 'commerce' },
  { key: 'usingDictionary', url: '', prop: 'dictionaryFieldContext' },
];

//For QuerySuggest
let qsChecks = [
  { title: 'Query Suggest',key: 'usingSearchHubQS', url: '', prop: 'searchHub' , value: {test: val => (val !== '') }},
  { key: 'usingTabQS', url: '', prop: 'tab' , value: {test: val => (val !== '') }},
  { key: 'usingPipelineQS', url: '', prop: 'pipeline' , value: {test: val => (val !== '') }},
  { key: 'usingContextQS', url: '', prop: 'context' , value: {test: val => (val !== '') }},
  { key: 'usingLocaleQS', url: '', prop: 'locale' , value: {test: val => (val !== '') }},
  { key: 'usingVisitorIdQS', url: '', prop: 'visitorId' , value: {test: val => (val !== '') }},
];

//For ECommerce
let ecChecks = [
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, key: 'usingT', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['pageview'].includes(vals['t']) )}, prop: 't' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, key: 'usingPA', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['event'].includes(vals['t']) )}, prop: 'pa' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, key: 'usingDL', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['pageview'].includes(vals['t']) )}, prop: 'dl' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, key: 'usingDR', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['pageview'].includes(vals['t']) )}, prop: 'dr' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, key: 'usingDT', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['pageview'].includes(vals['t']) )}, prop: 'dt' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, key: 'usingPID', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['pageview'].includes(vals['t']) )}, prop: 'pid' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, key: 'usingCID', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['pageview'].includes(vals['t']) )}, prop: 'cid' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, key: 'usingCU', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['pageview'].includes(vals['t']) )}, prop: 'cu' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, key: 'usingUL', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['pageview'].includes(vals['t']) )}, prop: 'ul' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'])}, key: 'usingPR1ID', url: '/collect', check: {test: vals => (['click','add','remove','detail'].includes(vals['pa']) )}, prop: 'pr1id' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'])}, key: 'usingPR1QT', url: '/collect', check: {test: vals => (['click','add','remove'].includes(vals['pa']) )}, prop: 'pr1qt' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'])}, key: 'usingPR1PR', url: '/collect', check: {test: vals => (['click','add','remove','detail'].includes(vals['pa']) )}, prop: 'pr1pr' , value: {test: val => (val !== '') }},

  { ectitle: {test: vals => (vals['pa'])}, key: 'usingIL1PI1ID', url: '/collect', check: {test: vals => (['impression'].includes(vals['pa']) )}, prop: 'il1pi1id' , value: {test: val => (val !== '') }},
//  { ectitle: {test: vals => (vals['pa'])}, key: 'usingIL1PI1QT', url: '/collect', check: {test: vals => (['impression'].includes(vals['pa']) )}, prop: 'il1pi1qt' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'])}, key: 'usingIL1PI1PR', url: '/collect', check: {test: vals => (['impression'].includes(vals['pa']) )}, prop: 'il1pi1pr' , value: {test: val => (val !== '') }},

  { ectitle: {test: vals => (vals['pa'])}, key: 'usingTI', url: '/collect', check: {test: vals => (['purchase'].includes(vals['pa']) )}, prop: 'ti' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'])}, key: 'usingTR', url: '/collect', check: {test: vals => (['purchase'].includes(vals['pa']) )}, prop: 'tr' , value: {test: val => (val !== '') }},

  { ectitle: {test: vals => (vals['pa'])}, key: 'usingPAL', url: '/collect', check: {test: vals => (['click'].includes(vals['pa']) )}, prop: 'pal' , value: {test: val => (val !== '') }},
];
let ecResults = {};

//For Analytics
let analyticChecks = [
  { title:'Analytics', key: 'usingSearchHubA', url: '', prop: 'originLevel1' , value: {test: val => (val !== '') }},
  { key: 'usingTabA', url: '', prop: 'originLevel2' , value: {test: val => (val !== '') }},
  { key: 'usingLevel3', url: '', prop: 'originLevel3', value: {test: val => (val !== '') }},
  { key: 'usingPipelineA', url: '', prop: 'queryPipeline' , value: {test: val => (val !== '') }},
  { key: 'usingLocaleA', url: '', prop: 'language' , value: {test: val => (val !== '') }},
  { key: 'usingVisitorIdA', url: '', prop: 'visitorId' , value: {test: val => (val !== '') }},
  { key: 'NOT_visitorChanged', url: '', prop: 'NOT_visitorChanged' , value: true},
  { key: 'searchQueryUid', url: '', prop: 'searchQueryUid', value: {test: val => (val !== '') }},
  { title: 'Click/Open', key: 'documentOpen', url: '/click', prop: 'actionCause', value: 'documentopen'},
  { title: 'Click/Open', key: 'recommendationOpen', url: '/click', prop: 'actionCause', value: 'recommendationopen'},
  { title: 'Click/Open', key: 'documentQuickview', url: '/click', prop: 'actionCause', value: 'documentquickview'},
  { title: 'Click/Open', key: 'documentUrl', url: '/click', prop: 'documentUrl', value: {test: val => (val !== '') }},
  { title: 'PageView', key: 'pageViews_new', url: '/collect', prop: 't', value: 'pageview'},
  { title: 'PageView', key: 'pageViews_contentIdKey', url: '/view', prop: 'contentIdKey', value: {test: val => (val !== '') }},
  { title: 'PageView', key: 'pageViews_contentIdValue', url: '/view', prop: 'contentIdValue', value: {test: val => (val !== '') }},
  { title: 'PageView', key: 'pageViews_language', url: '/view', prop: 'language', value: {test: val => (val !== '') }},
  { title: 'Search', key: 'queryText', url: '/search', prop: 'queryText', value: {test: val => (val !== '') }},
  { title: 'Search', key: 'responseTime', url: '/search', prop: 'responseTime', value: {test: val => (val !== '') }},
  { title: 'Search', key: 'interfaceLoad', url: '/search', prop: 'actionCause', value: {test: val => (val == 'interfaceload' || val =='recommendationinterfaceload' ) }},
  { title: 'Search', key: 'interfaceChange', url: '/search', prop: 'actionCause', value: {test: val => (val == 'interfacechange' ) }},
  { title: 'Search', key: 'searchBoxSubmit', url: '/search', prop: 'actionCause', value: {test: val => (val == 'searchboxsubmit' ) }},
  { title: 'Search', key: 'searchFromLink', url: '/search', prop: 'actionCause', value: {test: val => (val == 'searchfromlink' ) }},
  { title: 'Search', key: 'searchBoxClear', url: '/search', prop: 'actionCause', value: {test: val => (val == 'searchboxclear' ) }},
  { title: 'Search', key: 'omniboxAnalytics', url: '/search', prop: 'actionCause', value: {test: val => (val == 'omniboxanalytics' ) }},
  { title: 'Search', key: 'omniboxFromLink', url: '/search', prop: 'actionCause', value: {test: val => (val == 'omniboxfromLink' ) }},
  { title: 'Search', key: 'searchAsYouType', url: '/search', prop: 'actionCause', value: {test: val => (val == 'searchasyoutype' ) }},
  { title: 'Search', key: 'omniboxField', url: '/search', prop: 'actionCause', value: {test: val => (val == 'omniboxfield' ) }},
  { title: 'Search', key: 'didyoumeanClick', url: '/search', prop: 'actionCause', value: {test: val => (val == 'didyoumeanclick' ) }},
  { title: 'Search', key: 'didyoumeanAutomatic', url: '/search', prop: 'actionCause', value: {test: val => (val == 'didyoumeanautomatic' ) }},
  { title: 'Search', key: 'resultsSort', url: '/search', prop: 'actionCause', value: {test: val => (val == 'resultssort' ) }},
  { title: 'Search', key: 'facetSelect', url: '/search', prop: 'actionCause', value: {test: val => (val == 'facetselect' ) }},
  { title: 'Search', key: 'facetDeselect', url: '/search', prop: 'actionCause', value: {test: val => (val == 'facetdeselect' ) }},
  { title: 'Search', key: 'facetExclude', url: '/search', prop: 'actionCause', value: {test: val => (val == 'facetexclude' ) }},
  { title: 'Search', key: 'facetUnexclude', url: '/search', prop: 'actionCause', value: {test: val => (val == 'facetunexclude' ) }},
  { title: 'Search', key: 'documentField', url: '/search', prop: 'actionCause', value: {test: val => (val == 'documentfield' ) }},
  { title: 'Search', key: 'breadcrumbFacet', url: '/search', prop: 'actionCause', value: {test: val => (val == 'breadcrumbfacet' ) }},
  { title: 'Search', key: 'breadcrumbResetAll', url: '/search', prop: 'actionCause', value: {test: val => (val == 'breadcrumbresetall' ) }},
  { title: 'Search', key: 'facetSearch', url: '/custom', prop: 'eventValue', value: {test: val => (val == 'facetsearch' ) }},
  { title: 'Search', key: 'facetUpdateSort', url: '/custom', prop: 'eventValue', value: {test: val => (val == 'facetupdatesort' ) }},
  { title: 'Paging', key: 'getMoreResults', url: '/custom', prop: 'eventType', value: {test: val => (val == 'getmoreresults' ) }},

];


let resetState = (tabId) => {
  if (tabId) {
    STATES[tabId] = {
      tabId,
      document_url: '',
      enabled: false,
      enabledSearch: false,
      usingCommerce: false,
      usingDictionary: false,
      usingPipeline: false,
      usingSearchHub: false,
      usingTab: false,
      usingContext: false,
      usingLocale: false,
      usingVisitorId: false,
      NOT_usingDQ: true,
      NOT_usingLQ: true,
      NOT_usingFilterField: true,
      NOT_usingPartialMatch: true,
      NOT_usingWildcards: true,
      NOT_usingDuplicateFilter: true,
      usingCommerce: false,
      usingDictionary: false,
      searchQueryUid: false,
      usingPipelineQS: false,
      usingSearchHubQS: false,
      usingTabQS: false,
      usingContextQS: false,
      usingLocaleQS: false,
      usingVisitorIdQS: false,

      usingPipelineA: false,
      usingSearchHubA: false,
      usingTabA: false,
      usingLocaleA: false,
      usingVisitorIdA: false,
      usingLevel3: false,

      documentOpen: false,
      recommendationOpen: false,
      documentQuickview: false,
      documentUrl: false,
      pageViews_new: false,
      pageViews_contentIdKey: false,
  pageViews_contentIdValue: false,
  pageViews_language: false,
      queryText: false,
      responseTime: false,
      interfaceLoad: false,
      interfaceChange: false,
      searchBoxSubmit: false,
      searchFromLink: false,
      searchBoxClear: false,
      omniboxAnalytics: false,
      omniboxFromLink: false,
      searchAsYouType: false,
      omniboxField: false,
      didyoumeanClick: false,
      didyoumeanAutomatic: false,
      resultsSort: false,
      facetSelect: false,
      facetDeselect: false,
      facetExclude: false,
      facetUnexclude: false,
      documentField: false,
      breadcrumbFacet: false,
      breadcrumbResetAll: false,
      facetSearch: false,
      facetUpdateSort: false,
      getMoreResults: false,

      usingT: false,
      usingPA: false,
      usingDL: false,
      usingDR: false,
      usingPID: false,
      usingPR1ID: false,
      usingPR1QT: false,
      usingPR1BR: false,
      usingPR1CA: false,
      usingPR1NM: false,
      usingPAL: false,


      nrofsearches: 0,
      nrofplansearches: 0,
      nroffacetsearches: 0,
      facetSearchSent: false,
      suggestSent: false,
      searchSent: false,
      analyticsSent: false,
      topQueriesSent: false,
      
      query: [],
      alertsError: '',
      
      
      visible: false,
      visitor: '',
      NOT_visitorChanged: true,

      queryRequests: [],
      querySuggestRequests: [],
      recommendationRequests: [],
      analyticRequests: [],
      ecommerceRequests: [],
      searchReport: '',
      qsReport: '',
      analyticReport: '',
      ecReport: ''
    };
    initECResults();
    let state = STATES[tabId];
    //Add global state
    state = Object.assign(state, GLOBAL);
    STATES[tabId] = state;
  }
  else {
    getTabId_Then(resetState);
  }
};

let initECResults=() => {
  defaultECResults.map(key => {
    ecResults[key]={};
    ecResults[key]['Count']=0;
  });
}
let getState = (tabId) => {
  //tabId = "Default";
  let state = STATES[tabId];
  if (!state) {
    resetState(tabId);
  }
  return STATES[tabId];
};

let getState_Then = (callback) => {
  getTabId_Then(tabId => {
    callback(getState(tabId));
  });
};

let saveGlobal = (obj) => {
  let state = Object.assign(GLOBAL, obj);
  GLOBAL = state;
};

let saveState = (obj, tabId) => {
  //tabId = "Default";
  console.log("Saving STATE: "+tabId);
  if (tabId) {
    let state = Object.assign(getState(tabId), obj);
    STATES[tabId] = state;
  }
  else {
    getTabId_Then(tabId => {
      console.log("Saving STATE without tabid: "+tabId);
      saveState(obj, tabId);
    });
  }
};



let SendMessage = (parameters) => {
  setTimeout(() => {
    try {
      chrome.runtime.sendMessage(parameters);
    }
    catch (e) {
      console.log("EXCEPT: "+e);
     }
  });
};

function navigateto(url) {
  var newURL = "https:" + url;
  chrome.tabs.create({ url: newURL });
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  console.log(msg.action);
  if (msg.action == "append") {
    //Do not record CoveoResponseChecker controls
    if (msg.obj.info==undefined) {
      testcase_items[testcase_items.length] = msg.obj;
      empty = false;

    } else {
    if (msg.obj.info.id.indexOf('CoveoResponseChecker')==-1 && msg.obj.info.selector.indexOf('CoveoResponseChecker')==-1) {
      
      testcase_items[testcase_items.length] = msg.obj;
      empty = false;
      }
    }
    sendResponse({});
  }
  if (msg.action == "poke") {
    testcase_items[testcase_items.length - 1] = msg.obj;
    sendResponse({});
  }
  if (msg.action == "get_status") {
    sendResponse({ active: active, empty: empty });
  }
  if (msg.action == "get_items") {
    sendResponse({ items: testcase_items });
  }
  if (msg.action=="stoprecord") {
    active = false;
    chrome.tabs.create({ url: "./js/nightwatch.html" });
  }

  if (msg.type === 'getState') {
    getTabId_Then(tabId => {
      sendResponse(getState(tabId));
    });
    return true;
  }

  else if (msg.type === 'navigate') {
    navigateto(msg.to);
  }
  else if (msg.type === 'reset') {
    getTabId_Then(tabId => {
      ecResults = {};
      resetState(tabId);
      getState_Then(state => {
        //Enable it again
        state.enabled = !state.enabled;
        saveState(state, tabId);
        sendUpdate(state);
      });
      //sendResponse({ tabId });
    });
    return true;
  }
  else if (msg.type === 'enablesearch') {
    setEnabledSearch(msg.enable);
  }
  else if (msg.type === 'close') {
    getTabId_Then(tabId => {
      getState_Then(state => {
        //Enable it again
        state.enabled = false;
        saveState(state, tabId);
      });
    });
    return true;
  }
  
  else if (msg.type === 'saveScore') {
    console.log('saveScore request');
    let score = msg.score;
    let vals = {};
    vals[score] = msg.value;
    saveState(vals);
  }
  else if (msg.type === 'getNumbersBackground') {
    console.log("getNumbersBackground request");
    getState_Then(state => {
      SendMessage({
        type: "gotNumbersBackground",
        global: state
      });
    });
  }
  else if (msg.action == "stop") {
    active = false;
    getTabId_Then(tabId => {
    chrome.tabs.sendMessage(tabId, { action: "stop" });
    sendResponse({});
    });
  }
  else if (msg.action === 'startrecord') {
    getTabId_Then(tabId => {
      testcase_items = [];
      //chrome.tabs.update(tabId, { url: msg.start_url }, function(tab) {
        alert("You are now recording your test sequence. Make sure to press the actual search box icon :)");
        chrome.tabs.sendMessage(tabId, {
          action: "open",
          url: msg.start_url
        });
        if (!active) {
          active = true;
          empty = true;
        chrome.tabs.sendMessage(tabId,{
          action: "start",
          recorded_tab: tabId,
          start_url: msg.start_url
        });
      }
        //sendResponse({ start: true });
      //});
    });
  }
  else {
    // proxy to content (tabs)
    getTabId_Then(tabId => {
      chrome.tabs.sendMessage(tabId || null, msg);
    });
  }
  //return true; 
});

function getActiveTab(callback) {
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    var tab = tabs[0];

    if (tab) {
      callback(tab);
    } else {
      chrome.tabs.get(activeTabId, function (tab) {
        if (tab) {
          callback(tab);
        } else {
          console.log('No active tab identified.');
        }
      });

    }
  });
}

function checkToken(token) {
  let part = token.split('.');
  let decoded = JSON.parse(atob(part[1]));
  return JSON.stringify(decoded, null, 2);
}

chrome.tabs.onUpdated.addListener(function (tabId, info) {
  activeTabId = tabId;
  if (info.status === 'loading') {
    let state = getState(tabId);
    let document_url = (info.url || '').replace(/(#|\?).+/g, ''); // ignore after ?, url is updated when using facets or doing searches.
    // if we change location, we want to reset this tab state.
    if (document_url && state.document_url !== document_url) {
      //WIM This creates a conflict, overriding initSearchSuggest etc
      //resetState(tabId);
      saveState({ 'document_url': document_url }, tabId);
    }
  }
  else if (info.status === 'complete') {
    saveState({ ready: true }, tabId);
    getState_Then(state => {
    let msg = {
      type: "enabled",
      global: state
    };
    chrome.tabs.sendMessage(tabId, msg);
  });
    //chrome.tabs.executeScript(tabId, { file: "/js/content.js" });
    //Now inject content.js
  }
  return true; 
});

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
      console.error('decodeRaw Error: ', e);
    }
  }

  return (rawString || '');
};

let getData = function( raw, formData, events) {
  let postedString = {};
  if (raw) {
    postedString = JSON.parse(decodeRaw(raw));
    //Check if postedString is an array, if so correct it
    if (Array.isArray(postedString)) {
      postedString = postedString[0];
    }

  }
  //We want everything
  //var myquery = {};
  //'q,aq,dq,lq,filterField,partialMatch,context,pipeline'.split(',').forEach(attr => {
  Object.keys(formData).map(attr => {
    if (formData[attr] !== undefined) {
      // add all formData.q and formData.aq as q=... and aq=... to postedString
      //postedString += ` ${attr}=${formData[attr]}`;
      //postedString[attr]=formData[attr];
      //if (formData[attr][0].indexOf('[')==0){
      try {
        //myquery[attr] = JSON.parse(formData[attr][0]);
        postedString[attr] = JSON.parse(formData[attr][0]);
      }
      catch{
        //myquery[attr] = formData[attr][0];
        postedString[attr] = formData[attr][0];
      }
    }
  });
  if (events!=undefined) {
    
    Object.assign(postedString, events);
  }
  return postedString;
}

let doChecks = function(postedString, url, checks, state, report) {
  //console.log(postedString);
  state[report] = '';
  let content = '';
  let curtitle = '';
  let curcontent = '';
  let first = true;
    checks.map(check => {
      let isValid = false;
      let value = '';
      let title='';
      let go = true;
      //First check if we url is there
      if (check.url!=='') {
        go = false;
        if (url.indexOf(check.url)!==-1) {
          go = true;
        }
      }

      //Second check if prop is there
      if (go) {
        value = '';
        if (check.prop in postedString) {
           value = postedString[check.prop];
           if (typeof value === 'string' || value instanceof String){
             value = value.toLowerCase();
           }
           check.lastValue = value;
        }
        //If check.check is there we need to check if that is available
        if (check.check !== undefined) {
          if (check.check.test) {
            go = check.check.test(postedString);
          }
        }  
        if (go) {
        //If check.title is there we need to check if that is available
        if (check.ectitle !== undefined) {
          if (check.ectitle.test) {
            title = check.ectitle.test(postedString);
          } else {
            title = check.ectitle;
            }
          }  
        }
      
      if (check.value !== undefined) {
        if (check.value.test) {
          isValid = check.value.test(value);
        }
        else {
          isValid = (value === check.value);
        }
      }
      //Check if we have a valid check in the state
      //first get the old value of the state
      let def_value = true;
      if (check.default !== undefined) {
        def_value = check.default;
      }
      if (check.key in state) {
        if (state[check.key]==def_value) {
          isValid = def_value;
          if (check.lastValue != undefined) {
            value = check.lastValue;
          }
        }
      }
      //We need to save the ecResults
      if (title!='')  {
        if (ecResults[title]==undefined) {
          ecResults[title]={};
        }
        if (first) {
          let current = ecResults[title]['Count'];
          if (current==undefined) current = 0;
          ecResults[title]['Count'] = current +1;
          first = false;
        }
        ecResults[title][check.key] = isValid;
      }
      //If key is not in state, give warning
      if (check.key in state && title=='') {
        state[check.key] = isValid;
        let ctitle = '';
        if (check.title !== undefined){
          if (curtitle!=check.title) {
            //We need to close the previous line
            //content+= `<tr><td>${check.title}</td>${curcontent}</tr>`;
            curtitle = check.title;
            curcontent = '';
          } else {
            //Same title so we need to collect the td only
            curcontent+= `<td class=${isValid?"valid":"notvalid"}></td><td>${check.key}</td><td>${value}</td><td class="help"></td>`;    
          }
          ctitle = check.title+' - '+check.key;
        } else {
          ctitle = check.key;
          curcontent+= `<td class=${isValid?"valid":"notvalid"}></td><td>${check.key}</td><td>${value}</td><td class="help"></td>`;   
        }
        
        content+= `<tr><td class=${isValid?"valid":"notvalid"}></td><td>${ctitle}</td><td>${value}</td><td class="help"></td></tr>`;

      } else {
        console.log('MAYDAY: key '+check.key+' NOT IN STATE!!!!');
      }
    }
    });
    //content+= `<tr><td>${curtitle}</td>${curcontent}</tr>`;
    state[report] = content;
    saveState(state, state.tabId);
}

let onSearchRequest = function (details) {
  if (details.method=="OPTIONS") return;
  if (details.url.indexOf('/analytics/')>0) return;
  getState_Then(state => {
    if (!state.enabledSearch) return;
    let thisState = {};
    console.log("CATCHED Search ", details.url);
    if (details.url.includes('querySuggest')) {
        console.log("CATCHED querySuggest ", details.url);
        thisState.suggestSent = true;
        if (state.querySuggestRequests==undefined) {
          state.querySuggestRequests = [];
        }
        let raw = details.requestBody && details.requestBody.raw,
        formData = (details.requestBody && details.requestBody.formData) || {};

        let postedString = getData(raw, formData);
        state.querySuggestRequests.unshift({url:details.url, data:postedString});
        doChecks(postedString, details.url, qsChecks, state, 'qsReport');

    }
   else if (details.url.includes('facet')) {
      console.log("CATCHED facet ", details.url);
      thisState.facetSearchSent = true;
  }
    else {

      let raw = details.requestBody && details.requestBody.raw,
        formData = (details.requestBody && details.requestBody.formData) || {};

      let postedString = getData(raw, formData);
      
      if (state.queryRequests==undefined) {
        state.queryRequests = [];
      }

      state.queryRequests.unshift({url:details.url, data:postedString});
      //console.log(postedString);
      // thisState.queryExecuted = postedString;
      var fullstring = JSON.stringify(postedString);
      doChecks(postedString, details.url, searchChecks, state, 'searchReport');
      if ('q' in postedString || 'aq' in postedString) {//.includes('q=')) {
        console.log("CATCHED Search with query ", details.url);
        thisState.searchSent = true;
          thisState.nrofsearches = (state.nrofsearches || 0) + 1;

          thisState.searchURL = details.url;
        //Add debug = true for later execution
          postedString['debug'] = true;
          //Checking for search as you type, same query all over again...
          if (state.query.length==0){
            state.query.push(postedString);
            state.query = [...new Set(state.query)];
          }
          else
          {
            if ('q' in postedString) {
            if (postedString['q'].startsWith(state.query[0].q)){
                state.query[0].q=postedString['q'];
            }
            else{
              state.query.push(postedString);
              state.query = [...new Set(state.query)];
              }
            }
          }
      }
      if ('dq' in postedString) {//}.includes('dq=')) {
        thisState.usingDQ = true;
      }
      if ('lq' in postedString) {//}.includes('lq=')) {
        thisState.usingLQ = true;
      }
      /*if ('filterField' in postedString) {//}.includes('filterField=')) {
        thisState.usingFilterField = true;
      }*/
      if ('pipeline' in postedString) {//}.includes('pipeline=')) {
        thisState.usingPipeline = true;
      }
      if (fullstring.includes('$qre') || fullstring.includes('$correlate')) {
        thisState.usingQREQuery = true;
      }
      
      
      if (fullstring.includes('$some')) {
        thisState.usingPartialMatch = true;
      }
      if ('context' in postedString) {//fullstring.includes('context=') && !fullstring.includes('context={}')) {
        if (postedString['context']) {
          thisState.usingContext = true;
        }
      }
    }
    saveState(thisState, state.tabId);
    sendUpdate(state);
  });
  return { cancel: false };
};

let addEcResults = function (state) {
  state.ecReport = '';
  Object.keys(ecResults).map((key) => { 
    let line = `<tr><td>${key}</td>`;
    Object.keys(ecResults[key]).map((prop) => { 
      if (prop=='Count') {
        line+=`<td style="border-right:none;min-width: 1px;"></td><td style="border-left:none">${ecResults[key][prop]} Request(s)</td>`;
      } else {
        line+=`<td class=${ecResults[key][prop]?"valid":"notvalid"} style="border-right:none"></td><td style="border-left:none">${prop}</td>`;
      }
    });
    line += "</tr>";
    state.ecReport += line;
  });

}

let onAnalyticsRequest = function (details) {
  if (details.method=="OPTIONS") return;
  getState_Then(state => {
    if (!state.enabledSearch) return;
    let thisState = {};
    let url = details.url + '&';

    if (url.includes('/click') || url.includes('/open')) {
      thisState.usingQuickview = true;
    }
    if (url.includes('/custom')) {
      thisState.usingCustomEvents = true;
    }
    if (url.includes('topQueries')) {
        console.log("CATCHED topQueries ", url);
        thisState.topQueriesSent = true;
    }
    if (state.analyticRequests==undefined) {
      state.analyticRequests = [];
    }

    let raw = details.requestBody && details.requestBody.raw,
    formData = (details.requestBody && details.requestBody.formData) || {};

    //It could be that the searchEvents is sent as JSON in the URL
    let decodedUri=decodeURIComponent(details.url);
    let uri = new URL(details.url);//decodedUri);
    let searchEvents = {};
    let events;
    try {
      searchEvents = uri.searchParams.get("searchEvents");
      events = JSON.parse(decodeURIComponent(searchEvents))[0];
    }
    catch(e)
    {

    }
    //Try clickevents
    if (!events) {
      try {
        searchEvents = uri.searchParams.get("clickEvent");
        events = JSON.parse(decodeURIComponent(searchEvents));
      }
      catch(e)
      {
  
      }
    }
    //Try customevents
    if (!events) {
      try {
        searchEvents = uri.searchParams.get("customEvent");
        events = JSON.parse(decodeURIComponent(searchEvents));
      }
      catch(e)
      {
  
      }
    }
    //Try visitor
    let visitor;
      try {
        visitor = uri.searchParams.get("visitor");
      }
      catch(e)
      {
  
      }
      if (!visitor) {
      try {
        visitor = uri.searchParams.get("visitorId");
      }
      catch(e)
      {
  
      }
    }

    //Get the visitor
    //url is like: https://usageanalytics.coveo.com/rest/v15/analytics/searches?visitor=baa899f0-0982-4ca4-b0b1-29ead6cce7e8
    // or: https://help.salesforce.com/services/apexrest/coveo/analytics/rest/v15/analytics/searches?visitor=092861ef-30ee-4719-ae5d-2c6dcdcffbee&access_token=eyJhbGciOiJIUzI1NiJ9.eyJmaWx0ZXIiOiIoKChAb2JqZWN0dHlwZT09KExpc3RpbmdDKSkgKEBzZmxpc3RpbmdjcHVibGljYz09VHJ1ZSkpIE9SIChAb2JqZWN0dHlwZT09KEhURGV2ZWxvcGVyRG9jdW1lbnRzQykpIE9SICgoQG9iamVjdHR5cGU9PShIZWxwRG9jcykpIChAc3lzc291cmNlPT1cIlNpdGVtYXAgLSBQcm9kLURvY3NDYWNoZVwiKSAoTk9UI
    if (visitor!=null) {
      console.log(`Visitor: ${visitor} found.`);
      if (!state.visitor) {
        thisState.visitor = visitor;
        thisState.usingVisitor = true;
      }
      else if (state.visitor !== visitor) {
        thisState.NOT_visitorChanged = false;
        console.log("Visitor ID was " + state.visitor + ' and now: ' + visitor);
        thisState.visitor = visitor;
      }
    //Check if we need to add the visitor to the JSON
    if (!events) {
      events = {};
    }
    if (visitor) {
      events['visitorId'] = visitor;
      if (thisState.NOT_visitorChanged==true) {
      events['NOT_visitorChanged'] = false;
      }
    }
  }
    
    console.log("CATCHED Analytics ", details.url);
    thisState.analyticsSent = true;


    let postedString = getData(raw, formData, events);
    if (details.url.indexOf('/collect')==-1) {
      state.analyticRequests.unshift({url:details.url, data:postedString});
      doChecks(postedString, details.url, analyticChecks, state, 'analyticReport');
    } else {
      state.ecommerceRequests.unshift({url:details.url, data:postedString});
      doChecks(postedString, details.url, ecChecks, state, 'ecReport');
      //We have the checks, now add the ecResults to the ecReport
      //addEcResults(state);
    }

    if (details.requestBody) {

      console.log('postedString [A]:', postedString);

      // TODO: need to do something with actionCause here ?
      try {
        let json = JSON.parse(postedString);
        if (json) {
          if ('customData' in json || 'customData' in json[0]) {
            if ('customData' in json) {
              console.log(json.customData);
              Object.keys(json.customData).map((field) => {
                if (field.toUpperCase().startsWith('C_')) {
                  state.customData.push(field);
                }
              });
            }
            else {
              console.log(json[0].customData);
              Object.keys(json[0].customData).map((field) => {
                if (field.toUpperCase().startsWith('C_')) {
                  state.customData.push(field);
                }
              });

            }
            state.customData = [...new Set(state.customData)].sort();
            console.log(state.customData);
          }
        }
      }
      catch (err) { }
    }

    saveState(thisState, state.tabId);
    sendUpdate(state);
  });
  return { cancel: false };
};

let onResponseHeaders = function (details) {
  if (details.method=="OPTIONS") return;
  getState_Then(state => {
    console.log("CATCHED Others ", details.statusCode, details.url);
    if (details.statusCode !== 200) {
      saveState({ alertsError: details.url + " --> " + details.statusCode }, state.tabId);
    }
  });
  return { cancel: false };
};

let getAuthorizationToken = function (requestHeaders) {
  let token = null, headers = requestHeaders || [];

  for (let i = 0; i < headers.length; ++i) {
    let header = headers[i];
    if (header.name === 'Authorization') {
      token = header.value;
      break;
    }
  }
  return token;
};

let sendUpdate = function(state) {
  if (state.enabled) {
    addEcResults(state);
  let msg = {
    type: "update",
    global: state
  };
  chrome.tabs.sendMessage(state.tabId, msg);
}
}

let saveToken = function (tokenName, details) {
  getState_Then(state => {
    //First check URL
    let token = '';
    let url = details.url + "& ";
    var reg = RegExp(/token=(.*?)[ ;&$]/, 'ig');
    let matches = reg.exec(url);
    if (matches) {
      console.log(`Token: ${matches[0]} found.`);
      token = matches[1];
    }
    else {
      token = getAuthorizationToken(details.requestHeaders);
    }
    if (token) {
      if (tokenName == 'searchToken') {
        let s = {};
        s['searchAuth'] = token;
        saveState(s, state.tabId);
      }
      if (token) {
        let s = {};
        if (token.includes('.')) {
          token = checkToken(token);
        }
        s[tokenName] = token;
        saveState(s, state.tabId);
      }
    }
  });
};

chrome.webRequest.onBeforeRequest.addListener(onSearchRequest, FILTER_SEARCH, ['blocking', 'requestBody']);
chrome.webRequest.onBeforeRequest.addListener(onAnalyticsRequest, FILTER_ANALYTICS, ['blocking', 'requestBody']);
chrome.webRequest.onHeadersReceived.addListener(onResponseHeaders, FILTER_OTHERS, ['blocking', 'responseHeaders']);

chrome.tabs.onActivated.addListener(function(activeInfo) {
  activeTabId = activeInfo.tabId;
  getState_Then(state => {
  if (state.enabledSearch) {
    chrome.browserAction.setIcon({ path: './images/inspectGoodC.png' })
    chrome.browserAction.setBadgeText({ text: 'REC' })
    
  } else {
    chrome.browserAction.setIcon({ path: './images/inspectBadC.png' })
    chrome.browserAction.setBadgeText({ text: ' ❚❚' })
    
  }
  });
});

chrome.browserAction.setIcon({ path: './images/inspectBadC.png' });
chrome.browserAction.setBadgeBackgroundColor({color: '#F47F24'});
chrome.browserAction.setBadgeText({ text: ' ❚❚' });

function setEnabledSearch(enabled) {
  /*if (enabled) {
    getTabId_Then(tabId => {
      ecResults = {};
      resetState(tabId);
    });
  }*/
  saveState({
    enabledSearch: enabled,
  });
  if (enabled) {
    chrome.browserAction.setIcon({ path: './images/inspectGoodC.png' })
    chrome.browserAction.setBadgeText({ text: 'REC' })
    
  } else {
    chrome.browserAction.setIcon({ path: './images/inspectBadC.png' })
    chrome.browserAction.setBadgeText({ text: ' ❚❚' })
    
  }
}

//for Search tokens
chrome.webRequest.onSendHeaders.addListener(
  saveToken.bind(null, 'searchToken'),
  FILTER_SEARCH,
  ["requestHeaders"]);

//for analytic tokens
chrome.webRequest.onSendHeaders.addListener(
  saveToken.bind(null, 'analyticsToken'),
  FILTER_ANALYTICS,
  ["requestHeaders"]);

  chrome.browserAction.onClicked.addListener(function(tab) {
    getState_Then(state => {
      state.enabled = !state.enabled;
      saveState(state, state.tabId);
      let msg = {
        type: "enabled",
        global: state
      };
      chrome.tabs.sendMessage(state.tabId, msg);
    });
    //chrome.tabs.executeScript(null, {file: "testScript.js"});
 });

chrome.runtime.onMessage.addListener(
  /*function (reportData, sender/*, sendResponse*///) {
    // Toggle popup button, disabling it when we don't find a Coveo Search Interface in the page.
    /*if (reportData.disabled !== undefined) {
      let enable = (reportData.disabled !== true);
      chrome.browserAction[enable ? 'enable' : 'disable'](sender.tab.id);

      if (enable) {
        // chrome.tabs.executeScript(sender.tab.id, { file: "/js/content.js" });
      }
    }
    chrome.tabs.executeScript(sender.tab.id, { file: "/js/content.js" });
    return true;
  }*/
);

