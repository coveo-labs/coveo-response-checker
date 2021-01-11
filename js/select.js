"use strict";

function siblingPosition(node) {
    var i = 1;
    while(node = node.previousSibling) {
        if (node.nodeType == 1) i+= 1;
    }

    return i;
}

function getQuerySelector2(node) {
    if(node.id) return "#" + node.id;
    if(node.nodeName == "BODY") return "body";

    var position = siblingPosition(node);

    return getQuerySelector(node.parentNode) + ">:nth-child("+ position +")";
}

var indexOf = [].indexOf || function(item) {
  for (var i = 0, len = this.length; i < len; i++) {
    if ((i in this) && (this[i] === item)) {
      return i;
    }
  }
  return -1;
};

function isElement(element) {
  return !!((element != null ? element.nodeType : void 0) === 1);
};

function getAllParents(element) {
  var currentElement, result;
  result = [];
  if (isElement(element)) {
    currentElement = element;
    while (isElement(currentElement)) {
      result.push(currentElement);
      currentElement = currentElement.parentNode;
    }
  }
  return result;
};

function getTagSelector(element) {
  return element.tagName.toLowerCase();
};

function sanitizeItem(item) {
  return escape(item).replace(/\%/g, '\\').replace(/\*\+\-\.\//g, '\\$&');
};

function validateId (id) {
  if (id == null) {
    return false;
  }
  if (/^\d/.exec(id)) {
    return false;
  }
  return document.querySelectorAll("#" + id).length === 1;
};

function getIdSelector(element) {
  var id;
  id = element.getAttribute('id');
  if (id != null) {
    id = sanitizeItem(id);
  }
  id = validateId(id) ? id = "#" + id : id = null;
  return id;
};

function getClassSelectors(element) {
  var classString, item, result;
  result = [];
  classString = element.getAttribute('class');
  if (classString != null) {
    classString = classString.replace(/\s+/g, ' ');
    classString = classString.replace(/^\s|\s$/g, '');
    if (classString !== '') {
      result = (function() {
        var i, len, ref, results;
        ref = classString.split(/\s+/);
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          item = ref[i];
          results.push("." + (sanitizeItem(item)));
        }
        return results;
      }).call(this);
    }
  }
  return result;
};

function getAttributeSelectors(element) {
  var attribute, blacklist, i, len, ref, ref1, result;
  result = [];
  blacklist = ['id', 'class'];
  ref = element.attributes;
  for (i = 0, len = ref.length; i < len; i++) {
    attribute = ref[i];
    if (ref1 = attribute.nodeName, indexOf.call(blacklist, ref1) < 0) {
      result.push("[" + attribute.nodeName + "=" + attribute.nodeValue + "]");
    }
  }
  return result;
};

function getNthChildSelector(element) {
  var counter, i, len, parentElement, sibling, siblings;
  parentElement = element.parentNode;
  if (parentElement != null) {
    counter = 0;
    siblings = parentElement.childNodes;
    for (i = 0, len = siblings.length; i < len; i++) {
      sibling = siblings[i];
      if (isElement(sibling)) {
        counter++;
        if (sibling === element) {
          return ":nth-child(" + counter + ")";
        }
      }
    }
  }
  return null;
};

function testSelector(element, selector) {
  var isUnique = false, result;

  if ((selector != null) && selector !== '') {
    result = element.ownerDocument.querySelectorAll(selector);

    if ((result.length === 1) && (result[0] === element)) {
      isUnique = true;
    }
  }

  return isUnique;
};

function getAllSelectors(element) {
  return {
    tag: getTagSelector(element),
    id: getIdSelector(element),
    cls: getClassSelectors(element),
    attr: getAttributeSelectors(element),
    nth: getNthChildSelector(element)
  };
};

function testUniqueElement(element, selector) {
  var elementList, parent;
  parent = element.parentNode;
  elementList = parent.querySelectorAll(selector);
  return (elementList.length === 1) && (elementList[0] === element);
};

function getUniqueSelector(element) {
  var allClasses, selector, selectors;

  selectors = getAllSelectors(element);
  
  if (selectors.id != null) {
    return selectors.id;
  }
  
  if (testUniqueElement(element, selectors.tag)) {
    return selectors.tag;
  }
  
  if (selectors.cls.length !== 0) {
    allClasses = selectors.cls.join('');
    selector = allClasses;
    if (testUniqueElement(element, selector)) {
      return selector;
    }
    selector = selectors.tag + allClasses;
    if (testUniqueElement(element, selector)) {
      return selector;
    }
  }
  
  return selectors.nth;
};


function getQuerySelector(element) {
  var allSelectors, i, item, j, len, len1, parents, result, selector, selectors;
  allSelectors = [];
  parents = getAllParents(element);

  /**
   * Gets all unique selector for element parent nodes
   */
  for (i = 0, len = parents.length; i < len; i++) {
    item = parents[i];
    selector = getUniqueSelector(item);
    if (selector != null) {
      allSelectors.push(selector);
    }
  }

  /**
   * Return the shortest unique selector matched for given element
   */
  selectors = [];
  for (j = 0, len1 = allSelectors.length; j < len1; j++) {
    item = allSelectors[j];
    selectors.unshift(item);
    result = selectors.join(' > ');
    /*if (testSelector(element, result)) {
      return result;
    }*/
  }
  return result;
  //return null;
};

function getQuerySelector3(element) {
  const idx = (sib, name) => sib 
        ? idx(sib.previousElementSibling, name||sib.localName) + (sib.localName == name)
        : 1;
    const segs = elm => !elm || elm.nodeType !== 1 
        ? ['']
        : elm.id && document.getElementById(elm.id) === elm
            ? [`id("${elm.id}")`]
            : [...segs(elm.parentNode), elm instanceof HTMLElement
                ? `${elm.localName}[${idx(elm)}]`
                : `*[local-name() = "${elm.localName}"][${idx(elm)}]`];
    return segs(element).join('/');

}

