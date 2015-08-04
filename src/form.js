/*
 * Forrm wrapper class
 *
 * @param {DOM node} a single form element
 * @param  {object} to extend defaults {}
 *
 */
function ForrmForm(element, options) {
    if (element === 'undefined') {
        throw new Error('No element has been supplied');
    }
    this.DOMElement = element;
    this.options = UTILS.extend({}, defaults, options);

    this.init();
}

ForrmForm.prototype = {
    HTML5 : false,
    init: function () {
        var self = this,
            tmpGroups = [];
        this.HTML5 = 'noValidate' in document.createElement('form');
        this.liveValidating = false;
        this.go = this.options.pass || this.DOMElement.submit;

        if (!this.HTML5 || this.options.augmentHTML5) {
            if ('autocomplete' in this.DOMElement && !this.options.autocomplete) {
                this.DOMElement.setAttribute('autocomplete', 'off');
            }

            this.fields = this.DOMElement.querySelectorAll('input, textarea, select');
            this.validatebleElements = {};
            this.unvalidatebleElements = {};
            this.groups = {};

                for (var i = 0, field; field = this.fields[i]; i++) {
                    if (field.getAttribute('type') !== 'submit' &&
                        field.getAttribute('type') !== 'reset' &&
                        field.getAttribute('type') !== 'button' &&
                        field.getAttribute('type') !== 'hidden' &&
                        (field.getAttribute('disabled') === null || field.getAttribute('disabled') === '')&&
                        (field.getAttribute('novalidate') === null || field.getAttribute('novalidate') === '')) {
                        if (field.getAttribute('required') !== null || field.getAttribute('required') !== '') {
                            this.validatebleElements[field.getAttribute('id')] = new ForrmElement(field, this);
                            if (field.getAttribute('type') === 'checkbox' || field.getAttribute('type') === 'radio' || field.getAttribute('data-forrm-group') !== null) {
                                tmpGroups.push(this.validatebleElements[field.getAttribute('id')]);
                            }

                            if ((this.fields[i + 1] === undefined || !(field.getAttribute('data-forrm-group')) && (field.getAttribute('name') !== this.fields[i + 1].getAttribute('name')) || i - 1 === this.fields.length) || field.getAttribute('data-forrm-group') !== this.fields[i + 1].getAttribute('data-forrm-group')) {
                                if (tmpGroups.length > 0) {
                                    var groupName = field.getAttribute('data-forrm-group') || field.getAttribute('name'),
                                        groupType = field.getAttribute('data-forrm-group') ? 'custom' : 'checked',
                                        groupMin = field.getAttribute('data-forrm-group-min') || 1,
                                        groupMax = field.getAttribute('data-forrm-group-max') || null;
                                    this.groups[groupName] = new ForrmGroup(groupName, tmpGroups, groupType, groupMin, groupMax);
                                    for (var j = 0; j < tmpGroups.length; j++) {

                                       tmpGroups[j].setGroup(this.groups[groupName]);
                                    }
                                    tmpGroups = [];
                                }
                            }
                        } else {
                            this.unvalidatebleElements[field.getAttribute('id')] = new ForrmElement(field, this);
                        }
                    }
                }
                this.makeValidationList();
                this.UI = new ForrmUI(this);

                if (this.DOMElement.querySelector('input[type=submit]') !== null) {
                        UTILS.on(this.DOMElement.querySelector('input[type=submit]'), 'click onkeypress', function (e) {
                            self.handleEvent.call(self, e);
                    }   );
                }
        }
        return this;
    },
    handleEvent : function (e) {
        if (!this.HTML5 || this.options.augmentHTML5) {
            this.liveValidating = true;
            if (e.type === 'click' || e.type === 'onkeypress') {
                UTILS.preventDefault(e);
                UTILS.stopImmediatePropagation(e);
                this.test.call(this);
            }
        }
    },
	makeValidationList : function () {
		this.validationList = {};

		for (var i in this.validatebleElements) {
			if (this.validatebleElements.hasOwnProperty(i)) {
				this.validationList[this.validatebleElements[i].errorGroup] = {
					'error': null,
					'element': (this.groups[this.validatebleElements[i].errorGroup] || this.validatebleElements[i]),
					'id': !!(this.groups[this.validatebleElements[i].errorGroup]) ?
							this.groups[this.validatebleElements[i].errorGroup].elements[0].DOMElement.getAttribute('id') :
					document.getElementById(this.validatebleElements[i].errorGroup).getAttribute('id')
				};
			}
		}
		return this.validationList;
	},
	manageValidationList : function (erId, er) {
		this.validationList[erId].error = er;
		return this;
	},
	countErrors : function () {
		var errors = 0;

		for (var i in this.validationList) {
			if (this.validationList.hasOwnProperty(i)) {
				if (this.validationList[i].error !== null) {
					errors++;
				}
			}
		}
		return errors;
	},
    test : function () {
        var el = null,
            er = null,
            vList,
            self = this;
        
        this.validationList = this.makeValidationList();

        for (var i in this.validationList) {
            this.validationList[i].element.validate();
            if (!!this.options.firstErrorOnly && !!this.validationList[i].error) {
                break;
            }
        }

        if (this.countErrors() > 0) {
            this.UI.write();
            if (!this.options.listMessages) {
                document.querySelector('.' + this.options.css.prefix + this.options.css.errorMessageClass).focus();
            } else {
                this.UI.errorListHolder.focus();
            }
            if (typeof this.options.fail === 'function') {
                this.options.fail.call();
            }
        } else {
            this.go.call(this.DOMElement);
        }
    }
};