// ---------------------------------------------------------------------------
// NightwatchRenderer -- a class to render recorded tests to a CasperJS
// test format.
// ---------------------------------------------------------------------------
var DEFAULT_TIMEOUT = 5000;

var fixes = ['.coveo-query-syntax-disabled.magic-box.magic-box-hasFocus', 'REG: > svg > g > .*$', '.coveo-accessible-button-pressed', '.magic-box-notEmpty.magic-box-hasFocus'];

if (typeof EventTypes == "undefined") {
  EventTypes = {};
}

EventTypes.OpenUrl = 0;
EventTypes.Click = 1;
EventTypes.Change = 2;
EventTypes.Comment = 3;
EventTypes.Submit = 4;
EventTypes.CheckPageTitle = 5;
EventTypes.CheckPageLocation = 6;
EventTypes.CheckTextPresent = 7;
EventTypes.CheckValue = 8;
EventTypes.CheckValueContains = 9;
EventTypes.CheckText = 10;
EventTypes.CheckHref = 11;
EventTypes.CheckEnabled = 12;
EventTypes.CheckDisabled = 13;
EventTypes.CheckSelectValue = 14;
EventTypes.CheckSelectOptions = 15;
EventTypes.CheckImageSrc = 16;
EventTypes.PageLoad = 17;
EventTypes.ScreenShot = 18;
EventTypes.MouseDown = 19;
EventTypes.MouseUp = 20;
EventTypes.MouseDrag = 21;
EventTypes.MouseDrop = 22;
EventTypes.KeyPress = 23;

function NightwatchRenderer() {
  this.document = '';
  this.json = [];
  this.title = "Testcase";
  this.items = null;
  this.history = [];
  this.last_events = [];
  this.screen_id = 1;
  this.unamed_element_id = 1;
}

NightwatchRenderer.prototype.text = function (txt) {
  // todo: long lines
  //this.document.writeln(txt);
  this.document += txt + '\n';
};

NightwatchRenderer.prototype.stmt = function (text, indent) {
  if (indent == undefined) indent = 1;
  var output = new Array(2 * indent).join(" ") + text;
  //this.document.writeln(output);
  this.document += output + '\n';
};

NightwatchRenderer.prototype.cont = function (text) {
  //this.document.writeln("    ... " + text);
  this.document += "    ... " + text + '\n';
};

NightwatchRenderer.prototype.pyout = function (text) {
  //this.document.writeln("    " + text);
  this.document += "    " + text + '\n';
};

