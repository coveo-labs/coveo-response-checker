"use strict";

class ElementSelector {
  constructor(element) {
    this.element = element;
  }

  isElement(element) {
    return !!((element ? element.nodeType : void 0) === 1);
  }

  getAllParents(element) {
    let currentElement = element;
    let elements = [];
    while (this.isElement(currentElement)) {
      elements.push(currentElement);
      currentElement = currentElement.parentNode;
    }
    return elements;
  }

  getTagSelector(element) {
    return element.tagName.toLowerCase();
  }

  sanitizeItem(item) {
    // Why do we need this?
    return escape(item).replace(/\%/g, '\\').replace(/\*\+\-\.\//g, '\\$&');
  }

  validateId(id) {
    if (!id) {
      return false;
    }
    if (/^\d/.test(id)) {
      return false;
    }
    return document.querySelectorAll("#" + id).length === 1;
  }

  getIdSelector(element) {
    let id = element.getAttribute('id');
    if (id) {
      id = this.sanitizeItem(id);
    }
    id = this.validateId(id) ? id = "#" + id : null;
    return id;
  }

  getClassSelectors(element) {
    let cssClasses = [];
    for (let i = 0; i < element.classList.length; i++) {
      cssClasses.push('.' + element.classList[i]);
    }
    return cssClasses;
  }

  getAttributeSelectors(element) {
    let result = [];
    let blacklist = ['id', 'class'];

    for (let i = 0; i < element.attributes.length; i++) {
      let attr = element.attributes[i];
      // (element.attributes || []).forEach(attr => {
      if (!blacklist.includes(attr.nodeName)) {
        result.push(`[${attr.nodeName}="${attr.nodeValue}"]`);
      }
      // });
    }

    return result;
  }

  getAttributes(element) {
    let attributes = {};
    let blacklist = ['id', 'class'];

    for (let i = 0; i < element.attributes.length; i++) {
      let attr = element.attributes[i];
      // element.attributes.forEach(attr => {
      if (!blacklist.includes(attr.nodeName)) {
        attributes[attr.nodeName] = attr.nodeValue;
      }
      // });
    }
    return attributes;
  }

  getNthChildSelector(element) {
    let parentElement = element.parentNode;
    if (parentElement != null) {
      let counter = 0;
      let siblings = parentElement.childNodes;
      for (let i = 0, len = siblings.length; i < len; i++) {
        let sibling = siblings[i];
        if (this.isElement(sibling)) {
          counter++;
          if (sibling.isSameNode(element)) {
            return `:nth-child(${counter})`;
          }
        }
      }
    }
    return null;
  }


  // test if the selector is leading to the current element only.
  testSelector(element, selector) {
    if (selector) {
      let result = element.ownerDocument.querySelectorAll(selector);

      if ((result.length === 1) && element.isSameNode(result[0])) {
        return true;
      }
    }

    return false;
  }

  testUniqueElementWithinParent(element, selector) {
    let parent = element.parentNode;
    let elementList = parent.querySelectorAll(selector);
    return (elementList.length === 1) && (elementList[0] === element);
  }

  getAllSelectors(element) {
    return {
      tag: this.getTagSelector(element),
      id: this.getIdSelector(element),
      cls: this.getClassSelectors(element),
      attr: this.getAttributeSelectors(element),
      attributes: this.getAttributes(element),
      nth: this.getNthChildSelector(element)
    };
  }

  reduceSelector(selectors, element) {
    if (selectors.id != null) {
      return selectors.id;
    }

    if (this.testUniqueElementWithinParent(element, selectors.tag)) {
      return selectors.tag;
    }

    if (selectors.cls.length !== 0) {
      let allClasses = selectors.cls.join('');
      let selector = allClasses;
      if (this.testUniqueElementWithinParent(element, selector)) {
        return selector;
      }
      selector = selectors.tag + allClasses;
      if (this.testUniqueElementWithinParent(element, selector)) {
        return selector;
      }
    }

    return selectors.nth;
  }

  getUniqueSelector(element) {
    let selectors = this.getAllSelectors(element);

    if (selectors.id != null) {
      return selectors.id;
    }

    if (this.testUniqueElementWithinParent(element, selectors.tag)) {
      return selectors.tag;
    }

    if (selectors.cls.length !== 0) {
      let allClasses = selectors.cls.join('');
      let selector = allClasses;
      if (this.testUniqueElementWithinParent(element, selector)) {
        return selector;
      }
      selector = selectors.tag + allClasses;
      if (this.testUniqueElementWithinParent(element, selector)) {
        return selector;
      }
    }

    return selectors.nth;
  }

  getSelectors(element) {
    let allSelectors = [];
    let parents = this.getAllParents(element);

    /**
     * Gets all unique selector for element parent nodes
     */
    for (let i = 0, len = parents.length; i < len; i++) {
      let item = parents[i];
      // let selectors = this.getAllSelectors(element);
      let selector = this.getUniqueSelector(item);
      if (selector) {
        allSelectors.push(selector);
      }
    }

    return allSelectors;
  }

  getQuerySelector(element) {
    let result = '';

    let allSelectors = this.getSelectors(element);

    /**
     * Return the shortest unique selector matched for given element
     */
    let selectors = [];
    for (let j = 0, len1 = allSelectors.length; j < len1; j++) {
      let item = allSelectors[j];
      selectors.unshift(item);
      result = selectors.join(' > ');
      /*if (testSelector(element, result)) {
        return result;
      }*/
    }
    return result;
  }

  getReducedSelector(element) {
    let result = '';
    const coveoCss = `Breadcrumb
CardActionBar
CardOverlay
CategoryFacet
DidYouMean
DynamicFacet
DynamicFacetRange
DynamicHierarchicalFacet
Excerpt
Facet
FacetRange
FacetSlider
FacetValueSuggestions
FieldSuggestions
FieldTable
FieldValue
HierarchicalFacet
Icon
ImageFieldValue
Matrix
MissingTerms
Omnibox
OmniboxResultList
Pager
PreferencesPanel
PromotedResultsBadge
QueryDuration
QuerySuggestPreview
QuerySummary
Querybox
Quickview
QuickviewDocument
Recommendation
ResultActionsMenu
ResultAttachments
ResultFolding
ResultLayoutSelector
ResultLink
ResultList
ResultRating
ResultTagging
ResultsFiltersPreferences
ResultsPerPage
ResultsPreferences
SearchAlerts
SearchAlertsMessage
SearchButton
SearchInterface
Searchbox
Settings
ShareQuery
SimpleFilter
Sort
SortDropdown
StarRating
Tab
TemplateLoader
Text
Thumbnail
TimespanFacet
coveo-facet-header
coveo-facet-value-caption

`.split('\n').map(c => `.Coveo${c}`);

    let parents = this.getAllParents(element);

    // build up path
    let path = [];
    while (parents.length) {
      let parent = parents.shift();
      let selectors = this.getAllSelectors(parent);
      console.log(parent, selectors);
      if (selectors.id) {
        path.unshift(selectors.id);
        if (this.testSelector(element, path.join(' '))) { return path.join(' '); }
      }
      else {
        // consider only Coveo classes first
        let cls = selectors.cls.filter(c => coveoCss.includes(c));
        if (cls.length) {
          path.unshift(parent.nodeName + cls.join(''));
          if (this.testSelector(element, path.join(' '))) { return path.join(' '); }
        }
        else {
          // try out all classes
          let cls = selectors.cls;
          if (cls.length) {
            path.unshift(parent.nodeName + cls.join(''));
            if (this.testSelector(element, path.join(' '))) { return path.join(' '); }
          }
          else {
            // try out these attributes:
            let attrs = 'data-id,data-field,data-value,data-original-value,aria-label,caption,href,title'.split(',');
            let attributsPath = [];
            // attrs.forEach(attr => {
            for (let i = 0; i < attrs.length; i++) {
              let attr = attrs[i];
              if (selectors.attributes[attr]) {
                let attributExpression = `[${attr}="${selectors.attributes[attr]}"]`;
                attributsPath.push(attributExpression)
                if (this.testSelector(element, `${parent.nodeName}${attributExpression} ` + path.join(' '))) { return `${parent.nodeName}${attributExpression} ` + path.join(' '); }
                break;
              }
            }
            // });

            if (attributsPath.length) {
              path.unshift(parent.nodeName + attributsPath.join(''));
              if (this.testSelector(element, path.join(' '))) { return path.join(' '); }
            }
          }
        }
      }

    }

    return path.join(' ');
  }

  toString() {
    let defaultSelector = this.getQuerySelector(this.element);
    let reducedSelector = this.getReducedSelector(this.element);

    console.log('D:', defaultSelector);
    console.log('R:', reducedSelector);

    return this.testSelector(this.element, reducedSelector) ? reducedSelector : defaultSelector;
  }

}

