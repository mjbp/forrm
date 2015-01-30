/*
 * Forrm wrapper class
 *
 * @param {DOM node} a single form element
 * @param  {object} to extend defaults {}
 *
 */
function Forrm(element, options) {
    if (element === 'undefined') {
        throw new Error('No element has been supplied');
    }
    this.DOMElement = element;
    this.options = UTILS.extend({}, defaults, options);

    this.init();
}

Forrm.prototype = {
    HTML5 : false,
    build : function () {
        var steps, stepElements;

        stepElements = this.DOMElement.querySelectorAll('[data-forrm-step]');
        this.numSteps = stepElements.length || 1;
        this.steps = [];

        stepElements = stepElements.length > 0 && stepElements || [this.DOMElement];
        this.currentStep = 0;
        if (this.numSteps > 1) {
            this.DOMElement.className += ' ' + this.options.css.prefix + this.options.css.stepPrefix + '1';
        }
        for (var i = 0; i < stepElements.length; ++i) {
            this.steps.push(new ForrmStep(stepElements[i], this, i));
            if (i !== 0) {
                this.steps[i].hide();
            }
        }
        return this;
    },
    init: function () {
        var self = this;
        this.HTML5 = 'noValidate' in document.createElement('form');
        this.liveValidating = false;
        this.go = this.options.pass || this.DOMElement.submit;

        if (!this.HTML5 || this.options.augmentHTML5) {
            if ('autocomplete' in this.DOMElement && !this.options.autocomplete) {
                this.DOMElement.setAttribute('autocomplete', 'off');
            }

            this.build();

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
    changeStep : function (forward, e) {
        var next = !!forward && this.currentStep + 1 || this.currentStep - 1;

        if(!!e) {UTILS.preventDefault(e);}

        this.steps[this.currentStep].hide();
        this.DOMElement.className = this.DOMElement.className.split(' ' +
                                                                    this.options.css.prefix +
                                                                    this.options.css.stepPrefix +
                                                                    (+this.currentStep + 1)).join(' ' +
                                                                    this.options.css.prefix +
                                                                    this.options.css.stepPrefix + (+next + 1));
        this.steps[next].show();
        this.currentStep = next;

        return this;
    },
    test : function () {
        var el = null,
            er = null,
            vList,
            self = this;
        this.validationList = this.steps[this.currentStep].makeValidationList();

        for (var i in this.validationList) {
            this.validationList[i].element.validate();
            if (!!this.options.firstErrorOnly && !!this.validationList[i].error) {
                break;
            }
        }

        if (this.steps[this.currentStep].countErrors() > 0) {
            self.UI.write();
            if (!this.options.listMessages) {
                document.querySelector('.' + this.options.css.prefix + this.options.css.errorMessageClass).focus();
            } else {
                this.UI.errorListHolder.focus();
            }
            if (typeof this.options.fail === 'function') {
                this.options.fail.call();
            }
        } else {
            if (this.currentStep === this.numSteps - 1) {
                this.go.call(this.DOMElement);
            } else {
                this.changeStep(true);
            }
        }
    }
};

return {
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
                    forrms[i] = new Forrm(elements[i], options);
                }
            }
            return forrms;
        }
    }
};