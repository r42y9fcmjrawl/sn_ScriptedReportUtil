var ScriptedReportUtil = Class.create();
ScriptedReportUtil.prototype = {
    initialize: function() {
        this.table = '';
        this.encodedQuery = '';
        this.fields = [];
        this.headings = [];
		this._strHeadings = '';
		this.limit = 0;
        this.strCsv = '';
        this._nullValue = '"",';
        this._newLine = '\r\n';
		this.total = 0;
		this.aggregate = '';
		this.thStyle = ' style="padding: 5px; border-bottom: 1px solid #d2d2d2; font-weight: bold;"';
		this.tdStyle = ' style="padding: 5px; border-bottom: 1px solid #d2d2d2;"';
		this.evenTrStyle = ' style="background-color: #e2e2e2;"';
    },

    setTable: function(table) {
        this.table = table;
    },

    setEncodedQuery: function(encodedQuery) {
        this.encodedQuery = encodedQuery;
    },

    setFields: function(fields) {
        this.fields = fields;
    },

    setHeadings: function(headings) {
        this.headings = headings;
        this.headings.forEach(this._writeHeading.bind(this));
        this.strCsv = (this.strCsv != '') ? (this._strHeadings + this._newLine + this.strCsv) : this._strHeadings;
    },

	setLimit: function(limit) {
		this.limit = limit;
	},

    execute: function() {
        this._getData();
        return this.strCsv;
    },

	toCsv: function() {
		return this.strCsv;
	},

	toHtml: function() {
		this.strHtml = '';
		this.strHtml += '<table style="align:center; border-collapse: collapse;">';
		this.strCsv.split(this._newLine).forEach(this._lineToHtml, this);
		this.strHtml += '</table>';
		return this.strHtml;
	},

	_lineToHtml: function(line, idx, arr) {
		this._row = idx;
		this.strHtml += (this._row % 2 === 1) ? '<tr>' : '<tr' + this.evenTrStyle + '>';
		this.strHtml += (this._row === 0) ? '<th' + this.thStyle + '>' : '<td' + this.tdStyle + '>';
		this.strHtml += line.slice(0, -1).split('","').join('</td><td' + this.tdStyle + '>').replace('"', '');
		this.strHtml += (this._row === 0) ? '</th>' : '</td>';
		this.strHtml += '</tr>';
	},

	toJson: function() {
		this.json = [];
		this.strCsv.split(this._newLine).splice(1).forEach(this._lineToJson, this);
		return JSON.stringify(this.json);
	},

	_lineToJson: function(line, idx, arr) {
		var obj = {};
		var fields = line.split('","');
		for (var i = 0; i < this.headings.length; i++) {
			obj[this.headings[i]] = fields[i].replace('"', '');
		}
		this.json.push(obj);
	},

	emailReport: function(recipients, subject, body, attachments) {
		var mailGr = new GlideRecord('sys_email');
		mailGr.initialize();
		mailGr.type = 'send-ready';
		mailGr.recipients = recipients.toString();
		mailGr.subject = subject;
		mailGr.body = body;
		mailGr.insert();

		for (var i = 0; i < attachments.length; i++) {
			var attachment = new GlideSysAttachment();
			attachment.write(mailGr, attachments[i].name.toString(), attachments[i].type.toString(), attachments[i].data.toString());
		}
	},

    _getData: function() {
		var i = 0;
        var r = new GlideRecordSecure(this.table);
        r.addEncodedQuery(this.encodedQuery);
        r.query();
        while (r.next()) {
			if (this.limit > 0 && i == this.limit) return;
            this.gr = r;
            this.strCsv += this._newLine;
            this.fields.forEach(this._writeFieldData.bind(this));
            this.gr = null;
			i++;
        }
    },

    _writeFieldData: function(field) {
		if (typeof field === 'function') {
			this.strCsv += this._toCsv(field.call(this));
		} else if (field == '__LINK__') {
			this.strCsv += this._toCsv(this._getLink());
		} else {
            var depth = ((field.match(/\./g) || []).length);
            try {
                if (depth > 0) {
					this.strCsv += this._toCsv(this._getRef(this.gr, field).getDisplayValue());
                } else {
                    this.strCsv += this._toCsv(this.gr[field]);
                }
            } catch (e) {
                this.strCsv += this._nullValue;
            }
        }
    },

    _toCsv: function() {
        var csv = '';
        var self = this;
        var args = Array.prototype.slice.call(arguments);
        args.forEach(function(arg) {
            if (typeof arg === 'undefined') {
                csv += self._nullValue;
            } else {
                csv += ('"' + arg.toString() + '",');
            }
        });
        return csv;
    },

    _writeHeading: function(heading) {
        this._strHeadings += this._toCsv(heading);
    },

	_getLink: function(_gr) {
		_gr = _gr || this.gr;
		var base_uri = 'https://' + gs.getProperty('instance_name') + '.service-now.com/';
		return (base_uri + _gr.getLink(true));
	},

    _getRef: function(obj, props) {
        if (!props) return obj;
        var prop;
        props = props.split('.');
        for (var i = 0; i < (props.length - 1); i++) {
            prop = props[i];
            var candidate = obj[prop];
            if (candidate !== undefined) {
                obj = candidate;
            } else {
                break;
            }
        }
        return obj[props[i]];
    },

    type: 'ScriptedReportUtil'
};
