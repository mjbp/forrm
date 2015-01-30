/*
 * ForrmStep class
 *
 * @param {String} DOM node containing fields for the step
 * @param {Forrm} array of nodes
 * @param {Number} Number in step sequence
 *
 */
function ForrmStep(el, parent, num) {
	this.stepNum = num;
	this.parent = parent;
	this.DOMElement = el;

	this.init();
}

ForrmStep.prototype = {
	init : function () {
		var tmpGroups = [],
			self = this;

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

		if (this.parent.numSteps > 1) {
			this.addButtons();
		}

		this.makeValidationList();
		this.parent.UI = new ForrmUI(this.parent);
		return this;
	},
	hide : function () {
		this.DOMElement.className = this.DOMElement.className + ' ' + this.parent.options.css.prefix + this.parent.options.css.hiddenClass;
	},
	show : function () {
		this.DOMElement.className = this.DOMElement.className.split(' ' + this.parent.options.css.prefix + this.parent.options.css.hiddenClass).join('');
	},
	addButtons : function () {
		var self = this,
			sbmt,
			prv,
			tpl = document.createElement('button');

		sbmt = tpl.cloneNode(true);

		if (this.stepNum + 1 !== this.parent.numSteps) {
			sbmt.className = this.parent.options.css.prefix + this.parent.options.css.buttonClass + ' ' +  this.parent.options.css.prefix + this.parent.options.css.buttonNextClass;
			sbmt.innerHTML = 'Submit';
			UTILS.on(sbmt, 'click onkeypress', function (e) {
					self.parent.handleEvent.call(self.parent, e);
				});
			this.DOMElement.appendChild(sbmt);
		}

		if (this.stepNum !== 0) {
			prv = tpl.cloneNode(true);
			prv.className = this.parent.options.css.prefix + this.parent.options.css.buttonClass + ' ' + this.parent.options.css.prefix + this.parent.options.css.buttonPreviousClass;
			prv.innerHTML = 'Previous';
			UTILS.on(prv, 'click onkeypress', function (e) {
				self.parent.changeStep.call(self.parent, false, e);
			});
			this.DOMElement.appendChild(prv);
		}

		return this;
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
	}
};