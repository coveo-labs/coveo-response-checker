# Coveo Request Checker

The coveo-request-checker extension allows you validate the requests you are sending to your Coveo organization.

## Purpose
The purpose of the Coveo Request Checker is to give developers/clients/partners the ability to quickly check and validate the Coveo Requests.


A Coveo Request could be:
* Search Calls
* Analytic (legacy) Calls (including beacon events)
* Analytic E Commerce Calls

Each request must match minimal requirements. 

The Chrome extension will show you exactly which fields are properly set, and which events you are sending. 

Using the extension you can quickly validate if your implementation meets the criteria.

## Usage
You can use the extension in 2 ways: using the normal UI, or by using the DevTools UI.

The normal UI will give you an aggregate of all the events captured by the extension.

The DevTools UI will have a tab called 'Coveo Request Checker', that will give you details for each event captured.

Downloading the report will also download the detailed requests.

See also the **HELP** inside the Popup window of the Extension.

## Dependencies

Google Chrome or Chromium

## Versions
1.39 Remove Nightwatch (for now) + bug fix for click
1.38 Fix XSS
1.37 Fix to only watch xmlrequests
1.36 Added /collect to recognize
1.35 Added NumberOfResults check on /searches
1.34 Added Request Id
1.34 Fixed issues