NightwatchRenderer.prototype.pyrepr = function (text, escape) {
  // todo: handle non--strings & quoting
  var s = "'" + text + "'";
  if (escape) s = s.replace(/(['"])/g, "\\$1");
  return s;
};

NightwatchRenderer.prototype.space = function () {
  //this.document.write("\n");
  this.document += '\n';
};

NightwatchRenderer.prototype.regexp_escape = function (text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s\/]/g, "\\$&");
};

NightwatchRenderer.prototype.cleanStringForXpath = function (str, escape) {
  var parts = str.match(/[^'"]+|['"]/g);
  parts = parts.map(function (part) {
    if (part === "'") {
      return '"\'"'; // output "'"
    }

    if (part === '"') {
      return "'\"'"; // output '"'
    }
    return "'" + part + "'";
  });
  var xpath = "";
  if (parts.length > 1) {
    xpath = "concat(" + parts.join(",") + ")";
  } else {
    xpath = parts[0];
  }
  if (escape) xpath = xpath.replace(/(["])/g, "\\$1");
  return xpath;
};

var d = {};
d[EventTypes.OpenUrl] = "openUrl";
d[EventTypes.Click] = "click";
d[EventTypes.Change] = "change";
d[EventTypes.Comment] = "comment";
d[EventTypes.Submit] = "submit";
d[EventTypes.CheckPageTitle] = "checkPageTitle";
d[EventTypes.CheckPageLocation] = "checkPageLocation";
d[EventTypes.CheckTextPresent] = "checkTextPresent";
d[EventTypes.CheckValue] = "checkValue";
d[EventTypes.CheckText] = "checkText";
d[EventTypes.CheckHref] = "checkHref";
d[EventTypes.CheckEnabled] = "checkEnabled";
d[EventTypes.CheckDisabled] = "checkDisabled";
d[EventTypes.CheckSelectValue] = "checkSelectValue";
d[EventTypes.CheckSelectOptions] = "checkSelectOptions";
d[EventTypes.CheckImageSrc] = "checkImageSrc";
d[EventTypes.PageLoad] = "pageLoad";
d[EventTypes.ScreenShot] = "screenShot";
/*d[EventTypes.MouseDown] = "mousedown";
d[EventTypes.MouseUp] = "mouseup"; */
d[EventTypes.MouseDrag] = "mousedrag";
d[EventTypes.KeyPress] = "keypress";

NightwatchRenderer.prototype.dispatch = d;

var cc = EventTypes;

NightwatchRenderer.prototype.render = function (with_xy, tests, json) {
  this.with_xy = with_xy;
  var etypes = EventTypes;
  this.json = [];
  //this.document.open();
  //this.document.write("<" + "pre" + ">");
  this.document += "<" + "pre" + " class=mycode id='NightwatchCode' >";
  this.writeHeader();
  var last_down = null;
  let last_up = null;
  var forget_click = false;

  for (var i = 0; i < this.items.length; i++) {
    var item = this.items[i];
    if (item.type == etypes.Comment) this.space();

    if (i == 0) {
      if (item.type != etypes.OpenUrl) {
        this.text(
          "ERROR: the recorded sequence does not start with a url openning."
        );
      } else {
        this.startUrl(item);
        continue;
      }
    }
    //this.stmt("//"+JSON.stringify(item));
    // remember last MouseDown to identify drag
    if (item.type == etypes.MouseDown) {
      last_down = this.items[i];
      continue;
    }
    if (item.type == etypes.MouseUp) {
      last_up = this.items[i];
      //continue;
    }
    if (item.type == etypes.MouseUp && last_down) {
      if (Math.floor(last_down.x) == Math.floor(item.x) && Math.floor(last_down.y) == Math.floor(item.y)) {
        forget_click = false;
        //Always use the mousedown event
        item = last_down;
        //Fire click for this instead
        if (item.info.tagName != 'SELECT') this[this.dispatch[etypes.Click]](item);
        continue;
      } else {
        console.log('Selector: forget click');
        //Seems this does not work, so we get rid of it
        /*item.before = last_down;
        this[this.dispatch[etypes.MouseDrag]](item);
        last_down = null;
        forget_click = true;*/
        continue;
      }
    }
    //If we are selecting sometehing
    if (item.type == etypes.Change && item.info.tagName == 'SELECT') {
      console.log('We have a SELECT statement, we remove it');
      this[this.dispatch[etypes.Change]](item);
      continue;
    }
    //If we are selecting sometehing
    if (item.type == etypes.Change && item.info.tagName == 'INPUT' && item.info.type == "checkbox") {
      console.log('We have a SELECT statement for INPUT, just click on it');
      this[this.dispatch[etypes.Click]](item);
      continue;
    }
    if (item.type == etypes.Click && item.info.tagName == 'SELECT') {
      console.log('We have a CLICK/SELECT statement');
      this[this.dispatch[etypes.Change]](item);
      continue;
    }
    //Fix onChange
    if (item.type == etypes.Change && item.info.tagName != 'SELECT' && (item.info.id != "" || item.info.selector != "")) {
      //ignore normal change events
      console.log('We have a ONCHANGE statement');
      continue;
    }
    if ((item.type == etypes.Change || item.type == etypes.Click) && item.info.id == "" && item.info.selector == "") {
      //Take previous one and dispatch a click
      console.log('Selector: fixing onChange/empty onClick' + item.info.selector);
      try {
        if (!last_up) {
          item = this.items[i - 1];
          this[this.dispatch[etypes.Click]](item);
        } else {
          last_up = null;
        }
      } catch (e) {

      }
      continue;
    }
    //check if we need to click if same position as mouse up
    if (item.type == etypes.Click && last_up) {
      //If mouseup is defined, take that instead of the current click, if they are on the same position
      //Sinde mouse up is triggering click now we can discard this one
      if ((Math.floor(last_up.x) == Math.floor(item.x) && Math.floor(last_up.y) == Math.floor(item.y)) || (item.x == undefined)) {
        console.log('Selector: remove onclick because of mouseup');
        //item = last_up;
        //this[this.dispatch[etypes.Click]](item);
        last_up = null;
        continue;
      }
    }
    if (item.type == etypes.Click && forget_click) {
      forget_click = false;
      continue;
    }

    // we do not want click due to user checking actions
    if (
      i > 0 &&
      item.type == etypes.Click &&
      ((this.items[i - 1].type >= etypes.CheckPageTitle &&
        this.items[i - 1].type <= etypes.CheckImageSrc) ||
        this.items[i - 1].type == etypes.ScreenShot)
    ) {
      continue;
    }

    if (this.dispatch[item.type]) {
      this[this.dispatch[item.type]](item);
    }
    if (item.type == etypes.Comment) this.space();
  }
  this.writeFooter();
  //this.document.write("<" + "/" + "pre" + ">");
  this.document += "<" + "/" + "pre" + ">";
  //this.document.close();
  if (json) {
    return JSON.stringify(this.json);
  } else {
  return this.document;
  }
};

NightwatchRenderer.prototype.writeHeader = function () {
  var date = new Date();
  this.text(
    "/*==============================================================================*/",
    0
  );
  this.text("/* CoveoResponseChecker generated " + date + " */", 0);
  this.text(
    "/*==============================================================================*/",
    0
  );
  this.space();
  this.stmt('const fs = require("fs");', 0);
  this.stmt("var DEFAULT_TIMEOUT = 5000;", 0);
  this.stmt("module.exports = {", 0);
  //this.stmt("'test case': function(client) {", 1);
  this.stmt("'test case': async function(client) {", 1);

  this.stmt("let mypage = client.page.Coveo();", 2);
  this.stmt('await mypage.setPause(2000);', 2);
  //this.stmt("return client", 2);
};
NightwatchRenderer.prototype.writeFooter = function () {
  this.stmt(`
  client.execute('return window.events', (result) => {
    console.log(result.value);
    for (var i = 0; i < result.value.length; i++) {
      let traffic = result.value[i];
      //console.log(traffic);
      let json = JSON.parse(traffic);
      console.log("type:" + json.type);
      console.log("url:" + json.url);
      console.log("data: " + json.obj);
    }
    //console.log(result);
  });`, 1);
  this.space();
  this.stmt("}", 1);
  this.stmt("};", 0);
};
NightwatchRenderer.prototype.rewriteUrl = function (url) {
  return url;
};

NightwatchRenderer.prototype.shortUrl = function (url) {
  return url;
  //this breaks the CSS selectors for xpath
  //return url.substr(url.indexOf("/", 10), 999999999);
};

NightwatchRenderer.prototype.startUrl = function (item) {
  var url = this.pyrepr(this.rewriteUrl(item.url));
  this.stmt("client.resizeWindow(" + item.width + ", " + item.height + ");", 3);
  this.stmt("client.url(" + url + ");", 3);
  this.stmt("client.pause(DEFAULT_TIMEOUT);", 3);
  this.stmt('await client.execute(fs.readFileSync("src/ajaxListener.js").toString());', 2);
  this.stmt("client.pause(DEFAULT_TIMEOUT);", 3);
  this.json.push({command:'OPEN', content:url});

};

NightwatchRenderer.prototype.openUrl = function (item) {
  var url = this.pyrepr(this.rewriteUrl(item.url));
  this.stmt("client.url('" + item.width + ", " + item.height + "');", 3);
  this.stmt("client.pause(DEFAULT_TIMEOUT);", 3);
  this.json.push({command:'OPEN', content:url});
};

NightwatchRenderer.prototype.pageLoad = function (item) {
  var url = this.pyrepr(this.rewriteUrl(item.url));
  this.history.push(url);
};

NightwatchRenderer.prototype.normalizeWhitespace = function (s) {
  return s
    .replace(/^\s*/, "")
    .replace(/\s*$/, "")
    .replace(/\s+/g, " ");
};


NightwatchRenderer.prototype.fixSelector = function (selector) {
  fixes.map(fix => {
    if (fix.indexOf('REG:') != -1) {
      //Use regular expression
      let fixreg = fix;
      let reg = fixreg.replace('REG:', '');
      //Check if selector ends with ", if so keep it
      let endwith = selector.endsWith('"') ? '"' : '';
      selector = selector.replace(new RegExp(reg), endwith);
    } else {
      selector = selector.replace(fix, '');
    }
  });

  return selector;
};

NightwatchRenderer.prototype.getControl = function (item) {
  var type = item.info.type;
  var tag = item.info.tagName.toLowerCase();
  var selector;
  if ((type == "submit" || type == "button") && item.info.value)
    selector =
      tag +
      "[type=" +
      type +
      "][value=" +
      this.pyrepr(this.normalizeWhitespace(item.info.value)) +
      "]";
  else if (item.info.name)
    selector = tag + "[name=" + this.pyrepr(item.info.name) + "]";
  else if (item.info.id) selector = /*tag +*/ "#" + item.info.id;
  else selector = item.info.selector;
  //Fix selector with fixes

  return selector;
};

NightwatchRenderer.prototype.getControlXPath = function (item) {
  var type = item.info.type;
  var way;
  if ((type == "submit" || type == "button") && item.info.value)
    way = "@value=" + this.pyrepr(this.normalizeWhitespace(item.info.value));
  else if (item.info.name) way = "@name=" + this.pyrepr(item.info.name);
  else if (item.info.id) way = "@id=" + this.pyrepr(item.info.id);
  else way = "TODO";

  return way;
};

NightwatchRenderer.prototype.getLinkXPath = function (item) {
  var way;
  if (item.text)
    way =
      "normalize-space(text())=" +
      this.cleanStringForXpath(this.normalizeWhitespace(item.text), true);
  else if (item.info.id) way = "@id=" + this.pyrepr(item.info.id);
  else if (item.info.href)
    way = "@href=" + this.pyrepr(this.shortUrl(item.info.href));
  else if (item.info.title)
    way = "title=" + this.pyrepr(this.normalizeWhitespace(item.info.title));

  return way;
};

// DnD template
NightwatchRenderer.prototype.mousedrag = function (item) {
  if (this.with_xy) {
    this.stmt(".moveTo(null, " + item.before.x + ", " + item.before.y + ")", 3);
    this.stmt(".mouseButtonDown(0)", 3);
    this.stmt(".moveTo(null, (" + item.x + ", " + item.y + ")", 3);
    this.stmt(".mouseButtonUp(0)", 3);
  }
};

NightwatchRenderer.prototype.click = function (item) {
  //Check if we have valid info
  if (item.info.id == "" && item.info.selector == "") return;
  var tag = item.info.tagName.toLowerCase();

  if (this.with_xy && !(tag == "a" || tag == "input" || tag == "button")) {
    this.stmt(".moveTo(null, " + item.x + ", " + item.y + ")", 3);
    this.stmt(".mouseButtonDown(0)", 3);
    this.stmt(".mouseButtonUp(0)", 3);
  } else {
    var selector;
    if (tag == "a") {
      var xpath_selector = false;// this.getLinkXPath(item);
      if (xpath_selector) {
        selector = '"//a[' + xpath_selector + ']"';
      } else {
        selector = '"' + item.info.selector + '"';
      }
    } /*else if (tag == "input" || tag == "button") {
      selector = this.getFormSelector(item) + this.getControl(item);
      selector = '"' + selector + '"';
    } */
    else {
      selector = '"' + item.info.selector + '"';
    }
    //xpath_selector && this.stmt(".useXpath()");
    console.log("path: " + selector);
    //clean selector
    selector = this.fixSelector(selector);
    console.log("path after fix: " + selector);
    //this.stmt(".waitForElementVisible(" + selector + ", DEFAULT_TIMEOUT)", 3);
    //this.stmt(".customClick(" + selector + ")", 3);
    //this.stmt(".click(" + selector + ")", 3);
    if (xpath_selector) {
      this.stmt("await mypage.c_moveToElement(" + selector + ",10,10,'xpath');", 3);
      this.stmt("await mypage.c_click(" + selector + ",'xpath');", 3);
      this.stmt("await mypage.c_Pause();", 3);
      this.json.push({command:'CLICK', selector:selector, type:'XPATH'});

    } else {
      this.stmt("await mypage.c_moveToElement(" + selector + ",10,10);", 3);
      this.stmt("await mypage.c_click(" + selector + ");", 3);
      this.stmt("await mypage.c_Pause();", 3);
      this.json.push({command:'CLICK', selector:selector, type:'CSS'});

    }

    //xpath_selector && this.stmt(".useCss()");
  }
};

NightwatchRenderer.prototype.getFormSelector = function (item) {
  var info = item.info;
  if (!info.form) {
    return "";
  }
  if (info.form.name) {
    return "form[name=" + info.form.name + "] ";
  } else if (info.form.id) {
    return "form#" + info.form.id + " ";
  } else {
    //return "form ";
    return "";
  }
};

NightwatchRenderer.prototype.keypress = function (item) {
  var text = item.text.replace("\n", "").replace("\r", "\\r");
  //console.log("key: " + text);
  /*this.stmt(
    '.waitForElementVisible("' + this.getControl(item) + '", DEFAULT_TIMEOUT)',
    3
  );*/
  //First clear the value
  //clean selector
  let selector = this.getControl(item);
  selector = this.fixSelector(selector);
  this.stmt('await client.clearValue("' + selector + '");', 3);
  this.stmt('await mypage.c_setValue("' + selector + '", "' + text + '");', 3);
  this.stmt("await mypage.c_Pause();", 3);
  this.json.push({command:'SETVALUE', selector:selector, content:text, type:'CSS'});
  this.json.push({command:'ENTER', selector:'', content:'', type:'CSS'});
  /*this.stmt('client.keys(client.Keys.ENTER);',3);
  this.stmt("client.pause(DEFAULT_TIMEOUT);",3);*/
};


NightwatchRenderer.prototype.change = function (item) {
  var text = item.info.value.replace("\n", "").replace("\r", "\\r");
  //console.log("key: " + text);
  /*this.stmt(
    '.waitForElementVisible("' + this.getControl(item) + '", DEFAULT_TIMEOUT)',
    3
  );*/
  //First clear the value
  let selector = this.getControl(item);
  selector = this.fixSelector(selector);
  this.stmt('await mypage.c_setValue("' + selector + '", "' + text + '");', 3);
  this.stmt("await mypage.c_Pause();", 3);
  this.stmt("await mypage.c_Pause();", 3);
  this.json.push({command:'SETVALUE', selector:selector, content:text, type:'CSS'});
  this.json.push({command:'ENTER', selector:'', content:'', type:'CSS'});
};

NightwatchRenderer.prototype.submit = function (item) {
  // the submit has been called somehow (user, or script)
  // so no need to trigger it.
  this.stmt("/* submit form */");
};

NightwatchRenderer.prototype.screenShot = function (item) {
  this.stmt('.saveScreenShot("screenshot' + this.screen_id + '.png")', 3);
  this.screen_id = this.screen_id + 1;
};

NightwatchRenderer.prototype.comment = function (item) {
  this.stmt("// comment? todo: find out this case", 3);
  //var lines = item.text.split('\n');
  //this.stmt('casper.then(function() {');
  //for (var i=0; i < lines.length; i++) {
  //  this.stmt('    test.comment("'+lines[i]+'");');
  //}
  //this.stmt('});');
};

NightwatchRenderer.prototype.checkPageTitle = function (item) {
  var title = this.pyrepr(item.title, true);
  // CM: this.stmt('.assert.title(' + title + ')', 3);
  this.stmt('.expect.element("title").text.to.equal(' + title + ")", 3);
};

NightwatchRenderer.prototype.checkPageLocation = function (item) {
  var url = this.regexp_escape(item.url);
  this.stmt('.assert.urlContains("' + url + '")');
};

NightwatchRenderer.prototype.checkTextPresent = function (item) {
  var selector =
    '"//*[contains(text(), ' + this.pyrepr(item.text, true) + ')]"';
  this.waitAndTestSelector(selector, "xPath");
};

NightwatchRenderer.prototype.checkValue = function (item) {
  var type = item.info.type;
  var way = this.getControlXPath(item);
  var selector = "";
  var isXpath;
  if (type == "checkbox" || type == "radio") {
    var selected;
    if (item.info.checked) selected = "@checked";
    else selected = "not(@checked)";
    selector = '"//input[' + way + " and " + selected + ']"';
  } else {
    var value = this.pyrepr(item.info.value);
    var tag = item.info.tagName.toLowerCase();
    selector = '"//' + tag + "[" + way + " and @value=" + value + ']"';
  }
  this.waitAndTestSelector(selector, "xPath");
};

NightwatchRenderer.prototype.checkText = function (item) {
  var selector = "";
  if (item.info.type == "submit" || item.info.type == "button") {
    selector = '"//input[@value=' + this.pyrepr(item.text, true) + ']"';
  } else {
    selector =
      "//*[normalize-space(text())=" +
      this.cleanStringForXpath(item.text, true) +
      "]";
  }
  this.waitAndTestSelector(selector, "xPath");
};

NightwatchRenderer.prototype.checkHref = function (item) {
  var href = this.pyrepr(this.shortUrl(item.info.href));
  var xpath_selector = this.getLinkXPath(item);
  if (xpath_selector) {
    // todo: add switcher for xpath/css modes
    selector = '"//a[' + xpath_selector + " and @href=" + href + ']"';
  } else {
    selector = item.info.selector + "[href=" + href + "]";
  }
  xpath_selector && this.stmt(".useXpath()");
  // CM: this.stmt('.assert.elementPresent('+selector+')');
  this.stmt("expect.element(" + selector + ").to.be.visible");
  xpath_selector && this.stmt(".useCss()");
};

NightwatchRenderer.prototype.checkEnabled = function (item) {
  var way = this.getControlXPath(item);
  var tag = item.info.tagName.toLowerCase();
  this.waitAndTestSelector(
    '"//' + tag + "[" + way + ' and not(@disabled)]"',
    "xPath"
  );
};

NightwatchRenderer.prototype.checkDisabled = function (item) {
  var way = this.getControlXPath(item);
  var tag = item.info.tagName.toLowerCase();
  this.waitAndTestSelector(
    '"//' + tag + "[" + way + ' and @disabled]"',
    "xPath"
  );
};

NightwatchRenderer.prototype.checkSelectValue = function (item) {
  var value = this.pyrepr(item.info.value);
  var way = this.getControlXPath(item);
  this.waitAndTestSelector(
    '"//select[' + way + "]/options[@selected and @value=" + value + ']"',
    "xPath"
  );
};

NightwatchRenderer.prototype.checkSelectOptions = function (item) {
  this.stmt("/* TODO */");
};

NightwatchRenderer.prototype.checkImageSrc = function (item) {
  var src = this.pyrepr(this.shortUrl(item.info.src));
  this.waitAndTestSelector('"//img[@src=' + src + ']"', "xPath");
};

NightwatchRenderer.prototype.waitAndTestSelector = function (
  selector,
  xpathSelector
) {
  xpathSelector && this.stmt(".useXpath()");
  console.log("wait and test selector");
  this.stmt(".waitForElementVisible(" + selector + ", DEFAULT_TIMEOUT)", 3);
  this.stmt(".expect.element(" + selector + ").visible(" + selector + ")", 3);
  xpathSelector && this.stmt(".useCss()");
};

/*var dt = new NightwatchRenderer(document);
window.onload = function onpageload() {
  var with_xy = false;
  if (window.location.search == "?xy=true") {
    with_xy = true;
  }
  chrome.runtime.sendMessage({ action: "get_items" }, function(response) {
    dt.items = response.items;
    dt.render(with_xy);
  });
};*/