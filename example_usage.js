// variable names & field names will have to change
var table = 'sc_req_item';
var encodedQuery = 'sys_created_onONLast 12 months@javascript:gs.beginningOfLast12Months()@javascript:gs.endOfLast12Months()^cat_item=36993a350f92b1001ee3f08ce1050ef1';
var headings = ['RITM of Return Request', 'Requested For', 'Asset Number', 'Model', 'Replacement Eligibility', 'Replacement Status', 'Managed By', 'State', 'Substate', 'Location', 'Updated', 'Updated By'];
var fields = ['number', 'u_requested_for.name', 'variables.barcodeReference.asset_tag', 'variables.barcodeReference.model.name', 'variables.barcodeReference.u_replacement_eligibility', 'variables.barcodeReference.u_replacement_status', 'variables.barcodeReference.managed_by.name', 'variables.barcodeReference.install_status', 'variables.barcodeReference.substatus', 'variables.barcodeReference.location.name', 'variables.barcodeReference.sys_updated_on', 'variables.barcodeReference.sys_updated_by'];

var sru = new ScriptedReportUtil();
sru.setTable(table);
sru.setEncodedQuery(encodedQuery);
sru.setFields(fields);
sru.setHeadings(headings);
sru.execute();
gs.print('CSV = ' + sru.toCsv());
gs.print('HTML = ' + sru.toHtml());
gs.print('JSON = ' + sru.toJson());
