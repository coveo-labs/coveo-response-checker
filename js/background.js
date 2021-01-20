'use strict';

//const request = require("request");

const STATES = {};
let GLOBAL = {};
var activeTabId;
var currentRequestId = '';
var currentResponse = '';
var testcase_items = [];
//var active = false;
//var empty = true;
var tab_id = null;

/* globals chrome */
const FILTER_SEARCH = { urls: ["*://*/rest/search/*", "*://*/search/*", "*://*/*/search/*", "*://*/*/CoveoSearch/*", "*://*/?errorsAsSuccess=1", "*://*/*&errorsAsSuccess=1*", "https://*/rest/search/v2/*", "https://*/rest/search/v2*", "https://*/coveo-search/v2*","https://*/*/rest/search/v2*", "https://*/*/*/rest/search/v2*", "https://*/coveo/rest/v2*", "https://cloudplatform.coveo.com/rest/search/*", "*://platform.cloud.coveo.com/rest/search/v2/*", "https://search.cloud.coveo.com/rest/search/v2/*", "*://*/*/coveo/platform/rest/*", "*://*/coveo/rest/*"] };
const FILTER_ANALYTICS = { urls: ["*://*/coveo/rest/coveoanalytics/*","*://*/rest/v15/analytics/*","*://*/collect*","*://*/*/collect*", "*://*/v1/analytics/search*", "*://usageanalytics.coveo.com/rest/*", "*://*/*/coveo/analytics/rest/*", "*://*/*/rest/ua/*","*://*/rest/ua/*", "*://*/*/coveoanalytics/rest/*"] };


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

function getTime() {
  var local = new Date();
  var localdatetime = local.getHours() + ":" + pad(local.getMinutes()) + ":" + pad(local.getSeconds());
  return localdatetime;
}

function pad(t) {
  var st = "" + t;
  
  while (st.length < 2)
    st = "0" + st;
    
  return st;  
}

let defaultECResults= ['add','remove','detail','pageview','impression','click','purchase'];

//For search and plan
let searchChecks = [
  { key: 'usingSearchHub', t:true, m:true, url: '', prop: 'searchHub' , value: {test: val => (val !== '') }},
  { key: 'usingTab', t:true, m:true, url: '', prop: 'tab' , check: {test: vals => (vals['recommendation']==undefined || vals['recommendation']=='')}, value: {test: val => (val !== '') }},
  { key: 'usingLocale', t:true, m:true, url: '', prop: 'locale' , value: {test: val => (val !== '') }},
  { key: 'usingVisitorId', t:true, m:true, url: '', prop: 'visitorId' , value: {test: val => (val !== '') }},
  { key: 'usingPipeline', t:true, url: '', prop: 'pipeline' , value: {test: val => (val !== '') }},
  { key: 'usingContext', t:true, url: '', prop: 'context' , value: {test: val => (val !== '') }},
  { key: 'NOT_usingDQ', t:true, url: '', prop: 'dq' , default:false, value: {test: val => (val == '') }},
  { key: 'NOT_usingLQ', t:true, url: '', prop: 'lq' , default:false, value: {test: val => (val == '') }},
  { key: 'NOT_usingFilterField', t:true, url: '', prop: 'filterField' , default:false, value: {test: val => (val == '') }},
  { key: 'NOT_usingPartialMatch', t:true, url: '', prop: 'partialMatch' , default:false, value: {test: val => (val == false) }},
  { key: 'NOT_usingWildcards', t:true, url: '', prop: 'enableWildcards',  default:false, value: {test: val => (val == false) }},
  { key: 'NOT_usingDuplicateFilter', t:true, url: '', prop: 'enableDuplicateFiltering' ,  default:false, value: {test: val => (val == false) }},
  { key: 'usingCommerce', t:true, url: '', prop: 'commerce' },
  { key: 'usingDictionary', t:true, url: '', prop: 'dictionaryFieldContext' },
];

//For QuerySuggest
let qsChecks = [
  { key: 'usingSearchHubQS', t:true, m:true, url: '', prop: 'searchHub' , value: {test: val => (val !== '') }},
  { key: 'usingVisitorIdQS', t:true, m:true, url: '', prop: 'visitorId' , value: {test: val => (val !== '') }},
  { key: 'usingTabQS', t:true,  url: '', prop: 'tab' , value: {test: val => (val !== '') }},
  { key: 'usingPipelineQS', t:true, url: '', prop: 'pipeline' , value: {test: val => (val !== '') }},
  { key: 'usingContextQS', t:true, url: '', prop: 'context' , value: {test: val => (val !== '') }},
  { key: 'usingLocaleQS', t:true, url: '', prop: 'locale' , value: {test: val => (val !== '') }},
];

