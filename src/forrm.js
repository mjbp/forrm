var Forrm = {
	init : function (el, options) {
		if (!('querySelectorAll' in document)) {
			throw new Error('Sorry, your browser is not supported.');
		} else {
			var elements = document.querySelectorAll(el),
				forrms = [],
				i = null,
				l = elements.length;

			for (i = 0; i < l; i += 1) {
				if (!elements[i].hasAttribute('novalidate')) {
					forrms[i] = new ForrmForm(elements[i], options);
				}
			}
			return forrms;
		}
	}
};