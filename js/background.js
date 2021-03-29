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
//const FILTER_SEARCH = { urls: ["*://*/rest/search/*", "*://*/search/*", "*://*/*/search/*", "*://*/*/CoveoSearch/*", "*://*/?errorsAsSuccess=1", "*://*/*&errorsAsSuccess=1*", "https://*/rest/search/v2/*", "https://*/rest/search/v2*", "https://*/coveo-search/v2*", "https://*/*/rest/search/v2*", "https://*/*/*/rest/search/v2*", "https://*/coveo/rest/v2*", "https://cloudplatform.coveo.com/rest/search/*", "*://platform.cloud.coveo.com/rest/search/v2/*", "https://search.cloud.coveo.com/rest/search/v2/*", "*://*/*/coveo/platform/rest/*", "*://*/coveo/rest/*"] };
//const FILTER_ANALYTICS = { urls: ["https://*.cloud.coveo.com/*/analytics/collect*","https://*.cloud.coveo.com/*analytics*","https://*rest/coveoanalytics/*","https://*/rest/coveoanalytics/*","https://*/analytics/collect*","*://*/*coveo/rest/coveoanalytics/*", "*://*/rest/v15/analytics/*", "*://*/collect/*", "*://*/*/collect/*", "*://*/collect*", "*://*/*/collect*", "*://*/v1/analytics/search*", "*://usageanalytics.coveo.com/rest/*", "*://*/*/coveo/analytics/rest/*", "*://*/*/rest/ua/*", "*://*/rest/ua/*", "*://*/*/coveoanalytics/rest/*"] };
const FILTER_SEARCH = { urls: ["*://*/rest/search/*", "*://*/search/*", "*://*/*/search/*", "*://*/*/CoveoSearch/*", "*://*/?errorsAsSuccess=1", "*://*/*&errorsAsSuccess=1*", "https://*/rest/search/v2*", "https://*/coveo-search/v2*", "https://*/*/rest/search/v2*", "https://*/*/*/rest/search/v2*", "https://*/coveo/rest/v2*", "https://cloudplatform.coveo.com/rest/search/*", "*://platform.cloud.coveo.com/rest/search/v2/*", "https://search.cloud.coveo.com/rest/search/v2/*", "*://*/*/coveo/platform/rest/*", "*://*/coveo/rest/*"] };
const FILTER_ANALYTICS = { urls: ["https://*/*analytics*","https://*/*collect*"]};

let getTabId_Then = (callback) => {
  this.getActiveTab((tabs) => {
    callback(tabs.id);
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

let defaultECResults = ['add', 'remove', 'detail', 'pageview', 'click', 'purchase', 'event','impression'];

let translation = {
  eventCategory: 'ec',
  eventAction: 'ea',
  eventLabel: 'el',
  eventValue: 'ev',
  page: 'dp',
  visitorId: 'cid',
  clientId: 'cid',
  userId: 'uid',
  currencyCode: 'cu',
  hitType: 't',
  pageViewId: 'pid',
  encoding: 'de',
  location: 'dl',
  referrer: 'dr',
  screenColor: 'sd',
  screenResolution: 'sr',
  title: 'dt',
  userAgent: 'ua',
  language: 'ul',
  eventId: 'z',
  time: 'tm',
  id: 'id',
  name: 'nm',
  brand: 'br',
  category: 'ca',
  variant: 'va',
  price: 'pr',
  quantity: 'qt',
  coupon: 'cc',
  position: 'ps',
  action: 'pa',
  list: 'pal',
  listSource: 'pls',
}

let getTranslation = (key) => {
  let found = '';
  Object.keys(translation).map(attr => {
    if (translation[attr] == key) {
      found = attr;
    }
  });
  return found;
}

/*
const ticketKeysMapping: { [key in keyof Ticket]: string } = {
  id: 'svc_ticket_id',
  subject: 'svc_ticket_subject',
  description: 'svc_ticket_description',
  category: 'svc_ticket_category',
  productId: 'svc_ticket_product_id',
  custom: 'svc_ticket_custom',
};*/

/*
const transactionActionsKeysMapping: { [name: string]: string } = {
  id: 'ti',
  revenue: 'tr',
  tax: 'tt',
  shipping: 'ts',
  coupon: 'tcc',
  affiliation: 'ta',
  step: 'cos',
  option: 'col',
};*/

//In the Checks use the scenario id stated here
//Use the same parent if the tests need to check for the same persistent values
//When resetvalues is being found the persistent values will be cleared
let scenarios = [
  { title: 'ECommerce 1. Home Page view (anonymous)', id: 1, parent: 1, resetvalues: true, instructions: 'Refresh homepage.<br>Make sure you are not logged in.' },
  { title: 'ECommerce 1.1. Recommendations on Home Page', id: 11, parent: 1, instructions: 'Recommendations are displayed (with prices) on the home page.<br>An Impression event must be sent.' },
  { title: 'ECommerce 1.2. Click on 1st Recommendation Quickview Home Page', id: 12, parent: 1, instructions: 'Click on the first <b>Quickview</b> in the Recommended products section.' },
  { title: 'ECommerce 1.3. Click on 1st Recommendation Add To Cart Home Page', id: 13, parent: 1, instructions: 'Click on the first <b>Add To Cart</b> in the Recommended products section.' },
  { title: 'ECommerce 1.4. Click on 2nd Recommendation Quickview Home Page', id: 14, parent: 1, instructions: 'Click on the second <b>Quickview</b> in the Recommended products section.' },
  { title: 'ECommerce 1.5. Click on 2nd Recommendation Add To Cart Home Page', id: 13, parent: 1, instructions: 'Click on the second <b>Add To Cart</b> in the Recommended products section.' },
  { title: 'ECommerce 1.6. Click on 2nd Recommendation Hyperlink', id: 16, parent: 1, instructions: 'Click on the second recommendation in the Recommended products section.' },
  { title: '2. Home Page view', id: 2, parent: 2, resetvalues: true, instructions: 'Refresh homepage.' },
  { title: '2.1. Click on Recommendation Home Page', id: 21, parent: 2, instructions: 'Click on first recommended product.<br>Add to Cart.' },
  { title: 'Normal 10. Home Page view', id: 10, parent: 1, resetvalues: true, instructions: 'Refresh homepage.<br>' },
  { title: 'Normal 10.1 Home Page Query Suggest', id: 101, parent: 1, instructions: 'Start typing in the global searchbox.<br>Hit enter to start searching.' },
]

//For search and plan
//t ==> for Totals
//m ==> Mandatory
//sc ==> scenarios 
//    sc {id:ID FROM THE ABOVE SCENARIO
//        ectitle: 'add,purchase' => which ectitles to use (comma seperated)}
//p ==> persistent during session
//pp ==> persistent during page view
//ex ==> Expected (note to the end user), default = 'Not empty'
let searchChecks = [
  { sc: [{ id: 101}],key: 'usingSearchHub', t: true, m: true, url: '', prop: 'searchHub', value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],key: 'usingTab', t: true, m: true, url: '', prop: 'tab', check: { test: vals => (vals['recommendation'] == undefined || vals['recommendation'] == '') }, value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],key: 'usingLocale', t: true, m: true, url: '', prop: 'locale', value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],key: 'usingVisitorId', p: true, t: true, m: true, url: '', prop: 'visitorId', value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],key: 'q', t: true, m: true, url: '', prop: 'q', value: { test: val => (val != '') } },
  { sc: [{ id: 101}],key: 'aq', t: true, url: '', prop: 'aq', value: { test: val => (val != '') } },
  { sc: [{ id: 101}],key: 'cq', t: true, url: '', prop: 'cq', value: { test: val => (val != '') } },
  { sc: [{ id: 101}],key: 'usingPipeline', t: true, url: '', prop: 'pipeline', value: { test: val => (val == '') }, ex:'Should be empty' },
  { sc: [{ id: 101}],key: 'recommendation', t: true, url: '', prop: 'recommendation', value: { test: val => (val == '') }, ex:'Should be empty with normal search' },
  { sc: [{ id: 101}],key: 'usingContext', t: true, url: '', prop: 'context', value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],key: 'NOT_usingDQ', t: true, url: '', prop: 'dq', default: false, value: { test: val => (val == '') } ,ex:'Should be false, decreases performance'},
  { sc: [{ id: 101}],key: 'NOT_usingLQ', t: true, url: '', prop: 'lq', default: false, value: { test: val => (val == '') } , ex:'Should be false, decreases performance'},
  { sc: [{ id: 101}],key: 'NOT_usingFilterField', t: true, url: '', prop: 'filterField', default: false, value: { test: val => (val == '') } ,ex:'Should be false, decreases performance'},
  { sc: [{ id: 101}],key: 'NOT_usingPartialMatch', t: true, url: '', prop: 'partialMatch', default: false, value: { test: val => (val == false) } ,ex:'Should be false, decreases performance'},
  { sc: [{ id: 101}],key: 'NOT_usingWildcards', t: true, url: '', prop: 'enableWildcards', default: false, value: { test: val => (val == false) } ,ex:'Should be false, decreases performance'},
  { sc: [{ id: 101}],key: 'NOT_usingDuplicateFilter', t: true, url: '', prop: 'enableDuplicateFiltering', default: false, value: { test: val => (val == false) } ,ex:'Should be false, decreases performance'},
  { sc: [{ id: 101}],key: 'usingCommerce', t: true, url: '', prop: 'commerce' , ex:'In case of Commerce queries, should contain commerce parameters'},
  { sc: [{ id: 101}],key: 'usingDictionary', t: true, url: '', prop: 'dictionaryFieldContext', ex:'In case of Commerce queries, dictionary fields'},
];

//For QuerySuggest
let qsChecks = [
  { sc: [{ id: 101}], key: 'usingSearchHubQS', t: true, m: true, url: '', prop: 'searchHub', value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],key: 'usingVisitorIdQS', p: true, t: true, m: true, url: '', prop: 'visitorId', value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],key: 'usingTabQS', t: true, url: '', prop: 'tab', value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],key: 'usingPipelineQS', t: true, url: '', prop: 'pipeline', value: { test: val => (val == '') } , ex:'Should be empty'},
  { sc: [{ id: 101}],key: 'usingContextQS', t: true, url: '', prop: 'context', value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],key: 'usingLocaleQS', t: true, url: '', prop: 'locale', value: { test: val => (val !== '') } },
];

