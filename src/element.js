/*
 * ForrmElement wrapper class
 *
 * @param  {DOM node} a single form input element
 * @param  {instance of ForrmElement class} reference to parent forrm
 *
 */
function ForrmElement(element, parent) {
	this.DOMElement = element;
	this.parent = parent;
	this.init();
}

ForrmElement.prototype = {
	init : function () {
		var updateEvent,
			self = this,
			liveValidate = function (e) {
				if (!self.parent.liveValidating) {
					return;
				}
				UTILS.stopImmediatePropagation(e);
				self.parent.validationList[self.errorGroup].element.validate();
				if (!self.parent.options.listMessages) {
					self.parent.UI.updateInlineErrors(self);
				} else {
					self.parent.UI.listErrorMessages();
				}
			};

		if (this.DOMElement.getAttribute('required') !== null) {
			this.type = (this.DOMElement.tagName.toLowerCase() === 'input') && this.DOMElement.getAttribute('type') || (this.DOMElement.tagName.toLowerCase() === 'textarea') && 'text' || this.DOMElement.tagName.toLowerCase();

			//if customMessages is set, check if type exists in errorMessages object, otherwise set to default text field error
			if(!!(this.parent.options.customErrorMessage) && !(this.type in this.parent.options.errorMessages)) {
				this.type = 'text';
			}

			this.testCustomConstraint = (!!this.DOMElement.getAttribute('data-forrm-custom-constraint') && this.parent.options.customConstraint[this.DOMElement.getAttribute('data-forrm-custom-constraint')]) || false;

			this.errorGroup = this.DOMElement.getAttribute('id');
			this.validity = this.DOMElement.validity || this.defaultValidity();

			if ('autocomplete' in this.DOMElement && !this.parent.options.autocomplete) {
				this.DOMElement.setAttribute('autocomplete', 'off');
			}
			if (this.DOMElement.getAttribute('data-forrm-conditional') !== null) {
				this.addConditional();
			}
			UTILS.on(this.DOMElement, 'click keyup input paste change', liveValidate);
		}
	},
	defaultValidity : function () {
		return {
			valid: false,
			stepMismatch: false,
			customError: false,
			patternMismatch: false,
			rangeOverflow: false,
			rangeUnderflow: false,
			tooLong: false,
			typeMismatch: false,
			valueMissing: true
		};
	},
	getValidity : function () {
		return this.validity.valid;
	},
	setValidity : function () {
		var regExp,
			pattern = this.DOMElement.getAttribute('pattern') || this.parent.options.patterns[this.type],
			list;

		this.validationMessage = null;
		if (this.DOMElement.value.replace( /^\s+/g, '' ).replace( /\s+$/g, '' ) === "" || ((this.type === 'radio' || this.type === 'checkbox') && !this.DOMElement.checked)) {
			this.validity.valid = false;
			this.validity.valueMissing = true;
			this.validationMessage = this.parent.options.errorMessages[this.type].valueMissing;
		} else {
			this.validity.valueMissing = false;
			regExp = new RegExp(pattern, "");
			if (!regExp.test(this.DOMElement.value)) {
				this.validity.valid = false;
				if (this.type === 'text') {
					this.validity.patternMismatch = true;
				} else {
					this.validity.typeMismatch = true;
				}
				this.validationMessage = this.parent.options.errorMessages[this.type].patternMismatch;
			} else {
				this.validity.valid = true;
			}
		}
		return this;
	},
	setGroup : function (g) {
		this.group = g;
		this.errorGroup = g.name;
		this.type = (g.type === 'custom') && 'group' || this.type;
		return this;
	},
	addError : function (error, groupPartial) {
		this.DOMElement.parentNode.className = this.DOMElement.parentNode.className.split(' ' + this.parent.options.css.prefix + this.parent.options.css.successClass).join('');
		if (this.DOMElement.parentNode.className.indexOf(this.parent.options.css.prefix + this.parent.options.css.errorClass) === -1) {
			this.DOMElement.parentNode.className += ' ' + this.parent.options.css.prefix + this.parent.options.css.errorClass;
		}
		this.DOMElement.setAttribute('aria-invalid', 'true');
		if (!groupPartial) {
			this.parent.manageValidationList(this.errorGroup, error);
		}
		return this;
	},
	removeError : function (groupPartial) {
		this.DOMElement.parentNode.className = this.DOMElement.parentNode.className.split(' ' + this.parent.options.css.prefix + this.parent.options.css.errorClass).join('');
		this.DOMElement.setAttribute('aria-invalid', 'false');
		this.DOMElement.removeAttribute('aria-labelledby');
		if (!groupPartial) {
			this.parent.manageValidationList(this.errorGroup, null);
		}
		return this;
	},
	addSuccess : function (groupPartial) {
		this.removeError(groupPartial);
		if (this.DOMElement.parentNode.className.indexOf(this.parent.options.css.prefix + this.parent.options.css.successClass) === -1) {
			this.DOMElement.parentNode.className += ' ' + this.parent.options.css.prefix + this.parent.options.css.successClass;
		}
		return this;
	},
	test : function () {
		if (!this.parent.HTML5) {
			this.setValidity();
		}
        if (!!this.testCustomConstraint && (!!this.getValidity() || !!this.validity.customError)) {
			if (!!this.parent.HTML5) {
				this.DOMElement.setCustomValidity(this.testCustomConstraint.call(this.DOMElement));
			} else {
				if (this.testCustomConstraint.call(this.DOMElement) !== '') {
					this.validity.valid = false;
					this.validity.customError = this.testCustomConstraint.call(this.DOMElement);
					if (!this.parent.HTML5) {
						this.validationMessage = this.validity.customError;
					}
				}
			}
		}
		return (this.DOMElement.checkValidity instanceof Function && this.DOMElement.checkValidity()) || this.getValidity();
	},
	validate : function () {
		if (!this.test()) {
			this.addError(this.getError());
		} else {
			this.addSuccess();
		}
	},
	getError : function () {
        
		if (this.parent.options.customErrorMessage) {
            return (this.parent.options.errorMessages[this.type][this.validity.valueMissing && 'valueMissing' || this.validity.patternMismatch && 'patternMismatch' || this.validity.typeMismatch && 'typeMismatch'] || this.DOMElement.validationMessage);
		} else {
			if (this.DOMElement.getAttribute('data-forrm-custom-error') !== null) {
				return this.DOMElement.getAttribute('data-forrm-custom-error');
			} else {
				return this.DOMElement.validationMessage || this.validationMessage;
			}
		}
	},
	addConditional : function () {
		var self = this,
			dc = this.DOMElement.getAttribute('data-forrm-conditional'),
			openSesame = function (e) {
				UTILS.stopImmediatePropagation(e);
				if (!!self.conditionalConstraint.call(self.DOMElement)) {
					self.parent.UI.toggleEnabled(self.dependents, true);
				} else {
					self.parent.UI.toggleEnabled(self.dependents, null);
				}
			};
		self.dependents = document.querySelectorAll('.' + dc + ' input, ' + '.' + dc + ' textarea, ' + '.' + dc + 'select');
		self.conditionalConstraint = !!(self.parent.options.conditionalConstraint) && self.parent.options.conditionalConstraint[dc] || function () { return this.value !== ''; };
		UTILS.on(self.DOMElement, 'change', openSesame);
	}
};