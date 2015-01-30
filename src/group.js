/*
 * ForrmGroup wrapper class
 *
 * @param {String} Name of the group from child elements name attribute or forrm-group data attribute
 * @param {Array} Array of ForrmElements in the group
 * @param {String} Custom group or checkbox/radio group
 * @param {Number} Minimum number of valid elements to satisfy constraint
 * @param {Number} Maximum number of valid elements to satisfy constraint
 *
 */
function ForrmGroup(name, els, type, min, max) {
	this.name = name;
	this.elements = els;
	this.type = type;
	this.min = +min || 1;
	this.max = +max || null;
	this.parent = els[0].parent;

	this.init(els);
}

ForrmGroup.prototype = {
	init : function () {
		this.valid = true;
	},
	addError : function (error) {
		for (var i = 0; i < this.elements.length; i++) {
			this.elements[i].addError(error);
		}
		return this;
	},
	removeError : function () {
		for (var i = 0; i < this.elements.length; i++) {
			this.elements[i].removeError();
		}
	},
	addSuccess : function () {
		this.removeError();
		for (var i = 0; i < this.elements.length; i++) {
			this.elements[i].addSuccess();
		}
		return this;
	},
	validate : function () {
		var error = null;
		this.numValid = 0;
		for (var i = 0; i < this.elements.length; i++) {
			if (!this.elements[i].test()) {
				this.elements[i].addError(null, true);
				this.valid = false;
				error = this.elements[i].getError();
			} else {
				this.numValid++;
			}
		}
		if ((this.numValid >= +this.min && this.max === null) || (this.numValid >= +this.min && !!this.max && this.numValid <= +this.max)) {
			this.valid = true;
			this.addSuccess();
			return;
		} else {

			if (!!error) {
				this.addError(error);
			}
		}
	},
	getName : function() {
		return this.name;
	}
};