//For ECommerce
//make sure you always start with pa or t, then set first to true
let ecChecks = [
  //t=pageview
  { sc: [{ id: 1, ectitle:'pageview'},{ id: 16, ectitle:'pageview'}], ectitle: {test: vals => (vals['t'])}, first:true, m: true, key: 'tpv', url: '/collect', check: { test: vals => (['pageview'].includes(vals['t'])) }, prop: 't', value: { test: val => (val == 'pageview') }, ex:'pageview' },
  { sc: [{ id: 1, ectitle:'pageview'},{ id: 16, ectitle:'pageview'}], ectitle: {test: vals => (vals['t'])}, m: true, p: true, key: 'cidpv', url: '/collect', check: { test: vals => (['pageview'].includes(vals['t'])) }, prop: 'cid', value: { test: val => (val.match(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) }, ex:'/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/' },
  { sc: [{ id: 1, ectitle:'pageview'},{ id: 16, ectitle:'pageview'}], ectitle: {test: vals => (vals['t'])}, m: true, key: 'dlpv', url: '/collect', check: { test: vals => (['pageview'].includes(vals['t'])) }, prop: 'dl', value: { test: val => (val.match(/^https?:\/\/.+/i) ? true : false) }, ex:'/^https?:\/\/.+' },
  { ectitle: {test: vals => (vals['t'])}, m: false, key: 'dtpv', url: '/collect', check: { test: vals => (['pageview'].includes(vals['t'])) }, prop: 'dt', value: { test: val => (val !== '') } },
  { sc: [{ id: 1, ectitle:'pageview'},{ id: 16, ectitle:'pageview'}], ectitle: {test: vals => (vals['t'])}, m: true, p: true, pp: true, key: 'pidpv', url: '/collect', check: { test: vals => (['pageview'].includes(vals['t'])) }, prop: 'pid', value: { test: val => (val.match(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) }, ex:'/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/'},
  { sc: [{ id: 1, ectitle:'pageview'},{ id: 16, ectitle:'pageview'}], ectitle: {test: vals => (vals['t'])}, m: true, key: 'cupv', url: '/collect', check: { test: vals => (['pageview'].includes(vals['t'])) }, prop: 'cu', value: { test: val => (val !== '') } },
  { ectitle: {test: vals => (vals['t'])}, m: false, key: 'ulpv', url: '/collect', check: { test: vals => (['pageview'].includes(vals['t'])) }, prop: 'ul', value: { test: val => (val !== '') } },
  { sc: [{ id: 1, ectitle:'pageview', value: { test: val => (val == '') }, ex:'Empty/undefined'},{ id: 16, ectitle:'pageview'}], ectitle: {test: vals => (vals['t'])}, m: false, key: 'uidpv', url: '/collect', check: { test: vals => (['pageview'].includes(vals['t'])) }, prop: 'uid', value: { test: val => (val !== '') }},
  //t=event ==> does not needs to be added, is a check with pa etc.
  //impression il1pi1id exists
  { sc: [{ id: 11, ectitle:'impression'}], ectitle: {test: vals => ('impression')}, first:true, m: true, key: 'tim', url: '/collect', check: { test: vals => (['event'].includes(vals['t']) && vals['il1pi1id']) }, prop: 't', value: { test: val => (val == 'event') } ,ex:'event'},
  { sc: [{ id: 11, ectitle:'impression'}], ectitle: {test: vals => ('impression')}, m: true, p: true, key: 'cidim', url: '/collect', check: { test: vals => (['event'].includes(vals['t']) && vals['il1pi1id']) }, prop: 'cid', value: { test: val => (val.match(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) } , ex:'/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/'},
  { sc: [{ id: 11, ectitle:'impression'}], ectitle: {test: vals => ('impression')}, m: true, key: 'dlim', url: '/collect', check: { test: vals => (['event'].includes(vals['t']) && vals['il1pi1id']) }, prop: 'dl', value: { test: val => (val.match(/^https?:\/\/.+/i) ? true : false) }, ex:'/^https?:\/\/.+/' },
  { sc: [{ id: 11, ectitle:'impression'}], ectitle: {test: vals => ('impression')}, m: true, p: true, pp: true, key: 'pidim', url: '/collect', check: { test: vals => (['event'].includes(vals['t']) && vals['il1pi1id']) }, prop: 'pid', value: { test: val => (val.match(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) }, ex:'/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/'},
  { sc: [{ id: 11, ectitle:'impression'}], ectitle: {test: vals => ('impression')}, m: true, key: 'cuim', url: '/collect', check: { test: vals => (['event'].includes(vals['t']) && vals['il1pi1id']) }, prop: 'cu', value: { test: val => (val !== '') } },
  { sc: [{ id: 11, ectitle:'impression', value: { test: val => (val == '') }, ex:'Empty/undefined'}], ectitle: {test: vals => ('impression')}, m: false, key: 'uidim', url: '/collect', check: { test: vals => (['event'].includes(vals['t']) && vals['il1pi1id']) }, prop: 'uid', value: { test: val => (val !== '') }},
  { sc: [{ id: 11, ectitle:'impression' }], ectitle: {test: vals => ('impression')}, m: true, key: 'paim', url: '/collect', check: { test: vals => (['event'].includes(vals['t']) && vals['il1pi1id']) }, prop: 'pa', value: { test: val => (val == '') }, ex:'Empty/undefined'},
  { sc: [{ id: 11, ectitle:'impression' }], ectitle: {test: vals => ('impression')}, m: true, key: 'palim', url: '/collect', check: { test: vals => (['event'].includes(vals['t']) && vals['il1pi1id']) }, prop: 'pal', value: { test: val => (val == '') },ex:'Empty/undefined'},
  { sc: [{ id: 11, ectitle:'impression' }], ectitle: {test: vals => ('impression')}, m: true, key: 'pr1idim', url: '/collect', check: { test: vals => (['event'].includes(vals['t']) && vals['il1pi1id']) }, prop: 'pr1id', value: { test: val => (val == '') },ex:'Empty/undefined'},
  { sc: [{ id: 11, ectitle:'impression' }], ectitle: {test: vals => ('impression')}, m: true, key: 'IL1NMim', url: '/collect', check: { test: vals => (['event'].includes(vals['t']) && vals['il1pi1id']) }, prop: 'il1nm', value: { test: val => (val.match(/^coveo:search:[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) }, ex:'/^coveo:search:[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/'}  ,
  { sc: [{ id: 11, ectitle:'impression' }], ectitle: {test: vals => ('impression')}, m: true, key: 'IL1PI1IDim', url: '/collect', check: { test: vals => (['event'].includes(vals['t']) && vals['il1pi1id']) }, prop: 'il1pi1id', value: { test: val => (val !== '') }},
  { sc: [{ id: 11, ectitle:'impression' }], ectitle: {test: vals => ('impression')}, m: true, key: 'IL1PI1BRim', url: '/collect', check: { test: vals => (['event'].includes(vals['t']) && vals['il1pi1id']) }, prop: 'il1pi1br', value: { test: val => (val !== '') }},
  { sc: [{ id: 11, ectitle:'impression' }], ectitle: {test: vals => ('impression')}, m: true, key: 'IL1PI1NMim', url: '/collect', check: { test: vals => (['event'].includes(vals['t']) && vals['il1pi1id']) }, prop: 'il1pi1nm', value: { test: val => (val !== '') }},
  { sc: [{ id: 11, ectitle:'impression' }], ectitle: {test: vals => ('impression')}, m: true, key: 'IL1PI1CAim', url: '/collect', check: { test: vals => (['event'].includes(vals['t']) && vals['il1pi1id']) }, prop: 'il1pi1ca', value: { test: val => (val !== '') }},
  { sc: [{ id: 11, ectitle:'impression' }], ectitle: {test: vals => ('impression')},m: true, key: 'IL1PI1PRim', url: '/collect', check: { test: vals => (['event'].includes(vals['t']) && vals['il1pi1id']) }, prop: 'il1pi1pr', value: { test: val => (val.match(/^\d+(\.\d+)?$/) ? true : false) }, ex:'/^\d+(\.\d+)?$/'},
  { sc: [{ id: 11, ectitle:'impression' }], ectitle: {test: vals => ('impression')}, m: true, key: 'IL1PI1PSim', url: '/collect', check: { test: vals => (['event'].includes(vals['t']) && vals['il1pi1id']) }, prop: 'il1pi1ps', value: { test: val => (val == 1 ? true : false) }, ex:'Integer == 1'},
  { sc: [{ id: 11, ectitle:'impression' }], ectitle: {test: vals => ('impression')}, m: true, key: 'IL1PI1QTim', url: '/collect', check: { test: vals => (['event'].includes(vals['t']) && vals['il1pi1id']) }, prop: 'il1pi1qt', value: { test: val => (val == '' ? true : false) }, ex:'Empty/undefined'},
  //pa=add
  { sc: [{ id: 13, ectitle:'add'},{ id: 15, ectitle:'add'}], ectitle: {test: vals => (vals['pa'])}, first:true, m: true, key: 'ta', url: '/collect', check: { test: vals => (['add'].includes(vals['pa'])) }, prop: 't', value: { test: val => (val == 'event') }, ex:'event' },
  { sc: [{ id: 13, ectitle:'add'},{ id: 15, ectitle:'add'}], ectitle: {test: vals => (vals['pa'])}, m: true, p: true, key: 'cida', url: '/collect', check: { test: vals => (['add'].includes(vals['pa'])) }, prop: 'cid', value: { test: val => (val.match(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) }, ex:'/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/' },
  { sc: [{ id: 13, ectitle:'add'},{ id: 15, ectitle:'add'}], ectitle: {test: vals => (vals['pa'])}, m: true, key: 'dla', url: '/collect', check: { test: vals => (['add'].includes(vals['pa'])) }, prop: 'dl', value: { test: val => (val.match(/^https?:\/\/.+/i) ? true : false) }, ex:'/^https?:\/\/.+/' },
  { sc: [{ id: 13, ectitle:'add'},{ id: 15, ectitle:'add'}], ectitle: {test: vals => (vals['pa'])}, m: true, p: true, pp: true, key: 'pida', url: '/collect', check: { test: vals =>(['add'].includes(vals['pa'])) }, prop: 'pid', value: { test: val => (val.match(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) },ex:'/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/'},
  { sc: [{ id: 13, ectitle:'add'},{ id: 15, ectitle:'add'}], ectitle: {test: vals => (vals['pa'])}, m: true, key: 'cua', url: '/collect', check: { test: vals => (['add'].includes(vals['pa']))}, prop: 'cu', value: { test: val => (val !== '') } },
  { sc: [{ id: 13, ectitle:'add', value: { test: val => (val == '') }, ex:'Empty/undefined'},{ id: 15, ectitle:'add'}], ectitle:  {test: vals => (vals['pa'])}, m: false, key: 'uida', url: '/collect', check: { test: vals => (['add'].includes(vals['pa'])) }, prop: 'uid', value: { test: val => (val !== '') }},
  { sc: [{ id: 13, ectitle:'add' },{ id: 15, ectitle:'add'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'paa', url: '/collect', check: { test: vals => (['add'].includes(vals['pa'])) }, prop: 'pa', value: { test: val => (val == 'add') }, ex:'add'},
  { sc: [{ id: 13, ectitle:'add' },{ id: 15, ectitle:'add'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pala', url: '/collect', check: { test: vals => (['add'].includes(vals['pa'])) }, prop: 'pal', value: { test: val => (val.match(/^coveo:search:[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) }, ex:'/^coveo:search:[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/'},
  { sc: [{ id: 13, ectitle:'add' },{ id: 15, ectitle:'add'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1ida', url: '/collect', check: { test: vals => (['add'].includes(vals['pa'])) }, prop: 'pr1id', value: { test: val => (val !== '') }},
  { sc: [{ id: 13, ectitle:'add' },{ id: 15, ectitle:'add'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1bra', url: '/collect', check: { test: vals => (['add'].includes(vals['pa'])) }, prop: 'pr1br', value: { test: val => (val !== '') }},
  { sc: [{ id: 13, ectitle:'add' },{ id: 15, ectitle:'add'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1nma', url: '/collect', check: { test: vals => (['add'].includes(vals['pa'])) }, prop: 'pr1nm', value: { test: val => (val !== '') }},
  { sc: [{ id: 13, ectitle:'add' },{ id: 15, ectitle:'add'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1caa', url: '/collect', check: { test: vals => (['add'].includes(vals['pa'])) }, prop: 'pr1ca', value: { test: val => (val !== '') }},
  { sc: [{ id: 13, ectitle:'add', value: { test: val => (val==1)}, ex:'Integer == 1' },{ id: 15, ectitle:'add', value: { test: val => (val==2)}, ex:'Integer == 2'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1psa', url: '/collect', check: { test: vals => (['add'].includes(vals['pa'])) }, prop: 'pr1ps', value: { test: val => (val >0) }, ex:'Integer > 0'},
  { sc: [{ id: 13, ectitle:'add'},{ id: 15, ectitle:'add'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1pra', url: '/collect', check: { test: vals => (['add'].includes(vals['pa'])) }, prop: 'pr1pr', value: { test: val => (val.match(/^\d+(\.\d+)?$/) ? true : false) }, ex:'/^\d+(\.\d+)?$/'},
  { sc: [{ id: 13, ectitle:'add', value: { test: val => (val==1)}, ex:'Integer == 1'},{ id: 15, ectitle:'add'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1qta', url: '/collect', check: { test: vals => (['add'].includes(vals['pa'])) }, prop: 'pr1qt', value: { test: val => (val>0) }, ex:'Integer > 0'},
  { sc: [{ id: 13, ectitle:'add' },{ id: 15, ectitle:'add'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr2ida', url: '/collect', check: { test: vals => (['add'].includes(vals['pa'])) }, prop: 'pr2id', value: { test: val => (val == '') }, ex:'Empty/undefined'},

  //pa=remove
  { sc: [{ id: 23, ectitle:'remove'}], ectitle: {test: vals => (vals['pa'])}, first:true, m: true, key: 'tr', url: '/collect', check: { test: vals => (['remove'].includes(vals['pa'])) }, prop: 't', value: { test: val => (val == 'event') }, ex:'event' },
  { sc: [{ id: 23, ectitle:'remove'}], ectitle: {test: vals => (vals['pa'])}, m: true, p: true, key: 'cidr', url: '/collect', check: { test: vals => (['remove'].includes(vals['pa'])) }, prop: 'cid', value: { test: val => (val.match(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) },ex:'/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/' },
  { sc: [{ id: 23, ectitle:'remove'}], ectitle: {test: vals => (vals['pa'])}, m: true, key: 'dlr', url: '/collect', check: { test: vals => (['remove'].includes(vals['pa'])) }, prop: 'dl', value: { test: val => (val.match(/^https?:\/\/.+/i) ? true : false) }, ex:'/^https?:\/\/.+/' },
  { sc: [{ id: 23, ectitle:'remove'}], ectitle: {test: vals => (vals['pa'])}, m: true, p: true, pp: true, key: 'pidr', url: '/collect', check: { test: vals =>(['remove'].includes(vals['pa'])) }, prop: 'pid', value: { test: val => (val.match(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) }, ex:'/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/'},
  { sc: [{ id: 23, ectitle:'remove'}], ectitle: {test: vals => (vals['pa'])}, m: true, key: 'cur', url: '/collect', check: { test: vals => (['remove'].includes(vals['pa']))}, prop: 'cu', value: { test: val => (val !== '') } },
  { sc: [{ id: 23, ectitle:'remove', value: { test: val => (val == '') }, ex:'Empty/undefined'}], ectitle:  {test: vals => (vals['pa'])}, m: false, key: 'uidr', url: '/collect', check: { test: vals => (['remove'].includes(vals['pa'])) }, prop: 'uid', value: { test: val => (val !== '') }},
  { sc: [{ id: 23, ectitle:'remove' }], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'par', url: '/collect', check: { test: vals => (['remove'].includes(vals['pa'])) }, prop: 'pa', value: { test: val => (val == 'remove') },ex:'remove'},
  { sc: [{ id: 23, ectitle:'remove' }], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'palr', url: '/collect', check: { test: vals => (['remove'].includes(vals['pa'])) }, prop: 'pal', value: { test: val => (val == 'checkout') }, ex:'checkout'},
  { sc: [{ id: 23, ectitle:'remove' }], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1idr', url: '/collect', check: { test: vals => (['remove'].includes(vals['pa'])) }, prop: 'pr1id', value: { test: val => (val !== '') }},
  { sc: [{ id: 23, ectitle:'remove' }], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1brr', url: '/collect', check: { test: vals => (['remove'].includes(vals['pa'])) }, prop: 'pr1br', value: { test: val => (val !== '') }},
  { sc: [{ id: 23, ectitle:'remove' }], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1nmr', url: '/collect', check: { test: vals => (['remove'].includes(vals['pa'])) }, prop: 'pr1nm', value: { test: val => (val !== '') }},
  { sc: [{ id: 23, ectitle:'remove' }], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1car', url: '/collect', check: { test: vals => (['remove'].includes(vals['pa'])) }, prop: 'pr1ca', value: { test: val => (val !== '') }},
  { sc: [{ id: 23, ectitle:'remove'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1prr', url: '/collect', check: { test: vals => (['remove'].includes(vals['pa'])) }, prop: 'pr1pr', value: { test: val => (val.match(/^\d+(\.\d+)?$/) ? true : false) }, ex:'/^\d+(\.\d+)?$/'},
  { sc: [{ id: 23, ectitle:'remove', value: { test: val => (val==1)}, ex:'Integer == 1'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1qtr', url: '/collect', check: { test: vals => (['remove'].includes(vals['pa'])) }, prop: 'pr1qt', value: { test: val => (val>0) }, ex:'Integer > 0'},
  { sc: [{ id: 23, ectitle:'remove' }], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr2idr', url: '/collect', check: { test: vals => (['remove'].includes(vals['pa'])) }, prop: 'pr2id', value: { test: val => (val == '') }, ex:'Empty/undefined'},

  //pa=click or quickview
  { sc: [{ id: 12, ectitle:'click'},{ id: 14, ectitle:'click'},{ id: 16, ectitle:'click'}], ectitle: {test: vals => ('click')}, first:true, m: true, key: 'tc', url: '/collect', check: { test: vals => (['click','quickview'].includes(vals['pa'])) }, prop: 't', value: { test: val => (val == 'event') } , ex:'event'},
  { sc: [{ id: 12, ectitle:'click'},{ id: 14, ectitle:'click'},{ id: 16, ectitle:'click'}], ectitle: {test: vals => ('click')}, m: true, p: true, key: 'cidc', url: '/collect', check: { test: vals => (['click','quickview'].includes(vals['pa'])) }, prop: 'cid', value: { test: val => (val.match(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) }, ex:'/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/' },
  { sc: [{ id: 12, ectitle:'click'},{ id: 14, ectitle:'click'},{ id: 16, ectitle:'click'}], ectitle: {test: vals => ('click')}, m: true, key: 'dlc', url: '/collect', check: { test: vals => (['click','quickview'].includes(vals['pa'])) }, prop: 'dl', value: { test: val => (val.match(/^https?:\/\/.+/i) ? true : false) }, ex:'/^https?:\/\/.+/' },
  { sc: [{ id: 12, ectitle:'click'},{ id: 14, ectitle:'click'},{ id: 16, ectitle:'click'}], ectitle: {test: vals => ('click')}, m: true, p: true, pp: true, key: 'pidc', url: '/collect', check: { test: vals =>(['click','quickview'].includes(vals['pa'])) }, prop: 'pid', value: { test: val => (val.match(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) }, ex:'/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/'},
  { sc: [{ id: 12, ectitle:'click'},{ id: 14, ectitle:'click'},{ id: 16, ectitle:'click'}], ectitle: {test: vals => ('click')}, m: true, key: 'cuc', url: '/collect', check: { test: vals => (['click','quickview'].includes(vals['pa']))}, prop: 'cu', value: { test: val => (val !== '') } },
  { sc: [{ id: 12, ectitle:'click', value: { test: val => (val == '') }, ex:'Empty/undefined'},{ id: 14, ectitle:'click'},{ id: 16, ectitle:'click'}], ectitle:  {test: vals => ('click')}, m: false, key: 'uidc', url: '/collect', check: { test: vals => (['click','quickview'].includes(vals['pa'])) }, prop: 'uid', value: { test: val => (val !== '') }},
  { sc: [{ id: 12, ectitle:'click' },{ id: 14, ectitle:'click'},{ id: 16, ectitle:'click', value: { test: val => (val=='click')} }], ectitle:  {test: vals => ('click')}, m: true, key: 'pac', url: '/collect', check: { test: vals => (['click','quickview'].includes(vals['pa'])) }, prop: 'pa', value: { test: val => (val == 'click' || val=='quickview') }, ex:'click or quickview'},
  { sc: [{ id: 12, ectitle:'click' },{ id: 14, ectitle:'click'},{ id: 16, ectitle:'click'}], ectitle:  {test: vals => ('click')}, m: true, key: 'palc', url: '/collect', check: { test: vals => (['click','quickview'].includes(vals['pa'])) }, prop: 'pal', value: { test: val => (val.match(/^coveo:search:[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) }, ex:'/^coveo:search:[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/'},
  { sc: [{ id: 12, ectitle:'click' },{ id: 14, ectitle:'click'},{ id: 16, ectitle:'click'}], ectitle:  {test: vals => ('click')}, m: true, key: 'pr1idc', url: '/collect', check: { test: vals => (['click','quickview'].includes(vals['pa'])) }, prop: 'pr1id', value: { test: val => (val !== '') }},
  { sc: [{ id: 12, ectitle:'click' },{ id: 14, ectitle:'click'},{ id: 16, ectitle:'click'}], ectitle:  {test: vals => ('click')}, m: true, key: 'pr1brc', url: '/collect', check: { test: vals => (['click','quickview'].includes(vals['pa'])) }, prop: 'pr1br', value: { test: val => (val !== '') }},
  { sc: [{ id: 12, ectitle:'click' },{ id: 14, ectitle:'click'},{ id: 16, ectitle:'click'}], ectitle:  {test: vals => ('click')}, m: true, key: 'pr1nmc', url: '/collect', check: { test: vals => (['click','quickview'].includes(vals['pa'])) }, prop: 'pr1nm', value: { test: val => (val !== '') }},
  { sc: [{ id: 12, ectitle:'click' },{ id: 14, ectitle:'click'},{ id: 16, ectitle:'click'}], ectitle:  {test: vals => ('click')}, m: true, key: 'pr1cac', url: '/collect', check: { test: vals => (['click','quickview'].includes(vals['pa'])) }, prop: 'pr1ca', value: { test: val => (val !== '') }},
  { sc: [{ id: 12, ectitle:'click', value: { test: val => (val==1)}, ex:'Integer == 1' },{ id: 14, ectitle:'click', value: { test: val => (val==2)}, ex:'Integer == 2'},{ id: 16, ectitle:'click', value: { test: val => (val==2)} }], ectitle:  {test: vals => ('click')}, m: true, key: 'pr1psc', url: '/collect', check: { test: vals => (['click','quickview'].includes(vals['pa'])) }, prop: 'pr1ps', value: { test: val => (val >0) }, ex:'Integer > 0'},
  { sc: [{ id: 12, ectitle:'click' },{ id: 14, ectitle:'click'},{ id: 16, ectitle:'click'}], ectitle:  {test: vals => ('click')}, m: true, key: 'pr1prc', url: '/collect', check: { test: vals => (['click','quickview'].includes(vals['pa'])) }, prop: 'pr1pr', value: { test: val => (val.match(/^\d+(\.\d+)?$/) ? true : false) }, ex:'/^\d+(\.\d+)?$/'},
  { sc: [{ id: 12, ectitle:'click'},{ id: 14, ectitle:'click'},{ id: 16, ectitle:'click'}], ectitle:  {test: vals => ('click')}, m: true, key: 'pr1qtc', url: '/collect', check: { test: vals => (['click','quickview'].includes(vals['pa'])) }, prop: 'pr1qt', value: { test: val => (val=='') }, ex:'Empty/undefined'},
  { sc: [{ id: 12, ectitle:'click' },{ id: 14, ectitle:'click'},{ id: 16, ectitle:'click'}], ectitle:  {test: vals => ('click')}, m: true, key: 'pr2idc', url: '/collect', check: { test: vals => (['click','quickview'].includes(vals['pa'])) }, prop: 'pr2id', value: { test: val => (val == '') }, ex:'Empty/undefined'},

  //pa=detail
  { sc: [{ id: 16, ectitle:'detail'}], ectitle: {test: vals => (vals['pa'])}, first:true, m: true, key: 'td', url: '/collect', check: { test: vals => (['detail'].includes(vals['pa'])) }, prop: 't', value: { test: val => (val == 'event' || val == 'pageview') }, ex:'event OR pageview' },
  { sc: [{ id: 16, ectitle:'detail'}], ectitle: {test: vals => (vals['pa'])}, m: true, p: true, key: 'cidd', url: '/collect', check: { test: vals => (['detail'].includes(vals['pa'])) }, prop: 'cid', value: { test: val => (val.match(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) }, ex:'/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/' },
  { sc: [{ id: 16, ectitle:'detail'}], ectitle: {test: vals => (vals['pa'])}, m: true, key: 'dld', url: '/collect', check: { test: vals => (['detail'].includes(vals['pa'])) }, prop: 'dl', value: { test: val => (val.match(/^https?:\/\/.+/i) ? true : false) }, ex:'/^https?:\/\/.+/' },
  { sc: [{ id: 16, ectitle:'detail'}], ectitle: {test: vals => (vals['pa'])}, m: true, p: true, pp: true, key: 'pidd', url: '/collect', check: { test: vals =>(['detail'].includes(vals['pa'])) }, prop: 'pid', value: { test: val => (val.match(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) }, ex:'/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/'},
  { sc: [{ id: 16, ectitle:'detail'}], ectitle: {test: vals => (vals['pa'])}, m: true, key: 'cud', url: '/collect', check: { test: vals => (['detail'].includes(vals['pa']))}, prop: 'cu', value: { test: val => (val !== '') } },
  { sc: [{ id: 16, ectitle:'detail'}], ectitle:  {test: vals => (vals['pa'])}, m: false, key: 'uidd', url: '/collect', check: { test: vals => (['detail'].includes(vals['pa'])) }, prop: 'uid', value: { test: val => (val !== '') }},
  { sc: [{ id: 16, ectitle:'detail'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pad', url: '/collect', check: { test: vals => (['detail'].includes(vals['pa'])) }, prop: 'pa', value: { test: val => (val == 'detail') }, ex:'detail'},
  { sc: [{ id: 16, ectitle:'detail'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pald', url: '/collect', check: { test: vals => (['detail'].includes(vals['pa'])) }, prop: 'pal', value: { test: val => (val.match(/^coveo:search:[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) }, ex:'/^coveo:search:[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/'},
  { sc: [{ id: 16, ectitle:'detail'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1idd', url: '/collect', check: { test: vals => (['detail'].includes(vals['pa'])) }, prop: 'pr1id', value: { test: val => (val !== '') }},
  { sc: [{ id: 16, ectitle:'detail'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1brd', url: '/collect', check: { test: vals => (['detail'].includes(vals['pa'])) }, prop: 'pr1br', value: { test: val => (val !== '') }},
  { sc: [{ id: 16, ectitle:'detail'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1nmd', url: '/collect', check: { test: vals => (['detail'].includes(vals['pa'])) }, prop: 'pr1nm', value: { test: val => (val !== '') }},
  { sc: [{ id: 16, ectitle:'detail'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1cad', url: '/collect', check: { test: vals => (['detail'].includes(vals['pa'])) }, prop: 'pr1ca', value: { test: val => (val !== '') }},
  { sc: [{ id: 16, ectitle:'detail'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1prd', url: '/collect', check: { test: vals => (['detail'].includes(vals['pa'])) }, prop: 'pr1pr', value: { test: val => (val.match(/^\d+(\.\d+)?$/) ? true : false) }, ex:'/^\d+(\.\d+)?$/'},
  { sc: [{ id: 16, ectitle:'detail'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr2idd', url: '/collect', check: { test: vals => (['detail'].includes(vals['pa'])) }, prop: 'pr2id', value: { test: val => (val == '') }, ex:'Empty/undefined'},

  //pa=purchase
  //pa=checkout
  { sc: [{ id: 23, ectitle:'purchase'}], ectitle: {test: vals => (vals['pa'])}, first:true, m: true, key: 'tp', url: '/collect', check: { test: vals => (['purchase'].includes(vals['pa'])) }, prop: 't', value: { test: val => (val == 'event') }, ex:'event' },
  { sc: [{ id: 23, ectitle:'purchase'}], ectitle: {test: vals => (vals['pa'])}, m: true, p: true, key: 'cidp', url: '/collect', check: { test: vals => (['purchase'].includes(vals['pa'])) }, prop: 'cid', value: { test: val => (val.match(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) }, ex:'/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/' },
  { sc: [{ id: 23, ectitle:'purchase'}], ectitle: {test: vals => (vals['pa'])}, m: true, key: 'dlp', url: '/collect', check: { test: vals => (['purchase'].includes(vals['pa'])) }, prop: 'dl', value: { test: val => (val.match(/^https?:\/\/.+/i) ? true : false) }, ex:'/^https?:\/\/.+/' },
  { sc: [{ id: 23, ectitle:'purchase'}], ectitle: {test: vals => (vals['pa'])}, m: true, p: true, pp: true, key: 'pidp', url: '/collect', check: { test: vals =>(['purchase'].includes(vals['pa'])) }, prop: 'pid', value: { test: val => (val.match(/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/i) ? true : false) },ex:'/^[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}/'},
  { sc: [{ id: 23, ectitle:'purchase'}], ectitle: {test: vals => (vals['pa'])}, m: true, key: 'cup', url: '/collect', check: { test: vals => (['purchase'].includes(vals['pa']))}, prop: 'cu', value: { test: val => (val !== '') } },
  { sc: [{ id: 23, ectitle:'purchase', value: { test: val => (val == '') }, ex:'Empty/undefined'}], ectitle:  {test: vals => (vals['pa'])}, m: false, key: 'uidp', url: '/collect', check: { test: vals => (['purchase'].includes(vals['pa'])) }, prop: 'uid', value: { test: val => (val !== '') }},
  { sc: [{ id: 23, ectitle:'purchase' }], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pap', url: '/collect', check: { test: vals => (['purchase'].includes(vals['pa'])) }, prop: 'pa', value: { test: val => (val == 'purchase') }, ex:'purchase'},
  { sc: [{ id: 23, ectitle:'purchase' }], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'palp', url: '/collect', check: { test: vals => (['purchase'].includes(vals['pa'])) }, prop: 'pal', value: { test: val => (val=='') },ex:'Empty/undefined'},
  { sc: [{ id: 23, ectitle:'purchase' }], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1idp', url: '/collect', check: { test: vals => (['purchase'].includes(vals['pa'])) }, prop: 'pr1id', value: { test: val => (val !== '') }},
  { sc: [{ id: 23, ectitle:'purchase' }], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1brp', url: '/collect', check: { test: vals => (['purchase'].includes(vals['pa'])) }, prop: 'pr1br', value: { test: val => (val !== '') }},
  { sc: [{ id: 23, ectitle:'purchase' }], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1nmp', url: '/collect', check: { test: vals => (['purchase'].includes(vals['pa'])) }, prop: 'pr1nm', value: { test: val => (val !== '') }},
  { sc: [{ id: 23, ectitle:'purchase' }], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1cap', url: '/collect', check: { test: vals => (['purchase'].includes(vals['pa'])) }, prop: 'pr1ca', value: { test: val => (val !== '') }},
  { sc: [{ id: 23, ectitle:'purchase'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1prp', url: '/collect', check: { test: vals => (['purchase'].includes(vals['pa'])) }, prop: 'pr1pr', value: { test: val => (val.match(/^\d+(\.\d+)?$/) ? true : false) }, ex:'/^\d+(\.\d+)?$/'},
  { sc: [{ id: 23, ectitle:'purchase', value: { test: val => (val==1)}, ex:'Integer == 1'}], ectitle:  {test: vals => (vals['pa'])}, m: true, key: 'pr1qtp', url: '/collect', check: { test: vals => (['purchase'].includes(vals['pa'])) }, prop: 'pr1qt', value: { test: val => (val>0) }, ex:'Integer > 0'}


];


//For Analytics
let analyticChecks = [

  { title: 'Click/Open', t: true, m: true, p: true, key: 'usingVisitorA', url: '/click', prop: 'visitor', value: { test: val => (val !== '') } },
  { title: 'Click/Open', t: true, m: true, key: 'actionCause', url: '/click', prop: 'actionCause', value: { test: val => (val == 'documentquickview' || val == 'documentopen' || val == 'recommendationopen') } },
  { title: 'Click/Open', t: true, m: true, key: 'documentUri', url: '/click', prop: 'documentUri', value: { test: val => (val !== '') } },
  { title: 'Click/Open', t: true, m: true, key: 'documentPosition', url: '/click', prop: 'documentPosition', value: { test: val => (val >= 1) }, ex:'Integer >=1' },
  { title: 'Click/Open', t: true, m: true, key: 'documentUri', url: '/click', prop: 'documentUri', value: { test: val => (val !== '') } },
  { title: 'Click/Open', t: true, m: true, key: 'documentUrl', url: '/click', prop: 'documentUrl', value: { test: val => (val !== '') } },
  { title: 'Click/Open', t: true, m: true, key: 'documentTitle', url: '/click', prop: 'documentTitle', value: { test: val => (val !== '') } },
  { title: 'Click/Open', t: true, m: true, key: 'documentUriHash', url: '/click', prop: 'documentUriHash', value: { test: val => (val !== '') } },
  { title: 'Click/Open', t: true, m: true, key: 'language', url: '/click', prop: 'language', value: { test: val => (val !== '') } },
  { title: 'Click/Open', t: true, m: true, key: 'searchQueryUid', url: '/click', prop: 'searchQueryUid', value: { test: val => (val !== '') } },
  { title: 'Click/Open', t: true, m: true, key: 'sourceName', url: '/click', prop: 'sourceName', value: { test: val => (val !== '') } },
  { title: 'Click/Open', t: true, m: true, key: 'contentIdKey', url: '/click', prop: 'customData/contentIdKey', value: { test: val => (val == 'permanentid') } , ex:'permanentid'},
  { title: 'Click/Open', t: true, m: true, key: 'contentIdValue', url: '/click', prop: 'customData/contentIdValue', value: { test: val => (val !== '') } },
  { title: 'Click/Open', t: true, key: 'userAgent', m: true, url: '/click', prop: 'userAgent', value: { test: val => (val !== '') } },
  { title: 'Click/Open', t: true, key: 'outcome', url: '/click', prop: 'outcome', value: { test: val => (val !== '') } },
  { title: 'Click/Open', t: true, key: 'rankingModifier', url: '/click', prop: 'rankingModifier', value: { test: val => (val !== '') } },

  { title: 'PageView', t: true, key: 'pageViews_new', url: '/collect', prop: 't', value: 'pageview', ex:'pageview' },
  { sc: [{ id: 10}], title: 'PageView', t: true, m: true, key: 'location', url: '/view', prop: 'location', value: { test: val => (val !== '') } },
  { sc: [{ id: 10}], title: 'PageView', t: true, m: true, key: 'pageViews_contentIdKey', url: '/view', prop: 'contentIdKey', value: { test: val => (val !== '') } },
  { sc: [{ id: 10}], title: 'PageView', t: true, m: true, key: 'pageViews_contentIdValue', url: '/view', prop: 'contentIdValue', value: { test: val => (val !== '') } },
  { sc: [{ id: 10}], title: 'PageView', t: true, m: true, key: 'pageViews_language', url: '/view', prop: 'language', value: { test: val => (val !== '') } },
  { sc: [{ id: 10}], title: 'PageView', t: true, key: 'outcomeP', url: '/view', prop: 'outcome', value: { test: val => (val !== '') } },
  { sc: [{ id: 10}], title: 'PageView', t: true, p: true, key: 'usingVisitorAP', m: false, url: '/view', prop: 'visitor', value: { test: val => (val !== '') } },


  { sc: [{ id: 101}],title: 'Search', t: true, m: true, key: 'usingSearchHubA', url: '/search', prop: 'originLevel1', value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],title: 'Search', t: true, key: 'usingTabA', m: true, url: '/search', prop: 'originLevel2', value: { test: val => (val !== '') } },
  { title: 'Search', t: true, key: 'actionCauseS', m: true, url: '/search', prop: 'actionCause', value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],title: 'Search', t: true, key: 'usingLocaleA', m: true, url: '/search', prop: 'language', value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],title: 'Search', t: true, p: true, key: 'usingVisitorAS', m: true, url: '/search', prop: 'visitor', value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],title: 'Search', t: true, key: 'queryText', m: true, url: '/search', prop: 'queryText', check: { test: vals => ((vals['recommendation'] != '' && vals['recommendation'] != undefined) || (vals['actionCause'] != 'interfaceLoad' && vals['actionCause'] != 'recommendationInterfaceLoad' && vals['actionCause'] != 'recommendation')) }, value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],title: 'Search', t: true, key: 'userAgentA', m: true, url: '/search', prop: 'userAgent', value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],title: 'Search', t: true, key: 'searchQueryUidA', m: true, url: '/search', prop: 'searchQueryUid', value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],title: 'Search', t: true, key: 'advancedQuery', url: '/search', prop: 'advancedQuery', value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],title: 'Search', t: true, key: 'usingLevel3', url: '/search', prop: 'originLevel3', value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],title: 'Search', t: true, key: 'usingPipelineA', url: '/search', prop: 'queryPipeline', value: { test: val => (val !== '') } },
  { sc: [{ id: 101}],title: 'Search', t: true, key: 'outcomeS', url: '/search', prop: 'outcome', value: { test: val => (val !== '') } },
  //{ title: 'Search', t: true, key: 'NOT_visitorChanged', url: '/search', prop: 'NOT visitorChanged', def: true, value: true },
  { sc: [{ id: 101}],title: 'Search', t: true, key: 'responseTime', url: '/search', prop: 'responseTime', value: { test: val => (val !== '') } },
  { title: 'Search', t: false, key: 'interfaceLoad', url: '/search', prop: 'actionCause', value: { test: val => (val == 'interfaceload' || val == 'recommendationinterfaceload') } },
  { title: 'Search', t: false, key: 'interfaceChange', url: '/search', prop: 'actionCause', value: { test: val => (val == 'interfacechange') } },
  { title: 'Search', t: false, key: 'searchBoxSubmit', url: '/search', prop: 'actionCause', value: { test: val => (val == 'searchboxsubmit') } },
  { sc: [{ id: 101}],title: 'Search', t: false, key: 'searchFromLink', url: '/search', prop: 'actionCause', value: { test: val => (val == 'searchfromlink') } },
  { title: 'Search', t: false, key: 'searchBoxClear', url: '/search', prop: 'actionCause', value: { test: val => (val == 'searchboxclear') } },
  { title: 'Search', t: false, key: 'omniboxAnalytics', url: '/search', prop: 'actionCause', value: { test: val => (val == 'omniboxanalytics') } },
  { title: 'Search', t: false, key: 'omniboxFromLink', url: '/search', prop: 'actionCause', value: { test: val => (val == 'omniboxfromLink') } },
  { title: 'Search', t: false, key: 'searchAsYouType', url: '/search', prop: 'actionCause', value: { test: val => (val == 'searchasyoutype') } },
  { title: 'Search', t: false, key: 'omniboxField', url: '/search', prop: 'actionCause', value: { test: val => (val == 'omniboxfield') } },
  { title: 'Search', t: false, key: 'didyoumeanClick', url: '/search', prop: 'actionCause', value: { test: val => (val == 'didyoumeanclick') } },
  { title: 'Search', t: false, key: 'didyoumeanAutomatic', url: '/search', prop: 'actionCause', value: { test: val => (val == 'didyoumeanautomatic') } },
  { title: 'Search', t: false, key: 'resultsSort', url: '/search', prop: 'actionCause', value: { test: val => (val == 'resultssort') } },
  { title: 'Search', t: false, key: 'facetSelect', url: '/search', prop: 'actionCause', value: { test: val => (val == 'facetselect') } },
  { title: 'Search', t: false, key: 'facetDeselect', url: '/search', prop: 'actionCause', value: { test: val => (val == 'facetdeselect') } },
  { title: 'Search', t: false, key: 'facetExclude', url: '/search', prop: 'actionCause', value: { test: val => (val == 'facetexclude') } },
  { title: 'Search', t: false, key: 'facetUnexclude', url: '/search', prop: 'actionCause', value: { test: val => (val == 'facetunexclude') } },
  { title: 'Search', t: false, key: 'documentField', url: '/search', prop: 'actionCause', value: { test: val => (val == 'documentfield') } },
  { title: 'Search', t: false, key: 'breadcrumbFacet', url: '/search', prop: 'actionCause', value: { test: val => (val == 'breadcrumbfacet') } },
  { title: 'Search', t: false, key: 'breadcrumbResetAll', url: '/search', prop: 'actionCause', value: { test: val => (val == 'breadcrumbresetall') } },

  { title: 'Custom', t: true, m: true, key: 'eventType', url: '/custom', prop: 'eventType', value: { test: val => (val !== '') } },
  { title: 'Custom', t: true, m: true, key: 'eventValue', url: '/custom', prop: 'eventValue', value: { test: val => (val !== '') } },
  { title: 'Custom', t: true, m: true, key: 'language', url: '/custom', prop: 'language', value: { test: val => (val !== '') } },
  { title: 'Custom', t: false, key: 'facetSearch', url: '/custom', prop: 'eventValue', value: { test: val => (val == 'facetsearch') } },
  { title: 'Custom', t: false, key: 'facetUpdateSort', url: '/custom', prop: 'eventValue', value: { test: val => (val == 'facetupdatesort') } },
  { title: 'Custom', t: false, key: 'getMoreResults', url: '/custom', prop: 'eventType', value: { test: val => (val == 'getmoreresults') } },

];


let resetState = (tabId) => {
  if (tabId) {
    STATES[tabId] = {
      tabId,
      devtab: '',
      scenarioId: '',
      scenario: {},
      scen_enabled: false,
      devconnection: '',
      record: [],
      persistent: {},
      persistentOld: {},
      checks: {},
      recactive: false,
      recempty: true,
      uaversion: '',
      ecResults: {},
      document_url: '',
      enabled: false,
      tab: 'OverviewA',
      enabledSearch: false,
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

let initResults = (state) => {
  defaultECResults.map(key => {
    state.ecResults[key] = {};
    state.ecResults[key]['Count'] = 0;
    state.ecResults[key]['TOTALS'] = undefined;
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
  console.log("Saving STATE: " + tabId);
  if (tabId) {
    let state = Object.assign(getState(tabId), obj);
    STATES[tabId] = state;
  }
  else {
    getTabId_Then(tabId => {
      console.log("Saving STATE without tabid: " + tabId);
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
      console.log("EXCEPT: " + e);
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

function resetPPCheck(state, checks, eckey) {
  checks.map(key => {
    if (key.pp != undefined) {
      if (key.pp == true) {
        if (state.persistent[key + eckey] != undefined) {
          if (state.persistent[key + eckey] != "") state.persistentOld[key + eckey] = state.persistent[key + eckey];
          //state.persistent[key+eckey] = undefined;
        }
      }
    }
  });
}

function resetPP(state) {
  if (state.scenarioId != '') {
    resetPPCheck(state, state.scenario.searchChecks, '');
    resetPPCheck(state, state.scenario.qsChecks, '');
    resetPPCheck(state, state.scenario.analyticChecks, '');
    defaultECResults.map(key => {
      resetPPCheck(state, state.scenario.ecChecks, key);
      resetPPCheck(state, state.scenario.ecChecks, key + 'google');
    });

  } else {
    resetPPCheck(state, searchChecks, '');
    resetPPCheck(state, qsChecks, '');
    resetPPCheck(state, analyticChecks, '');
    defaultECResults.map(key => {
      resetPPCheck(state, ecChecks, key);
      resetPPCheck(state, ecChecks, key + 'google');
    });

  }
}

function resetPersistentValuesScenario(state, id) {
  scenarios.map(key => {
    if (key.id == id) {
      if (key.resetvalues != undefined) {
        if (key.resetvalues == true) {
          state.persistentOld = {};
          state.persistent = {};
        }
      }
    }
  });
}

function checkScenario(state, checks, id, ectitle, addTo) {
  let checkstodo = [];
  checks.map(key => {
    if (key.sc != undefined) {
      key.sc.map(ids => {
        if (ids.id == id.toString()) {
          if (ids.ectitle != undefined && ectitle != undefined) {
            let ectitles = ids.ectitle.split(',');
            ectitles.map((title) => {
              if (title == ectitle) {
                //deep copy
                let newkey = {...key};
                //Do we need to override the value test (if defined in ids)
                if (ids.value !== undefined) {
                  newkey.value = ids.value;
                }
                //Do we need to override the ex (expected)
                if (ids.ex !== undefined) {
                  newkey.ex = ids.ex;
                }
                checkstodo.push(newkey);
                if (state.ecResults[ectitle] == undefined) {
                  state.ecResults[ectitle] = {};
                  state.ecResults[ectitle]['Count'] = 0;
                  state.ecResults[ectitle]['TOTALS'] = false;
                }
                //We also need to add the property so that we have an indicator of what is needed
                state.ecResults[ectitle][newkey.prop] = false;
                if (addTo != undefined) {
                  addTo.push(newkey);
                }
              }
            });
          } else {
            checkstodo.push(key);
            if (addTo != undefined) {
              addTo.push(key);
            }
          }
        }
      });
    }
  });
  return checkstodo;
}

function initForScenario(state) {
  state.queryRequests= [];
  state.querySuggestRequests= [];
  state.recommendationRequests= [];
  state.analyticRequests= [];
  state.ecommerceRequests= [];
  state.dev= [];
  state.searchReport= '';
  state.searchInd= true;
  state.qsReport= '';
  state.qsInd= true;
  state.analyticReport= '';
  state.analyticInd= true;
  state.ecReport= '';
  state.ecInd= true;
}

function buildScenario(state, all) {
  let scenario = {};
  initForScenario(state);
  scenario.all = scenarios;
  if (all == undefined) {
    //Gather the tests which are activated for this scenario
    scenario.searchChecks = checkScenario(state, searchChecks, state.scenarioId);
    //We want to build the checks already with empty results, so that we can check later if they are properly filled
    doChecks({}, '', scenario.searchChecks, state, 'searchReport', 'searchInd', false, true, true);
    scenario.qsChecks = checkScenario(state, qsChecks, state.scenarioId);
    doChecks({}, '', scenario.qsChecks, state, 'qsReport', 'qsInd', false, true,true);
    scenario.analyticChecks = checkScenario(state, analyticChecks, state.scenarioId);
    doChecks({}, '', scenario.analyticChecks, state, 'analyticReport', 'analyticInd', false, true,true);
    scenario.ecChecks = [];
    state.ecResults = [];
    defaultECResults.map(key => {
      let currentchecks = checkScenario(state, ecChecks, state.scenarioId, key, scenario.ecChecks);
      let post = {};
      post['pa'] = key;
      post['t'] = key;
      doChecks(post, '', currentchecks, state, 'ecReport', 'ecInd', false, true,true);
    });
  }

  return scenario;
}

function executeChecks(time, reqId, type, url, posted, state, checks, sc_checks, google, report, reportInd, senttodev) {
  let save = false;
  if (state.scenarioId == '') {
    save = true;
  }
  //First execute normal checks
  let content = doChecks(posted, url, checks, state, report, reportInd, google, save);
  //Check if we got back an array (in the case of EC)
  if (Array.isArray(content)) {
    content.map((key)=> {
      let rec = { sc: false, type: type, time: time, req: reqId, data: key, request: { type: type, url: url, data: posted } };
      //Check if we have currentResponse, that means the onCompleted was already executed
      if (currentResponse != '') {
        rec.statusCode = currentResponse;
      }
      if (state.devconnection != '' && senttodev) state.devconnection.postMessage(rec);
      if (content.content != '')
        state.dev.unshift(rec);
  
    });
     
  } else {
    let rec = { sc: false, type: type, time: time, req: reqId, data: content, request: { type: type, url: url, data: posted } };
    //Check if we have currentResponse, that means the onCompleted was already executed
    if (currentResponse != '') {
      rec.statusCode = currentResponse;
    }
    if (state.devconnection != '' && senttodev) state.devconnection.postMessage(rec);
    if (content.content != '')
      state.dev.unshift(rec);
  }
  //Execute scenario checks, NOT for Google
  if (state.scenarioId != '' && !google) {
    let contents = doChecks(posted, url, sc_checks, state, report, reportInd, google, true);
    if (Array.isArray(contents)) {
      contents.map((key)=> {
        let rec = { sc: true, type: type, time: time, req: reqId, data: key, request: { type: type + ' - For Scenario', url: url, data: posted } };
        //Check if we have currentResponse, that means the onCompleted was already executed
        if (currentResponse != '') {
          rec.statusCode = currentResponse;
        }
        if (state.devconnection != '' && senttodev) state.devconnection.postMessage(rec);
        if (content.content != '')
          state.dev.unshift(rec);
    
      });
       
    } else {
    let recs = { sc: true, type: type, time: time, req: reqId, data: contents, request: { type: type + ' - For Scenario', url: url, data: posted } };
    //Check if we have currentResponse, that means the onCompleted was already executed
    if (currentResponse != '') {
      recs.statusCode = currentResponse;
    }
    if (state.devconnection != '' && senttodev) state.devconnection.postMessage(recs);
    if (contents.content != '')
      state.dev.unshift(recs);
  }
  }
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
  if (msg.type === 'getScenarios') {
    getTabId_Then(tabId => {
      getState_Then(state => {
        state.scenario = buildScenario(state, false);
        saveState(state, tabId);
        sendResponse(state.scenario);
      });
    });
    return true;
  }
  if (msg.type === 'enableSc') {
    getTabId_Then(tabId => {
      getState_Then(state => {
        state.scen_enabled = msg.enabled;
        if (state.scen_enabled == false) {
          state.scenarioId = '';
        }
        saveState(state, tabId);
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
  if (msg.action === 'resetEvents') {
    //Received from Nightwatch script
    console.log('Received resetEvents');
    getState_Then(state => {
      state.dev = [];
      saveState(state, state.tabId);
    });

    return true;
  }
  if (msg.action === 'getEvents') {
    //Received from Nightwatch script
    console.log('Received getEvents');
    getTabId_Then(tabId => {
      getState_Then(state => {
        //Clean up the state.dev
        let info = [];
        state.dev.map((ev) => {
          let type = ev.request.type;
          let subtitle = ev.data.title ? ev.data.title : '';
          let status = ev.statusCode ? ev.statusCode : "(no statusCode received)";
          let statusok = false;
          if (ev.statusCode) {
            statusok = ev.statusCode == 200 ? true : false;
          }
          let oneisbad = ev.data.oneisbad;
          let url = ev.request.url;
          let postdata = ev.request.data;
          let detail = {};
          detail['type']=type;
          detail['subtype']=subtitle;
          detail['statusCode']=status;
          detail['status']=statusok;
          detail['oneisbad']=oneisbad;
          detail['finalcheck']=statusok && !oneisbad;
          detail['url']=url;
          detail['postdata']=postdata;
          //Push only unique events (type, subtype)
          let exists=false;
          info.map((inf)=> {
             if (inf['type']==type && inf['subtype']==subtitle) {
               exists=true;
             }
          });
          if (!exists || msg.unique==false) info.unshift(detail);
        
        });
        chrome.tabs.sendMessage(tabId, {
          action: "sent_events",
          events: info
        });
        //sendResponse({ active: state.recactive, empty: state.recempty });
      });
    });
    return true;
  }
  if (msg.action === 'gotLoc') {
    getTabId_Then(tabId => {
      getState_Then(state => {
        //Add a navigation event to our logs
        console.log('GotLocation: '+msg.url);
        let content = {};
        content.oneisbad = false;
        //Check if we have searchToken or analyticsToken

        content.content = `<li class='${(state['searchToken']!=undefined) ? "validInd" : "notvalidInd"} notmandatory' style='width: auto !important;'>searchToken<span class='propvalue'><pre class='code'>${state['searchToken']}</pre></span></li>`;
        content.content += `<li class='${(state['analyticsToken']!=undefined) ? "validInd" : "notvalidInd"} notmandatory' style='width: auto !important;'>analyticsToken<span class='propvalue'><pre class='code'>${state['analyticsToken']}</pre></span></li>`;
        let rec = { type: 'NAV', statusCode: 200, time: getTime(), req: '1', data: content, request: { type: 'Navigated to new Page', url: msg.url, data: {} } };
        if (state.enabledSearch) {
          state.dev.unshift(rec);
          if (state.devconnection != '') state.devconnection.postMessage(rec);
        }
        state.document_url = msg.url;
        //Reset the pp values in the checks
        resetPP(state);
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
        if (msg.data == undefined) return true;
        let posted = JSON.parse(msg.data);
        let events = {};
        events = getURLParams(msg.url);
        Object.assign(posted, events);
        console.log('POST: BEACON READY TO SENT ' + currentRequestId);
        console.log('POST: BEACONdata ' + msg.data);

        if (msg.url.indexOf('/collect') == -1) {
          state.analyticRequests.unshift({ url: msg.url });
          executeChecks(getTime(), currentRequestId, 'Analytics (beacon)', msg.url, posted, state, analyticChecks, state.scenario.analyticChecks, false, 'analyticReport', 'analyticInd', true);
          //not now, later when response is received if (state.devconnection!='') state.devconnection.postMessage(rec);
        } else {
          executeChecks(getTime(), currentRequestId, 'E Commerce (beacon)', msg.url, posted, state, ecChecks, state.scenario.ecChecks, false, 'ecReport', 'ecInd', true);
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
        if (msg.obj.info == undefined) {
          state.record[state.record.length] = msg.obj;
          state.recempty = false;

        } else {
          if (msg.obj.info.id.indexOf('CoveoResponseChecker') == -1 && msg.obj.info.selector.indexOf('CoveoResponseChecker') == -1) {

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
        console.log('GET STATUS: ' + state.recactive);
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
  else if (msg.type == 'download') {
    getTabId_Then(tabId => {
      chrome.tabs.sendMessage(tabId || null, msg);
    });
  }
  else if (msg.type == 'downloadjson') {
    getTabId_Then(tabId => {
      chrome.tabs.sendMessage(tabId || null, msg);
    });
  }
  else if (msg.type === 'reset') {
    getTabId_Then(tabId => {
      //save dev connection
      let devc = '';
      let devt = '';
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
          if (state.devconnection != '') state.devconnection.postMessage({ all: state.dev });
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
  else if (msg.type === 'selectscenario') {
    getTabId_Then(tabId => {
      getState_Then(state => {
        state.scenarioId = msg.scenarioId;
        //if there is a scenario selected
        if (state.scenarioId != '') {
          //Clear previous values
          state.checks = undefined;
          state.checks = {};
          state.ecResults = {};
          state.scenario = buildScenario(state);
          let content = {};
          content.oneisbad = false;
          content.content = '';
          //Do we need to reset the values?
          resetPersistentValuesScenario(state, state.scenarioId);
          let rec = { type: 'SCENARIO', statusCode: 200, time: getTime(), req: '', data: content, request: { type: 'Scenario Selected: ' + msg.scenarioId, url: '', data: {} } };
          state.dev.unshift(rec);
          if (state.devconnection != '') state.devconnection.postMessage(rec);

        }
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
            chrome.tabs.sendMessage(tabId, {
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

let getData = function (raw, formData, events) {
  let postedString = {};
  if (raw) {
    let decode = decodeRaw(raw);
    //Is it JSON?
    try {
      postedString = JSON.parse(decode);
    } catch(e) {
      //it is not JSON, so split it by &
      //Create a fake url
      let url = `https://www.coveo.com?${decode}`;
      postedString = getURLParams(url);
    }
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
  if (events != undefined) {

    Object.assign(postedString, events);
  }
  return postedString;
}

let doChecks = function (postedString, url, checks, state, report, reportindicator, google, saveit, initonly) {
  //console.log(postedString);
  state[report] = '';
//For ECResults we can have multiple return results for the developer console...
  let content = '';
  let wehavedata=false;
  let curtitle = '';
  let curvalue = '';
  let curcontent = '';
  let curcontentfordev = '';
  let ecresultsfordev = [];
  let oneisbad = false;
  let oneisbadSingle = false;
  let skip = false;
  checks.map(check => {
    let expected = 'Expected: Not empty/undefined';
    let isValid = false;
    let isValidSingle = false;
    let value = '';
    let first = false;
    if (check.ex !=undefined) {
      expected = 'Expected: '+check.ex;
    }
    if (check.first !=undefined) {
      if (check.first == true) { first = true;}
    }
    let persistent = '';
    let translatedProp = getTranslation(check.prop);
    translatedProp = translatedProp == '' ? '' : ' (' + translatedProp + ')';
    let usinggoogle = false;

    let title = '';
    let go = true;
    let mandatory = false;
    if (check.m !== undefined) {
      if (check.m == true) {
        mandatory = check.m;
      }
    }
    //First check if we url is there
    if (check.url !== '') {
      go = false;
      if (url.indexOf(check.url) !== -1) {
        go = true;
      }
    }

    //Second check if prop is there
    if (go) {
      value = '';
      curvalue = '';
      let prop = check.prop;
      let parent = '';
      if (prop.indexOf('/') != -1) {
        //We have a nested property
        prop = check.prop.split('/')[1];
        parent = check.prop.split('/')[0];
      }
      if (parent != '') {
        if (getParameterCaseInsensitive(postedString, parent)) {
          let nested = postedString[parent];
          if (getParameterCaseInsensitive(nested, prop)) {
            value = getParameterCaseInsensitive(nested, prop);

            if (typeof value === 'string' || value instanceof String) {
              value = value.toLowerCase();

            }
            curvalue = value;
            //check.lastValue = value;
            //if (saveit) state.checks[check.key] = value;

          }
        }

      } else {
        if (getParameterCaseInsensitive(postedString, check.prop)) {
          value = getParameterCaseInsensitive(postedString, check.prop);
          if (typeof value === 'string' || value instanceof String) {
            value = value.toLowerCase();

          }
          curvalue = value;
          //if (saveit) state.checks[check.key] = value;
        }
      }
      //If check.check is there we need to check if that is available
      if (check.check !== undefined) {
        if (check.check.test) {
          try {
            go = check.check.test(postedString);
          } catch (e) {
            go = false;
          }
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
          catch (e) {
            isValid = check.value.test(value.toString());
          }
          isValidSingle = isValid;
        }
        else {
          isValid = (value === check.value);
          isValidSingle = isValid;
        }
      }
      //Validate persistency
      let persistentkey = check.key + title;
      if (google != undefined) {
        if (google == true) {
          persistentkey += 'google';
          usinggoogle = true;
        } else {
          usinggoogle = false;
        }
      }
      if (check.p != undefined && usinggoogle == false && saveit == true) {
        let persist = true;
        if (check.p) {
          if (state.persistent[persistentkey] == undefined) {
            //Empty persistent value, so must be first one in
            state.persistent[persistentkey] = value;
            persist = true;
          } else {
            //We have a previous value
            let pages = 'during session.';
            //Check if we need to validate for persistentold if pp=true
            if (check.pp != undefined) {
              if (check.pp) {
                pages = 'during a page visit.';
                if (state.persistentOld[persistentkey] == undefined) {
                  //no old value yet
                  //simply save the current value in the persistent one
                  state.persistent[persistentkey] = value;
                } else {
                  //We have an older value, this SHOULD BE unequal to previous one
                  if (state.persistentOld[persistentkey] == value) {
                    persistent = `Value should be NEW after page update.<br>Old: ${state.persistentOld[persistentkey]}<br>New: ${value}`;
                  }
                  //Undefine the OLD one
                  state.persistentOld[persistentkey] = undefined;
                  //Save the new one
                  state.persistent[persistentkey] = value;
                }

              }
            }
            //Check on empty persistent value
            if (state.persistent[persistentkey] == '') {
              state.persistent[persistentkey] = value;
            }
            if (state.persistent[persistentkey] != value) {
              persist = false;
              persistent = `Value should be persistent ${pages}<br>Old: ${state.persistent[persistentkey]}<br>New: ${value}`;
              //Saving current value
              state.persistent[persistentkey] = value;
            }
          }
        }
      }
    }
    //Check if we have a valid check in the state
    //first get the old value of the state
    let def_value = true;
    skip = false;
    if (saveit) {
      if (check.default !== undefined) {
        def_value = check.default;
      }
      if (check.key in state.checks) {
      if (state.checks[check.key] == def_value) {
        isValid = def_value;
        if (state.checks[check.key] != undefined) {
          value = state.checks[check.key];
        }
      }
    }
    }
    //}
    //We need to save the ecResults
    if (go) {
      if (title != '') {
        if (curtitle=='') {
          curtitle = title;
        }
        //Check if curtitle != title, if so, add content to array
        if (curtitle!='' && curtitle!=title && curcontentfordev!='') {
           ecresultsfordev.push({ content: curcontentfordev, oneisbad: oneisbadSingle, title: curtitle });
           oneisbadSingle = false;
           curcontentfordev = '';
        }
        if (state.ecResults[title] == undefined) {
          if (saveit || (!saveit && state.scenarioId!='')) {
            skip = true;
          } else {
            skip = false;
            state.ecResults[title] = {};
            state.ecResults[title]['Count'] = 0;
            state.ecResults[title]['TOTALS'] = false;
          }
        }
        if (!skip) {
          if (first) {
            if (saveit) {
              let current = state.ecResults[title]['Count'];
              if (current == undefined) current = 0;
              state.ecResults[title]['Count'] = current + 1;
              state.ecResults[title]['TOTALS'] = false;
            }
          }
          curtitle = title;

          //For the totals we only want to keep the isValid = false (if it was set before)
          //We do not care about google events
          if (saveit) {
            if (usinggoogle == false) {
              if (state.ecResults[title][check.prop] == undefined) {
                state.ecResults[title][check.prop] = isValid;
              } else {
                //Only if scenarioId is empty
                if (state.scenarioId == '') {
                  if (state.ecResults[title][check.prop] == true) {
                    state.ecResults[title][check.prop] = isValid;
                  }
                } else {
                  state.ecResults[title][check.prop] = isValid;
                }
              }
              //update totals, if one of them is false ==> set it to true
              if (mandatory) {
                if (state.ecResults[title][check.prop] == false) {
                  state.ecResults[title]['TOTALS'] = true;
                }

              }
            }
          }
          wehavedata = true;
          curcontentfordev += `<li class='${(isValidSingle && persistent == '') ? "validInd" : "notvalidInd"}${mandatory ? " " : " notmandatory"}'>${check.prop}${translatedProp}<span class='propvalue'>${curvalue}</span><span class='propex'>${expected}</span>${(persistent == "") ? "" : `<span class=persistent>${persistent}</span>`}</li>`;
          if (!isValid && mandatory && saveit) oneisbad = true;
          if (!isValidSingle && mandatory) oneisbadSingle = true;
        }
      }
    }
    //If key is not in state, give warning
    if (title == '') {
      if (saveit) {
        state.checks[check.key] = isValid;
        wehavedata = true;

        if (!isValid && mandatory) oneisbad = true;
      }
      if (check.t && go) {
        if (!isValidSingle && mandatory) oneisbadSingle = true;
      }
      let ctitle = '';
      if (check.title !== undefined) {
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
        ctitle = check.title + ' - ' + (check.t ? check.prop : check.key);
      } else {
        ctitle = check.t ? check.prop : check.key;
        //curcontent+= `<td class='${isValid?"valid":"notvalid"}${mandatory?" ":" notmandatory"}'></td><td>${check.key}</td><td>${value}${def_value==false?"(should be false or empty)":""}</td>`;   
      }

      if (saveit) content += `<tr><td class='${(isValid && persistent == '') ? "valid" : "notvalid"}${mandatory ? " " : " notmandatory"}'></td><td>${ctitle}${translatedProp}</td><td>${value}<span class='propex'>${expected}</span>${(persistent == "") ? "" : `<span class=persistent>${persistent}</span>`}</td></tr>`;
      if (check.t && go) curcontentfordev += `<li class='${(isValidSingle && persistent == '') ? "validInd" : "notvalidInd"}${mandatory ? " " : " notmandatory"}'>${check.prop}${translatedProp}<span class='propvalue'>${curvalue}</span><span class='propex'>${expected}</span>${(persistent == "") ? "" : `<span class=persistent>${persistent}</span>`}</li>`;
      //curcontentfordev += `<li class='${isValidSingle?"validInd":"notvalidInd"}${mandatory?" ":" notmandatory"}'>${ctitle} (${value})</li>`;

    } /*else {
        console.log('MAYDAY: key '+check.key+' NOT IN STATE!!!!');
      }*/
    //    }
  });
  //content+= `<tr><td>${curtitle}</td>${curcontent}</tr>`;
  if (saveit) {
    state[report] = content;
    if (initonly==undefined) state[reportindicator] = oneisbad;
    if (initonly==undefined) {
      //Set that we have data received
      if (wehavedata) state[reportindicator+'Data'] = true;
    } else {
      if (wehavedata) state[reportindicator+'Data'] = false;
    }
  }
  saveState(state, state.tabId);
  if (curcontentfordev!='' && curtitle!='') {
    ecresultsfordev.push({ content: curcontentfordev, oneisbad: oneisbadSingle, title: curtitle });
    return ecresultsfordev;
  } else {
    return { content: curcontentfordev, oneisbad: oneisbadSingle, title: curtitle };
  }
}

function getURLParams(url) {
  //Fix relative url's
  if (!url.startsWith('http')) {
    url = 'https://platform.coveo.com'+url;
  }

  let newurl = new URL(url);
  let params = new URLSearchParams(newurl.search);
  const result = {}
  for (const [key, value] of params) { // each 'entry' is a [key, value] tupple
    result[key] = value;
  }
  return result;
}

let onSearchRequest = function (details) {
  if (details.method == "OPTIONS" || (details.method == "GET" && details.url.indexOf('/querySuggest') == -1)) return;
  if (details.url.indexOf('cloud.coveo.com:443%22') != -1) return;

  if (details.url.indexOf('/html?uniqueId') > 0) return;
  if (details.url.indexOf('/analytics/') > 0) return;
  if (details.url.indexOf('/log?') > 0) return;
  if (details.url.indexOf('/values/batch?') > 0) return;
  if (details.url.indexOf('/plan?') > 0) return;
  let events = {};
  events = getURLParams(details.url);
  getState_Then(state => {
    if (!state.enabledSearch) return;
    if (details.statusCode) {
      //We have a OnCompleted request
      //Handle the statusCode
      let welldone = details.statusCode == 200;
      //find URL in our dev list and update statuscode
      let req = details.requestId;
      console.log("CATCHED Search ON COMPLETE: ", details.requestId);
      for (let i = 0; i < state.dev.length; ++i) {

        if (state.dev[i].request.url == details.url && state.dev[i].req == req) {
          state.dev[i].statusCode = details.statusCode;
          if (state.devconnection != '') state.devconnection.postMessage({one: state.dev[i]});
          break;
        }
      }
      saveState(state, state.tabId);
      return;
    }
    let thisState = {};
    console.log("CATCHED Search ", details.url);
    console.log("CATCHED Search ", details.requestId);
    if (details.url.includes('querySuggest')) {
      console.log("CATCHED querySuggest ", details.url);
      thisState.suggestSent = true;
      if (state.querySuggestRequests == undefined) {
        state.querySuggestRequests = [];
      }
      let raw = details.requestBody && details.requestBody.raw,
        formData = (details.requestBody && details.requestBody.formData) || {};

      let postedString = getData(raw, formData, events);
      state.querySuggestRequests.unshift({ url: details.url });
      executeChecks(getTime(), details.requestId, 'Query Suggest', details.url, postedString, state, qsChecks, state.scenario.qsChecks, false, 'qsReport', 'qsInd', true);

    }
    else if (details.url.includes('facet')) {
      console.log("CATCHED facet ", details.url);
      thisState.facetSearchSent = true;
    }
    else {

      let raw = details.requestBody && details.requestBody.raw,
        formData = (details.requestBody && details.requestBody.formData) || {};

      let postedString = getData(raw, formData, events);

      if (state.queryRequests == undefined) {
        state.queryRequests = [];
      }

      state.queryRequests.unshift({ url: details.url });
      //console.log(postedString);
      // thisState.queryExecuted = postedString;
      var fullstring = JSON.stringify(postedString);
      executeChecks(getTime(), details.requestId, 'Query', details.url, postedString, state, searchChecks, state.scenario.searchChecks, false, 'searchReport', 'searchInd', true);
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

let isMandatoryProp = (key) => {
  let result = false;
  ecChecks.map((check) => {
    if (check.prop == key) {
      if (check.m != undefined) {
        if (check.m == true) {
          result = true;
        }
      }
    }
  });
  return result;
}

let isMandatoryEC = (key) => {
  let result = false;
  defaultECResults.map((check) => {
    if (check == key) result = true;
  });
  return result;
}

let addEcResults = function (state) {
  state.ecReport = '';
  let areWeComplete = true;
  Object.keys(state.ecResults).map((key) => {
    let mandatoryEvent = isMandatoryEC(key);
    let isValid = state.ecResults[key]['TOTALS'];
    //If no request found (yet)
    if (isValid == undefined && mandatoryEvent) {
      areWeComplete = false;
    }
    //Or we if we have 0 Count
    if (mandatoryEvent && state.ecResults[key]['Count'] == 0) {
      areWeComplete = false;
      isValid = true;
    }
    if (isValid == undefined) {
      isValid = true;
    }

    let line = `<tr><td class='${(!isValid) ? "valid" : "notvalid"}${mandatoryEvent ? " " : " notmandatory"}'></td><td>${key}</td>`;
    Object.keys(state.ecResults[key]).map((prop) => {
      //Check if key is mandatory
      let mandatory = isMandatoryProp(prop);
      if (prop == 'Count') {
        line += `<td style="border-right:none;min-width: 1px;"></td><td style="border-left:none">${state.ecResults[key][prop]} Request(s)</td>`;
      } else {
        if (prop != 'TOTALS') {
          line += `<td class='${state.ecResults[key][prop] ? "valid" : "notvalid"}${mandatory ? " " : " notmandatory"}' style="border-right:none"></td><td style="border-left:none">${prop}</td>`;
          if (mandatory && mandatoryEvent) {
            if (state.ecResults[key][prop] == false) {
              areWeComplete = false;
            }
          }
        }
      }
    });
    line += "</tr>";
    state.ecReport += line;
  });
  //Update state indicator
  state.ecInd = !areWeComplete;

}


let onAnalyticsRequest = function (details) {
  if (details.method == "OPTIONS") return;
  //Weird errors remove them
  if (details.url.indexOf('googleanalytics-analytics.js') != -1) return;
  if (details.url.indexOf('https://collect') != -1) return;
  if (details.url.indexOf('%2Fcollect') != -1) return;
  if (details.url.indexOf('/jserrors/')!=-1) return;
  if (details.url.indexOf('%22/coveo/rest/') != -1) return;
  if (details.url.indexOf('https://analytics.api.tooso') !=-1) return;
  if (details.url.indexOf('fmt=js') !=-1) return;
  if (details.url.indexOf('/webevents/') !=-1) return;
  if (details.url.indexOf('visitor_id=') !=-1) return;
  if (details.url.indexOf('aip=') !=-1) return;
  //We do not want to track Google GTM events were pa is not in there l&pa=detail&
  if ((details.url.startsWith('https://www.google-analytics') || details.url.startsWith('https://analytics.google.com/')) && details.url.indexOf('&pa=') == -1) return;
  getState_Then(state => {
    if (!state.enabledSearch) return;
    if (details.statusCode) {
      //We have a OnCompleted request
      //Handle the statusCode
      let welldone = details.statusCode == 200;
      //find URL in our dev list and update statuscode
      let req = details.requestId;
      let found = false;
      console.log('REQUEST ID BEACON: ' + req);
      for (let i = 0; i < state.dev.length; ++i) {

        if (state.dev[i].request.url == details.url && state.dev[i].req == req) {
          state.dev[i].statusCode = details.statusCode;
          found = true;
          if (state.devconnection != '') state.devconnection.postMessage({one:state.dev[i]});
          //there could be more with the same requestid
          //break;
        }
      }
      if (!found) {
        currentResponse = details.statusCode;
      } else {
        currentResponse = '';
      }
      saveState(state, state.tabId);
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
    if (state.analyticRequests == undefined) {
      state.analyticRequests = [];
    }

    let raw = details.requestBody && details.requestBody.raw,
      formData = (details.requestBody && details.requestBody.formData) || {};

    //It could be that the searchEvents is sent as JSON in the URL
    let decodedUri = decodeURIComponent(details.url);
    let uri = new URL(details.url);//decodedUri);
    let searchEvents = {};
    let eventsU;
    try {
      searchEvents = uri.searchParams.get("searchEvents");
      eventsU = JSON.parse(decodeURIComponent(searchEvents))[0];
    }
    catch (e) {

    }
    try {
      searchEvents = uri.searchParams.get("collectEvent");
      eventsU = JSON.parse(decodeURIComponent(searchEvents))[0];
    }
    catch (e) {

    }
    //Try clickevents
    if (!eventsU) {
      try {
        searchEvents = uri.searchParams.get("clickEvent");
        eventsU = JSON.parse(decodeURIComponent(searchEvents));
      }
      catch (e) {

      }
    }
    //Try customevents
    if (!eventsU) {
      try {
        searchEvents = uri.searchParams.get("customEvent");
        eventsU = JSON.parse(decodeURIComponent(searchEvents));
      }
      catch (e) {

      }
    }
    //Try visitor
    let visitor;
    try {
      visitor = uri.searchParams.get("visitor");
    }
    catch (e) {

    }
    if (!visitor) {
      try {
        visitor = uri.searchParams.get("visitorId");
      }
      catch (e) {

      }
    }

    //Check if we need to add the visitor to the JSON
    if (!eventsU) {
      eventsU = {};
    }
    //Get the visitor
    //url is like: https://usageanalytics.coveo.com/rest/v15/analytics/searches?visitor=baa899f0-0982-4ca4-b0b1-29ead6cce7e8
    // or: https://help.salesforce.com/services/apexrest/coveo/analytics/rest/v15/analytics/searches?visitor=092861ef-30ee-4719-ae5d-2c6dcdcffbee&access_token=eyJhbGciOiJIUzI1NiJ9.eyJmaWx0ZXIiOiIoKChAb2JqZWN0dHlwZT09KExpc3RpbmdDKSkgKEBzZmxpc3RpbmdjcHVibGljYz09VHJ1ZSkpIE9SIChAb2JqZWN0dHlwZT09KEhURGV2ZWxvcGVyRG9jdW1lbnRzQykpIE9SICgoQG9iamVjdHR5cGU9PShIZWxwRG9jcykpIChAc3lzc291cmNlPT1cIlNpdGVtYXAgLSBQcm9kLURvY3NDYWNoZVwiKSAoTk9UI
    if (visitor != null) {
      console.log(`Visitor: ${visitor} found.`);
      if (visitor) {
        eventsU['visitor'] = visitor;
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
    if (raw == undefined && Object.keys(formData).length == 0 && Object.keys(events).length < 5) {// && details.url.indexOf('/click')==-1) {
      console.log('POST: EMPTY BEACON');
      //We need this for our beacon POST
      return;
    } else {
      console.log('POST: NON EMPTY BEACON' + (raw == undefined) + '-' + Object.keys(formData).length + '-' + Object.keys(events).length);
    }

    let postedString = getData(raw, formData, events);
    if (details.url.indexOf('/collect') == -1) {
      state.analyticRequests.unshift({ url: details.url });
      executeChecks(getTime(), details.requestId, 'Analytics', details.url, postedString, state, analyticChecks, state.scenario.analyticChecks, false, 'analyticReport', 'analyticInd', true);
    } else {
      let type = 'E Commerce';
      let google = false;
      if (details.url.startsWith('https://www.google-analytics') || details.url.startsWith('https://analytics.google.com/')) {
        type += ' (Google GTM)';
        google = true;
      }

      executeChecks(getTime(), details.requestId, type, details.url, postedString, state, ecChecks, state.scenario.ecChecks, google, 'ecReport', 'ecInd', true);
      state.ecommerceRequests.unshift({ url: details.url });
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

let sendUpdate = function (state) {
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

chrome.tabs.onActivated.addListener(function (activeInfo) {
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
chrome.browserAction.setBadgeBackgroundColor({ color: '#1372EC' });
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

chrome.browserAction.onClicked.addListener(function (tab) {
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


chrome.runtime.onConnect.addListener(function (devToolsConnection) {
  // assign the listener function to a variable so we can remove it later
  console.log(devToolsConnection);
  var devToolsListener = function (message, sender, sendResponse) {
    //Save the devtools tab in the state
    if (message.name == 'init') {
      getState_Then(state => {
        state.devtab = message.tabId;
        state.devconnection = devToolsConnection;
        saveState(state, state.tabId);
        //Sent what we currently have in state.dev
        state.devconnection.postMessage({ all: state.dev });
      });
    }
    if (message.name == 'getnew') {
      getState_Then(state => {
        //Sent what we currently have in state.dev
        state.devconnection.postMessage({ all: state.dev });
      });
    }
    if (message.name == 'cleardev') {
      getState_Then(state => {
        state.dev = [];
        saveState(state, state.tabId);
      });

    }

  }
  // add the listener
  devToolsConnection.onMessage.addListener(devToolsListener);

  devToolsConnection.onDisconnect.addListener(function () {
    getState_Then(state => {
      state.devtab = '';
      state.devconnection = '';
      saveState(state, state.tabId);
    });
    devToolsConnection.onMessage.removeListener(devToolsListener);
  });
});