//For ECommerce
let ecChecks = [
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, m:true,key: 'usingT', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['pageview'].includes(vals['t']) )}, prop: 't' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, m:true,key: 'usingPA', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['event'].includes(vals['t']) )}, prop: 'pa' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, m:true,key: 'usingDL', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['pageview'].includes(vals['t']) )}, prop: 'dl' , value: {test: val => (val.match(/^https?:\/\/.+/i)?true:false) }},
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, m:true,key: 'usingDR', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['pageview'].includes(vals['t']) )}, prop: 'dr' , value: {test: val => (val.match(/^https?:\/\/.+/i)?true:false) }},
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, m:true,key: 'usingDT', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['pageview'].includes(vals['t']) )}, prop: 'dt' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, m:true,key: 'usingPID', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['pageview'].includes(vals['t']) )}, prop: 'pid' , value: {test: val => (val.match(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i)?true:false) }},
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, m:true,key: 'usingCID', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['pageview'].includes(vals['t']) )}, prop: 'cid' , value: {test: val => (val.match(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i)?true:false) }},
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, m:true,key: 'usingCU', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['pageview'].includes(vals['t']) )}, prop: 'cu' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'] || vals['t'])}, m:true,key: 'usingUL', url: '/collect', check: {test: vals => (['impression','click','purchase','add','remove','detail'].includes(vals['pa']) || ['pageview'].includes(vals['t']) )}, prop: 'ul' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'])}, m:true,key: 'usingPR1ID', url: '/collect', check: {test: vals => (['click','add','remove','detail'].includes(vals['pa']) )}, prop: 'pr1id' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'])}, m:true,key: 'usingPR1QT', url: '/collect', check: {test: vals => (['click','add','remove'].includes(vals['pa']) )}, prop: 'pr1qt' , value: {test: val => (val >=1) }},
  { ectitle: {test: vals => (vals['pa'])}, m:true,key: 'usingPR1PS', url: '/collect', check: {test: vals => (['click','add','remove'].includes(vals['pa']) && vals['pal'].match(/^coveo:search:[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i)==true )}, prop: 'pr1ps' , value: {test: val => (val >=1) }},
  { ectitle: {test: vals => (vals['pa'])}, m:true,key: 'usingPR1PR', url: '/collect', check: {test: vals => (['click','add','remove','detail'].includes(vals['pa']) )}, prop: 'pr1pr' , value: {test: val => (val.match(/^\d+(\.\d+)?$/)?true:false) }},

  { ectitle: {test: vals => (vals['pa'])},m:true, key: 'usingIL1PI1ID', url: '/collect', check: {test: vals => (['impression'].includes(vals['pa']) )}, prop: 'il1pi1id' , value: {test: val => (val !== '') }},
//  { ectitle: {test: vals => (vals['pa'])}, key: 'usingIL1PI1QT', url: '/collect', check: {test: vals => (['impression'].includes(vals['pa']) )}, prop: 'il1pi1qt' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'])},m:true, key: 'usingIL1PI1PR', url: '/collect', check: {test: vals => (['impression'].includes(vals['pa']) )}, prop: 'il1pi1pr' , value: {test: val => (val.match(/^\d+(\.\d+)?$/)?true:false) }},

  { ectitle: {test: vals => (vals['pa'])}, m:true,key: 'usingTI', url: '/collect', check: {test: vals => (['purchase'].includes(vals['pa']) )}, prop: 'ti' , value: {test: val => (val !== '') }},
  { ectitle: {test: vals => (vals['pa'])}, m:true,key: 'usingTR', url: '/collect', check: {test: vals => (['purchase'].includes(vals['pa']) )}, prop: 'tr' , value: {test: val => (val !== '') }},

  { ectitle: {test: vals => (vals['pa'])}, m:true,key: 'usingPAL', url: '/collect', check: {test: vals => (['click'].includes(vals['pa']) )}, prop: 'pal' , value: {test: val => (val.match(/^coveo:search:[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i)?true:false) }},
];


//For Analytics
let analyticChecks = [

  { title: 'Click/Open', t:true, m:true, key: 'usingVisitorA', url: '/click', prop: 'visitor' , value: {test: val => (val !== '') }},
  { title: 'Click/Open', t:true, m:true,key: 'actionCause', url: '/click', prop: 'actionCause', value: {test: val => (val == 'documentquickview' || val == 'documentopen' || val =='recommendationopen' ) }}, 
  { title: 'Click/Open', t:true, m:true,key: 'documentUri', url: '/click', prop: 'documentUri', value: {test: val => (val !== '') }},
  { title: 'Click/Open', t:true, m:true,key: 'documentPosition', url: '/click', prop: 'documentPosition', value: {test: val => (val >= 1) }},
  { title: 'Click/Open', t:true, m:true,key: 'documentUri', url: '/click', prop: 'documentUri', value: {test: val => (val !== '') }},
  { title: 'Click/Open', t:true, m:true,key: 'documentUrl', url: '/click', prop: 'documentUrl', value: {test: val => (val !== '') }},
  { title: 'Click/Open', t:true, m:true,key: 'documentTitle', url: '/click', prop: 'documentTitle', value: {test: val => (val !== '') }},
  { title: 'Click/Open', t:true, m:true,key: 'documentUriHash', url: '/click', prop: 'documentUriHash', value: {test: val => (val !== '') }},
  { title: 'Click/Open', t:true, m:true,key: 'language', url: '/click', prop: 'language', value: {test: val => (val !== '') }},
  { title: 'Click/Open', t:true, m:true,key: 'searchQueryUid', url: '/click', prop: 'searchQueryUid', value: {test: val => (val !== '') }},
  { title: 'Click/Open', t:true, m:true,key: 'sourceName', url: '/click', prop: 'sourceName', value: {test: val => (val !== '') }},
  { title: 'Click/Open', t:true, m:true,key: 'contentIdKey', url: '/click', prop: 'customData/contentIdKey', value: {test: val => (val !== '') }},
  { title: 'Click/Open', t:true, m:true,key: 'contentIdValue', url: '/click', prop: 'customData/contentIdValue', value: {test: val => (val !== '') }},
  { title: 'Click/Open', t:true, key: 'userAgent', m:true,url: '/click', prop: 'userAgent' , value: {test: val => (val !== '') }},
  { title: 'Click/Open', t:true, key: 'outcome', url: '/click', prop: 'outcome' , value: {test: val => (val !== '') }},
  { title: 'Click/Open', t:true, key: 'rankingModifier', url: '/click', prop: 'rankingModifier' , value: {test: val => (val !== '') }},

  { title: 'PageView', t:true, key: 'pageViews_new', url: '/collect', prop: 't', value: 'pageview'},
  { title: 'PageView', t:true, m:true,key: 'location', url: '/view', prop: 'location', value: {test: val => (val !== '') }},
  { title: 'PageView', t:true, m:true, key: 'pageViews_contentIdKey', url: '/view', prop: 'contentIdKey', value: {test: val => (val !== '') }},
  { title: 'PageView', t:true, m:true, key: 'pageViews_contentIdValue', url: '/view', prop: 'contentIdValue', value: {test: val => (val !== '') }},
  { title: 'PageView', t:true, m:true, key: 'pageViews_language', url: '/view', prop: 'language', value: {test: val => (val !== '') }},
  { title: 'PageView', t:true, key: 'outcome', url: '/view', prop: 'outcome' , value: {test: val => (val !== '') }},
  { title: 'PageView', t:true, key: 'usingVisitorA', m:false,url: '/view', prop: 'visitor' , value: {test: val => (val !== '') }},


  { title: 'Search', t:true, m:true,key: 'usingSearchHubA', url: '/search', prop: 'originLevel1' , value: {test: val => (val !== '') }},
  { title: 'Search', t:true, key: 'usingTabA', m:true,url: '/search', prop: 'originLevel2' , value: {test: val => (val !== '') }},
  { title: 'Search', t:true, key: 'actionCause', m:true,url: '/search', prop: 'actionCause' , value: {test: val => (val !== '') }},
  { title: 'Search', t:true, key: 'usingLocaleA', m:true,url: '/search', prop: 'language' , value: {test: val => (val !== '') }},
  { title: 'Search', t:true, key: 'usingVisitorA', m:true,url: '/search', prop: 'visitor' , value: {test: val => (val !== '') }},
  { title: 'Search', t:true, key: 'queryText', m:true,url: '/search', prop: 'queryText' , check: {test: vals => ((vals['recommendation']!='' && vals['recommendation']!=undefined) || (vals['actionCause']!='interfaceLoad' && vals['actionCause']!='recommendationInterfaceLoad'))}, value: {test: val => (val !== '') }},
  { title: 'Search', t:true, key: 'userAgentA', m:true,url: '/search', prop: 'userAgent' , value: {test: val => (val !== '') }},
  { title: 'Search', t:true, key: 'searchQueryUidA', m:true,url: '/search', prop: 'searchQueryUid', value: {test: val => (val !== '') }},
  { title: 'Search', t:true, key: 'usingLevel3', url: '/search', prop: 'originLevel3', value: {test: val => (val !== '') }},
  { title: 'Search', t:true, key: 'usingPipelineA', url: '/search', prop: 'queryPipeline' , value: {test: val => (val !== '') }},
  { title: 'Search', t:true, key: 'outcome', url: '/search', prop: 'outcome' , value: {test: val => (val !== '') }},
  { title: 'Search', t:true,key: 'NOT_visitorChanged', url: '/search', prop: 'NOT visitorChanged' ,def: true, value: true},
  { title: 'Search', t:true, key: 'responseTime', url: '/search', prop: 'responseTime', value: {test: val => (val !== '') }},
  { title: 'Search', t:false, key: 'interfaceLoad', url: '/search', prop: 'actionCause', value: {test: val => (val == 'interfaceload' || val =='recommendationinterfaceload' ) }},
  { title: 'Search', t:false, key: 'interfaceChange', url: '/search', prop: 'actionCause', value: {test: val => (val == 'interfacechange' ) }},
  { title: 'Search', t:false, key: 'searchBoxSubmit', url: '/search', prop: 'actionCause', value: {test: val => (val == 'searchboxsubmit' ) }},
  { title: 'Search', t:false, key: 'searchFromLink', url: '/search', prop: 'actionCause', value: {test: val => (val == 'searchfromlink' ) }},
  { title: 'Search', t:false, key: 'searchBoxClear', url: '/search', prop: 'actionCause', value: {test: val => (val == 'searchboxclear' ) }},
  { title: 'Search', t:false, key: 'omniboxAnalytics', url: '/search', prop: 'actionCause', value: {test: val => (val == 'omniboxanalytics' ) }},
  { title: 'Search', t:false, key: 'omniboxFromLink', url: '/search', prop: 'actionCause', value: {test: val => (val == 'omniboxfromLink' ) }},
  { title: 'Search', t:false, key: 'searchAsYouType', url: '/search', prop: 'actionCause', value: {test: val => (val == 'searchasyoutype' ) }},
  { title: 'Search', t:false, key: 'omniboxField', url: '/search', prop: 'actionCause', value: {test: val => (val == 'omniboxfield' ) }},
  { title: 'Search', t:false, key: 'didyoumeanClick', url: '/search', prop: 'actionCause', value: {test: val => (val == 'didyoumeanclick' ) }},
  { title: 'Search', t:false, key: 'didyoumeanAutomatic', url: '/search', prop: 'actionCause', value: {test: val => (val == 'didyoumeanautomatic' ) }},
  { title: 'Search', t:false, key: 'resultsSort', url: '/search', prop: 'actionCause', value: {test: val => (val == 'resultssort' ) }},
  { title: 'Search', t:false, key: 'facetSelect', url: '/search', prop: 'actionCause', value: {test: val => (val == 'facetselect' ) }},
  { title: 'Search', t:false, key: 'facetDeselect', url: '/search', prop: 'actionCause', value: {test: val => (val == 'facetdeselect' ) }},
  { title: 'Search', t:false, key: 'facetExclude', url: '/search', prop: 'actionCause', value: {test: val => (val == 'facetexclude' ) }},
  { title: 'Search', t:false, key: 'facetUnexclude', url: '/search', prop: 'actionCause', value: {test: val => (val == 'facetunexclude' ) }},
  { title: 'Search', t:false, key: 'documentField', url: '/search', prop: 'actionCause', value: {test: val => (val == 'documentfield' ) }},
  { title: 'Search', t:false, key: 'breadcrumbFacet', url: '/search', prop: 'actionCause', value: {test: val => (val == 'breadcrumbfacet' ) }},
  { title: 'Search', t:false, key: 'breadcrumbResetAll', url: '/search', prop: 'actionCause', value: {test: val => (val == 'breadcrumbresetall' ) }},

  { title: 'Custom', t:true, m:true, key: 'eventType', url: '/custom', prop: 'eventType', value: {test: val => (val !== '') }},
  { title: 'Custom', t:true, m:true, key: 'eventValue', url: '/custom', prop: 'eventValue', value: {test: val => (val !== '') }},
  { title: 'Custom', t:true, m:true, key: 'language', url: '/custom', prop: 'language', value: {test: val => (val !== '') }},
  { title: 'Custom', t:false, key: 'facetSearch', url: '/custom', prop: 'eventValue', value: {test: val => (val == 'facetsearch' ) }},
  { title: 'Custom', t:false, key: 'facetUpdateSort', url: '/custom', prop: 'eventValue', value: {test: val => (val == 'facetupdatesort' ) }},
  { title: 'Custom', t:false, key: 'getMoreResults', url: '/custom', prop: 'eventType', value: {test: val => (val == 'getmoreresults' ) }},

];


let resetState = (tabId) => {
  if (tabId) {
    STATES[tabId] = {
      tabId,
      devtab: '',
      devconnection: '',
      record:[],
      recactive: false,
      recempty: true,
      uaversion:'',
      ecResults: {},
      document_url: '',
      enabled: false,
      tab: 'OverviewA',
      enabledSearch: false,
      /*usingCommerce: false,
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
      usingVisitorA: false,
      location: false,
      usingLevel3: false,
      queryText: false,
      responseTime:false,
      userAgent: false,
      outcome: false,
      documentOpen: false,
      recommendationOpen: false,
      documentQuickview: false,
      documentUri: false,
      documentUrl: false,
      documentPosition:false,
      documentUriHash: false,
      language: false,
      sourceName: false,
      pageViews_new: false,
      pageViews_contentIdKey: false,
  pageViews_contentIdValue: false,
  pageViews_language: false,
  contentIdKey: false,
  contentIdValue: false,
  rankingModifier: false,
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
      eventType: false,
      eventValue: false,
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
      NOT_visitorChanged: true,*/

      queryRequests: [],
      querySuggestRequests: [],
      recommendationRequests: [],
      analyticRequests: [],
      ecommerceRequests: [],
      dev: [],
      searchReport: '',
      searchInd: true,
      qsReport: '',
      qsInd: true,
      analyticReport: '',
      analyticInd: true,
      ecReport: '',
      ecInd: true
    };
    let state = STATES[tabId];
    //Add global state
    state = Object.assign(state, GLOBAL);
    initResults(state);
    STATES[tabId] = state;
  }
  else {
    getTabId_Then(resetState);
  }
};

let initResults=(state) => {
  defaultECResults.map(key => {
    state.ecResults[key]={};
    state.ecResults[key]['Count']=0;
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

function processUpdate(state) {
  addEcResults(state);
  //state.record =  testcase_items;
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  //console.log(msg.action);
  if (msg.type === 'getState') {
    getTabId_Then(tabId => {
      getState_Then(state => {
        processUpdate(state);
        sendResponse(state);
      });
    });
    return true;
  }
  if (msg.action === 'setVersion') {
    getTabId_Then(tabId => {
      getState_Then(state => {
        state.uaversion = msg.v;
        saveState(state, tabId);
      });
    });
    return true;
  }
  if (msg.action === 'gotLoc') {
    getTabId_Then(tabId => {
      getState_Then(state => {
        state.document_url = msg.url;
        saveState(state, tabId);
      });
    });
    return true;
  }
  //got beacon request from content.js
  if (msg.action === 'beacon') {
    getTabId_Then(tabId => {
      getState_Then(state => {
        if (!state.enabledSearch) return true;
        if (msg.data==undefined) return true;
        let posted = JSON.parse(msg.data);
        let events = {};
        events = getURLParams(msg.url);
        Object.assign(posted, events);
        console.log('POST: BEACON READY TO SENT '+currentRequestId);

        if (msg.url.indexOf('/collect')==-1) {
          state.analyticRequests.unshift({url:msg.url});
          let content=doChecks(posted, msg.url, analyticChecks, state, 'analyticReport','analyticInd');
          let rec = {type:'AR',time:getTime(),req:currentRequestId,data:content, request: {type:'Analytics (beacon)',url:msg.url, data:posted} };
          //Check if we have currentResponse, that means the onCompleted was already executed
          if (currentResponse!=''){
            rec.statusCode = currentResponse;
            if (state.devconnection!='') state.devconnection.postMessage(rec);
          }
          state.dev.unshift(rec);
          //not now, later when response is received if (state.devconnection!='') state.devconnection.postMessage(rec);
        } else {
          let content=doChecks(posted, msg.url, ecChecks, state, 'ecReport','ecInd');
          state.ecommerceRequests.unshift({url:msg.url});
          let rec = {type:'EC',time:getTime(),req:currentRequestId,data:content, title: content.title, request: {type:'E Commerce (beacon)',url:msg.url, data:posted} };
          //Check if we have currentResponse, that means the onCompleted was already executed
          if (currentResponse!=''){
            rec.statusCode = currentResponse;
            if (state.devconnection!='') state.devconnection.postMessage(rec);
          }
          state.dev.unshift(rec);
        }
        currentRequestId = '';
        //not now if (state.devconnection!='') state.devconnection.postMessage(rec);        
        saveState(state, tabId);
      });
    });
    return true;
  }
  if (msg.action == "append") {
    //Do not record CoveoResponseChecker controls
    getTabId_Then(tabId => {
      getState_Then(state => {
    if (msg.obj.info==undefined) {
      state.record[state.record.length] = msg.obj;
      state.recempty = false;

    } else {
    if (msg.obj.info.id.indexOf('CoveoResponseChecker')==-1 && msg.obj.info.selector.indexOf('CoveoResponseChecker')==-1) {
      
      state.record[state.record.length] = msg.obj;
      state.recempty = false;
      }
    }
        saveState(state, tabId);
      });
    });
    sendResponse({});
    return true;
  }
  if (msg.action == "poke") {
    getTabId_Then(tabId => {
      getState_Then(state => {
    state.record[state.record.length - 1] = msg.obj;
      });
    });
    sendResponse({});
    return true;
  }
  if (msg.action == "get_status") {
    getTabId_Then(tabId => {
      getState_Then(state => {
        console.log('GET STATUS: '+state.recactive);
        chrome.tabs.sendMessage(tabId, {
          action: "sent_status",
          active: state.recactive, empty: state.recempty
        });
        //sendResponse({ active: state.recactive, empty: state.recempty });
      });
    });
    return true;
    
  }
  if (msg.action == "get_items") {
    getTabId_Then(tabId => {
      getState_Then(state => {
    sendResponse({ items: state.record });
  });
});
return true;
}
  /*if (msg.action=="stoprecord") {
    active = false;
    chrome.tabs.create({ url: "./js/nightwatch.html" });
  }*/

  

  else if (msg.type === 'navigate') {
    navigateto(msg.to);
  }
  else if (msg.type=='download') {
    getTabId_Then(tabId => {
      chrome.tabs.sendMessage(tabId || null, msg);
    });
  }
  else if (msg.type === 'reset') {
    getTabId_Then(tabId => {
      //save dev connection
      let devc='';
      let devt='';
      let loc = '';
      getState_Then(state1 => {
        loc = state1.document_url;
        devc = state1.devconnection;
        devt = state1.devtab;
      resetState(tabId);
      getState_Then(state => {
        //Enable it again
        state.enabled = false;
        state.document_url = loc;
        state.devconnection = devc;
        state.devtab = devt;
        if (state.devconnection!='') state.devconnection.postMessage({all:state.dev});
        setEnabledSearch(state.enabled);
        saveState(state, tabId);
        //sendUpdate(state);
        sendResponse(getState(tabId));
      });
    });
      //sendResponse({ tabId });
    });
    return true;
  }
  else if (msg.type === 'tabset') {
      getTabId_Then(tabId => {
        getState_Then(state => {
          //Enable it again
          state.tab = msg.tab;
          saveState(state, tabId);
        });
      });
      return true;
    }
  else if (msg.type === 'enablesearch') {
    setEnabledSearch(msg.enable);
    if (msg.enable) {
      getTabId_Then(tabId => {
        getState_Then(state => {
        state.record = [];
        //chrome.tabs.update(tabId, { url: msg.start_url }, function(tab) {
          //alert("You are now recording your test sequence. Make sure to press the actual search box icon :)");
          chrome.tabs.sendMessage(tabId, {
            action: "open",
            url: state.document_url
          });
          if (!state.recactive) {
            state.recactive = true;
            state.recempty = true;
          chrome.tabs.sendMessage(tabId,{
            action: "start",
            recorded_tab: tabId,
            start_url: state.document_url
          });
        }
        saveState(state, tabId);
          //sendResponse({ start: true });
        //});
      });
    });
    return true;
    } else {
      
      getTabId_Then(tabId => {
        getState_Then(state => {
          state.recactive = false;
          saveState(state, tabId);
      chrome.tabs.sendMessage(tabId, { action: "stop" });
      sendResponse({});
        });
      });
      return true;
    }
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
    return true;
  }
  /*else if (msg.action == "stop") {
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
        //alert("You are now recording your test sequence. Make sure to press the actual search box icon :)");
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
  }*/
  /*else {
    // proxy to content (tabs)
    getTabId_Then(tabId => {
      chrome.tabs.sendMessage(tabId || null, msg);
    });
  }*/
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
      //saveState({ 'document_url': document_url }, tabId);
    }
  }
  else if (info.status === 'complete') {
    saveState({ ready: true }, tabId);
    getState_Then(state => {
    let msg = {
      type: "enabled",
      global: state
    };
    if (state.enabledSearch) chrome.tabs.sendMessage(tabId, msg);
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

function getParameterCaseInsensitive(object, key) {
  return object[Object.keys(object)
    .find(k => k.toLowerCase() === key.toLowerCase())
  ];
}

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

let doChecks = function(postedString, url, checks, state, report,reportindicator) {
  //console.log(postedString);
  state[report] = '';
  
  let content = '';
  let curtitle = '';
  let curvalue = '';
  let curcontent = '';
  let curcontentfordev = '';
  let oneisbad = false;
  let oneisbadSingle = false;
  let first = true;
    checks.map(check => {
      let isValid = false;
      let isValidSingle = false;
      let value = '';
      let title='';
      let go = true;
      let mandatory = false;
      if (check.m !== undefined) {
        mandatory = check.m;
      }
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
        curvalue = '';
        let prop = check.prop;
        let parent = '';
        if (prop.indexOf('/')!=-1) {
          //We have a nested property
          prop = check.prop.split('/')[1];
          parent = check.prop.split('/')[0];
        }
        if (parent !='') {
          if (getParameterCaseInsensitive(postedString, parent)) {
            let nested = postedString[parent];
            if (getParameterCaseInsensitive(nested, prop)) {
               value = getParameterCaseInsensitive(nested, prop);
            
            if (typeof value === 'string' || value instanceof String){
              value = value.toLowerCase();
              
            }
            curvalue = value;
            check.lastValue = value;
          }
        }

        } else {
          if (getParameterCaseInsensitive(postedString, check.prop)) {
            value = getParameterCaseInsensitive(postedString, check.prop);
            if (typeof value === 'string' || value instanceof String){
              value = value.toLowerCase();
              
            }
            curvalue = value;
            check.lastValue = value;
          }
        }
        //If check.check is there we need to check if that is available
        if (check.check !== undefined) {
          if (check.check.test) {
            go = check.check.test(postedString);
          }
        }  
      
        //If check.title is there we need to check if that is available
        if (check.ectitle !== undefined) {
          if (check.ectitle.test) {
            title = check.ectitle.test(postedString);
          } else {
            title = check.ectitle;
            }
          }  
      
      if (check.value !== undefined) {
        if (check.value.test) {
          try {
            isValid = check.value.test(value);
          }
          catch(e) {
            isValid = check.value.test(value.toString());
          }
          isValidSingle = isValid;
        }
        else {
          isValid = (value === check.value);
          isValidSingle = isValid;
        }
      }
    }
      //Check if we have a valid check in the state
      //first get the old value of the state
      let def_value = true;
      if (check.default !== undefined) {
        def_value = check.default;
      }
      //if (check.key in state) {
        if (state[check.key]==def_value) {
          isValid = def_value;
          if (check.lastValue != undefined) {
            value = check.lastValue;
          }
        }
      //}
      //We need to save the ecResults
      if (go) {
      if (title!='')  {
        if (state.ecResults[title]==undefined) {
          state.ecResults[title]={};
        }
        if (first) {
          let current = state.ecResults[title]['Count'];
          if (current==undefined) current = 0;
          state.ecResults[title]['Count'] = current +1;
          first = false;
        }
        curtitle=title;
        state.ecResults[title][check.key] = isValid;
        curcontentfordev += `<li class='${isValidSingle?"validInd":"notvalidInd"}${mandatory?" ":" notmandatory"}'>${check.prop}<span class='propvalue'>${curvalue}${def_value==false?"(should be false or empty)":""}</span></li>`;
        if (!isValid && mandatory) oneisbad = true;
        if (!isValidSingle && mandatory) oneisbadSingle = true;
      }
    }
      //If key is not in state, give warning
      if (title=='') {
        state[check.key] = isValid;
        if (!isValid && mandatory) oneisbad = true;
        if (check.t && go) {
          if (!isValidSingle && mandatory) oneisbadSingle = true;
        }
        let ctitle = '';
        if (check.title !== undefined){
          /*if (curtitle!=check.title) {
            //We need to close the previous line
            //content+= `<tr><td>${check.title}</td>${curcontent}</tr>`;
            curtitle = check.title;
            curcontent = '';
          } else {
            //Same title so we need to collect the td only
            curcontent+= `<td class='${isValid?"valid":"notvalid"}${mandatory?" ":" notmandatory"}'></td><td>${check.key}</td><td>${value}</td><td class="help"></td>`;    
            curcontentfordev += `<li class='${isValidSingle?"validInd":"notvalidInd"}${mandatory?" ":" notmandatory"}'>${check.key} (${value})</li>`;
          }*/
          ctitle = check.title+' - '+(check.t?check.prop:check.key);
        } else {
          ctitle = check.t?check.prop:check.key;
          curcontent+= `<td class='${isValid?"valid":"notvalid"}${mandatory?" ":" notmandatory"}'></td><td>${check.key}</td><td>${value}${def_value==false?"(should be false or empty)":""}</td>`;   
        }
        
        content+= `<tr><td class='${isValid?"valid":"notvalid"}${mandatory?" ":" notmandatory"}'></td><td>${ctitle}</td><td>${value}${def_value==false?"(should be false or empty)":""}</td></tr>`;
        if (check.t && go) curcontentfordev += `<li class='${isValidSingle?"validInd":"notvalidInd"}${mandatory?" ":" notmandatory"}'>${check.prop}<span class='propvalue'>${curvalue}${def_value==false?"(should be false or empty)":""}</span></li>`;
        //curcontentfordev += `<li class='${isValidSingle?"validInd":"notvalidInd"}${mandatory?" ":" notmandatory"}'>${ctitle} (${value})</li>`;

      } /*else {
        console.log('MAYDAY: key '+check.key+' NOT IN STATE!!!!');
      }*/
//    }
    });
    //content+= `<tr><td>${curtitle}</td>${curcontent}</tr>`;
    state[report] = content;
    state[reportindicator]=oneisbad;
    saveState(state, state.tabId);
    return {content:curcontentfordev,flag:oneisbadSingle,title:curtitle};
}

function getURLParams(url) {
  let newurl = new URL(url);
  let params = new URLSearchParams(newurl.search);
  const result = {}
  for(const [key, value] of params) { // each 'entry' is a [key, value] tupple
    result[key] = value;
  }
  return result;
}

let onSearchRequest = function (details) {
  if (details.method=="OPTIONS" || details.method=="GET") return;
  if (details.url.indexOf('/analytics/')>0) return;
  if (details.url.indexOf('/log?')>0) return;
  if (details.url.indexOf('/values/batch?')>0) return;
  if (details.url.indexOf('/plan?')>0) return;
  let events = {};
  events = getURLParams(details.url);
  getState_Then(state => {
    if (!state.enabledSearch) return;
    if (details.statusCode) {
      //We have a OnCompleted request
      //Handle the statusCode
      let welldone = details.statusCode==200;
      //find URL in our dev list and update statuscode
      let req = details.requestId;
      console.log("CATCHED Search ON COMPLETE: ", details.requestId);
      for (let i = 0; i < state.dev.length; ++i) {

         if (state.dev[i].request.url == details.url && state.dev[i].req == req) {
          state.dev[i].statusCode = details.statusCode;
           if (state.devconnection!='') state.devconnection.postMessage(state.dev[i]);
           break;
         }
      }
      return;
    }
    let thisState = {};
    console.log("CATCHED Search ", details.url);
    console.log("CATCHED Search ", details.requestId);
    if (details.url.includes('querySuggest')) {
        console.log("CATCHED querySuggest ", details.url);
        thisState.suggestSent = true;
        if (state.querySuggestRequests==undefined) {
          state.querySuggestRequests = [];
        }
        let raw = details.requestBody && details.requestBody.raw,
        formData = (details.requestBody && details.requestBody.formData) || {};

        let postedString = getData(raw, formData,events);
        state.querySuggestRequests.unshift({url:details.url});
        let content=doChecks(postedString, details.url, qsChecks, state, 'qsReport','qsInd');
        let rec = {type:'QS',time:getTime(), req:details.requestId,data:content, request: {type:'Query Suggest',url:details.url, data:postedString} };
        state.dev.unshift(rec);
        //not now, later if (state.devconnection!='') state.devconnection.postMessage(rec);

    }
   else if (details.url.includes('facet')) {
      console.log("CATCHED facet ", details.url);
      thisState.facetSearchSent = true;
  }
    else {

      let raw = details.requestBody && details.requestBody.raw,
        formData = (details.requestBody && details.requestBody.formData) || {};

      let postedString = getData(raw, formData,events);
      
      if (state.queryRequests==undefined) {
        state.queryRequests = [];
      }

      state.queryRequests.unshift({url:details.url});
      //console.log(postedString);
      // thisState.queryExecuted = postedString;
      var fullstring = JSON.stringify(postedString);
      let content=doChecks(postedString, details.url, searchChecks, state, 'searchReport','searchInd');
      let rec = {type:'QR',time:getTime(),req:details.requestId,data:content, request: {type:'Query',url:details.url, data:postedString} };
      state.dev.unshift(rec);
      //not now, later if (state.devconnection!='') state.devconnection.postMessage(rec);
      
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
  Object.keys(state.ecResults).map((key) => { 
    let line = `<tr><td>${key}</td>`;
    Object.keys(state.ecResults[key]).map((prop) => { 
      if (prop=='Count') {
        line+=`<td style="border-right:none;min-width: 1px;"></td><td style="border-left:none">${state.ecResults[key][prop]} Request(s)</td>`;
      } else {
        line+=`<td class=${state.ecResults[key][prop]?"valid":"notvalid"} style="border-right:none"></td><td style="border-left:none">${prop}</td>`;
      }
    });
    line += "</tr>";
    state.ecReport += line;
  });

}

let onAnalyticsRequest = function (details) {
  if (details.method=="OPTIONS") return;
  //We do not want to track Google GTM events
  if (details.url.startsWith('https://www.google-analytics')) return;
  getState_Then(state => {
    if (!state.enabledSearch) return;
    if (details.statusCode) {
      //We have a OnCompleted request
      //Handle the statusCode
      let welldone = details.statusCode==200;
      //find URL in our dev list and update statuscode
      let req = details.requestId;
      let found = false;
      console.log('REQUEST ID BEACON: '+req);
      for (let i = 0; i < state.dev.length; ++i) {

         if (state.dev[i].request.url == details.url  && state.dev[i].req == req) {
          state.dev[i].statusCode = details.statusCode;
          found = true;
           if (state.devconnection!='') state.devconnection.postMessage(state.dev[i]);
           break;
         }
      }
      if (!found) {
        currentResponse = details.statusCode;
      } else {
        currentResponse = '';
      }
      return;
      //update dev list in chrome devtools
    }
    let thisState = {};
    let events = {};
    events = getURLParams(details.url);
  
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
    let eventsU;
    try {
      searchEvents = uri.searchParams.get("searchEvents");
      eventsU = JSON.parse(decodeURIComponent(searchEvents))[0];
    }
    catch(e)
    {

    }
    try {
      searchEvents = uri.searchParams.get("collectEvent");
      eventsU = JSON.parse(decodeURIComponent(searchEvents))[0];
    }
    catch(e)
    {

    }
    //Try clickevents
    if (!eventsU) {
      try {
        searchEvents = uri.searchParams.get("clickEvent");
        eventsU = JSON.parse(decodeURIComponent(searchEvents));
      }
      catch(e)
      {
  
      }
    }
    //Try customevents
    if (!eventsU) {
      try {
        searchEvents = uri.searchParams.get("customEvent");
        eventsU = JSON.parse(decodeURIComponent(searchEvents));
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

    //Check if we need to add the visitor to the JSON
    if (!eventsU) {
      eventsU = {};
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
    if (visitor) {
      eventsU['visitor'] = visitor;
      if (thisState.NOT_visitorChanged==true) {
      eventsU['NOT_visitorChanged'] = false;
      }
    }
  }
    //Assign eventsU to the normal events
    Object.assign(events, eventsU);
    console.log("CATCHED Analytics ", details.url);
    console.log("CATCHED Analytics ", details.requestId);
    thisState.analyticsSent = true;
    currentRequestId = details.requestId;

    //Do nothing if raw==undefined and Object.keys(formData).length==0
    //Data will come in through the beacon event
    if (raw==undefined && Object.keys(formData).length==0 /* && Object.keys(events).length<5*/) {
      console.log('POST: EMPTY BEACON');
      //We need this for our beacon POST
      return;
    } else {
      console.log('POST: NON EMPTY BEACON'+ (raw==undefined) +'-'+ Object.keys(formData).length+'-'+ Object.keys(events).length);
    }

    let postedString = getData(raw, formData, events);
    if (details.url.indexOf('/collect')==-1) {
      state.analyticRequests.unshift({url:details.url});
      let content=doChecks(postedString, details.url, analyticChecks, state, 'analyticReport','analyticInd');
      let rec = {type:'AR',time:getTime(), req:details.requestId,data:content, request: {type:'Analytics',url:details.url, data:postedString} };
      state.dev.unshift(rec);
      //not now, later when response is received if (state.devconnection!='') state.devconnection.postMessage(rec);
    } else {
      let content=doChecks(postedString, details.url, ecChecks, state, 'ecReport','ecInd');
      //In case of beacon, there is no content
      if (content.content!='') {
        state.ecommerceRequests.unshift({url:details.url});
        let type = 'E Commerce';
        /*if (details.url.startsWith('https://www.google-analytics')) {
          type += ' (Google GTM)';
        }*/
        let rec = {type:'EC',time:getTime(), req:details.requestId,data:content, title: content.title, request: {type:type,url:details.url, data:postedString} };
        state.dev.unshift(rec);
        //not now, later when response is received. if (state.devconnection!='') state.devconnection.postMessage(rec);
      }
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
  //sendResponse(getState(state.tabId));
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
chrome.webRequest.onCompleted.addListener(onAnalyticsRequest, FILTER_ANALYTICS, ['responseHeaders']);
chrome.webRequest.onCompleted.addListener(onSearchRequest, FILTER_SEARCH, ['responseHeaders']);

chrome.tabs.onActivated.addListener(function(activeInfo) {
  activeTabId = activeInfo.tabId;
  getState_Then(state => {
  if (state.enabledSearch) {
    chrome.browserAction.setIcon({ path: './images/80 B rounded square.png' })
    chrome.browserAction.setBadgeText({ text: 'REC' })
    
  } else {
    chrome.browserAction.setIcon({ path: './images/80 B rounded square.png' })
    chrome.browserAction.setBadgeText({ text: ' ❚❚' })
    
  }
  });
});

chrome.browserAction.setIcon({ path: './images/80 B rounded square.png' });
chrome.browserAction.setBadgeBackgroundColor({color: '#1372EC'});
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
    chrome.browserAction.setIcon({ path: './images/80 B rounded square.png' })
    chrome.browserAction.setBadgeText({ text: 'REC' })
    
  } else {
    chrome.browserAction.setIcon({ path: './images/80 B rounded square.png' })
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


chrome.runtime.onConnect.addListener(function(devToolsConnection) {
  // assign the listener function to a variable so we can remove it later
  console.log(devToolsConnection);
  var devToolsListener = function(message, sender, sendResponse) {
      //Save the devtools tab in the state
      if (message.name=='init') {
      getState_Then(state => {
        state.devtab = message.tabId;
        state.devconnection = devToolsConnection;
        saveState(state, state.tabId);
        //Sent what we currently have in state.dev
        state.devconnection.postMessage({all:state.dev});
      });
    }
    if (message.name=='cleardev') {
      getState_Then(state => {
        state.dev=[];
        saveState(state, state.tabId);
      });

    }
      
  }
  // add the listener
  devToolsConnection.onMessage.addListener(devToolsListener);

  devToolsConnection.onDisconnect.addListener(function() {
    getState_Then(state => {
      state.devtab = '';
      state.devconnection = '';
      saveState(state, state.tabId);
    });
       devToolsConnection.onMessage.removeListener(devToolsListener);
  });
});