/*jslint browser:true,nomen:true*/
/*global define, console*/
/*!
 * @name        Form, lightweight vanilla js HTML5 form validation module
 * @version     Aug 14
 * @author      mjbp
 * Licensed under the MIT license
 */

/*
 * ROADMAP:
 * field types - range?
 * max, maxlength, min, minlength
 * conditionals - group one required/min number of group required
 * multi-step (hidden/reveal) - validate each step independently to reveal the next, display step number/total steps
 * placeholder for hints??
 * add UTILS to polyfill forEach?, addEventListener
 *
 *
 * not supported input types: month, image, time, week, date, datetime, datetime-local
 *
 */
(function (name, context, definition) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(definition);
    } else {
        context[name] = definition();
    }
}('Form', this, function (name, context) {
    'use strict';
    
    name = name || 'Form';
    context = context || this;
    
    var defaults = {
            augmentHTML5 : true,
            customErrorMessage : true,
            displayMessages : true,
            successClass : 'form-success',
            errorClass : 'form-error',
            listMessages : false,
            listTitle : 'We couldn\'t submit the form, please check your answers:',
            errorMessagesClass : 'form-error-message',
            errorMessageElement : 'p',
            errorMessages : {
                'text': {
                    'valueMissing' : 'This field is required',
                    'patternMismatch' : 'Match the requested format'
                },
                'url': {
                    'valueMissing' : 'This field is required',
                    'patternMismatch' : 'Enter a valid URL',
                    'typeMismatch' : 'Enter a valid URL'
                },
                'search': {
                    'valueMissing' : 'This field is required',
                    'patternMismatch' : 'Match the requested format'
                },
                'email': {
                    'valueMissing' : 'This field is required',
                    'patternMismatch' : 'Enter a valid email address',
                    'typeMismatch' : 'Enter a valid email address'
                },
                'tel': {
                    'valueMissing' : 'This field is required',
                    'patternMismatch' : 'Enter a valid phone number'
                },
                'checkbox': {
                    'valueMissing' : 'Check at least one of the required boxes'
                },
                'radio': {
                    'valueMissing' : 'Select one of the required radio options'
                },
                'number': {
                    'valueMissing' : 'This field is required',
                    'patternMismatch' : 'Enter a valid number',
                    'typeMismatch' : 'Enter a valid number'
                },
                'file': {
                    'valueMissing' : 'Choose a file'
                }
            },
            patterns : {
                email : "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
                //email : "[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\\.[a-z0-9-]+)+",
                tel : "[\\w\\d\\s\\(\\)\\.+-]+"
            },
            fail : function () {},
            pass : false
        };
    
    function extend(b, a) {
        var prop = null;
        for (prop in a) {
            if (a.hasOwnProperty(prop)) {
                if (a[prop] && a[prop].constructor && a[prop].constructor === Object) {
                    b[prop] = b[prop] || {};
                    extend(b[prop], a[prop]);
                } else {
                    b[prop] = a[prop];
                }
            }
        }
        return b;
    }
    
    /*
     * Element wrapper class
     *
     * @param  {DOM node} a single form input element
     * @param  {instance of Form class} reference to parent form element
     *
     */
    function Element(element, parent) {
        this.DOMElement = element;
        this.parent = parent;
        this.init();
    }

    Element.prototype = {
        init : function () {
            var updateEvent,
                self = this,
                liveCheck = function () {
                    if (!self.parent.liveValidating) {
                        return;
                    }
                    self.parent.validationList[self.errorGroup].element.validate();
                    if (!self.parent.options.listMessages) {
                        self.parent.UI.updateInlineErrors(self);
                    } else {
                        self.parent.UI.listErrorMessages(   );
                    }
                };
            this.type = this.DOMElement.getAttribute('type') || 'text';
            this.errorGroup = this.DOMElement.getAttribute('id');
            this.validityState = this.DOMElement.validityState || this.defaultValidityState();
            //this.checkValidity = this.DOMElement.checkValidity || this.getValidityState;

            //this needs to expand for different input types - file, select, etc
            updateEvent = (this.type === 'checkbox' || this.type === 'radio' || this.type === 'file') && 'change' || 'input';

            this.DOMElement.addEventListener(updateEvent, liveCheck, false);
        },
        defaultValidityState : function () {
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
        getValidityState : function () {
            return this.validityState.valid;
        },
        setValidityState : function () {
            var regExp,
                pattern = this.DOMElement.getAttribute('pattern') || this.parent.options.patterns[this.type];

            this.validationMessage = null;
            if (this.DOMElement.value.replace( /^\s+/g, '' ).replace( /\s+$/g, '' ) === "" || ((this.type === 'radio' || this.type === 'checkbox') && !this.DOMElement.checked)) {
                this.validityState.valid = false;
                this.validityState.valueMissing = true;
                this.validationMessage = this.parent.options.errorMessages[this.type].valueMissing;
            } else {
                //check min, max and

                this.validityState.valueMissing = false;
                regExp = new RegExp(pattern, "");
                if (!regExp.test(this.DOMElement.value)) {
                    this.validityState.valid = false;
                    if (this.type === 'text') {
                        this.validityState.patternMismatch = true;
                    } else {
                        this.validityState.typeMismatch = true;
                    }
                    this.validationMessage = this.parent.options.errorMessages[this.type].patternMismatch;
                } else {
                    this.validityState.valid = true;
                }
            }

            return this;
            //To do: set other validity states and refactor

        },
        setGroup : function (g) {
            this.group = g;
            this.errorGroup = g.name;
            this.validate = g.validate;
            return this;
        },
        addError : function (error) {
            if (this.DOMElement.className.indexOf(this.parent.options.errorClass) === -1) {
                this.DOMElement.className += ' ' + this.parent.options.errorClass;
            }
            this.DOMElement.setAttribute('aria-invalid', 'true');
            this.parent.manageValidationList(this.errorGroup, error);
            return this;
        },
        removeError : function () {
            this.DOMElement.className = this.DOMElement.className.split(' ' + this.parent.options.errorClass).join('');
            this.DOMElement.setAttribute('aria-invalid', 'false');
            this.DOMElement.removeAttribute('aria-labelledby');
            this.parent.manageValidationList(this.errorGroup, null);
            return this;
        },
        addSuccess : function () {
            this.removeError();
            if (this.DOMElement.className.indexOf(this.parent.options.successClass) === -1) {
                this.DOMElement.className += ' ' + this.parent.options.successClass;
            }
            return this;
        },
        validate : function () {
            var v;
            if (!this.parent.HTML5) {
                this.setValidityState();
            }
            v = this.DOMElement.checkValidity ? this.DOMElement.checkValidity() : this.getValidityState();
            if (!v) {
                this.addError(this.getError());
            } else {
                this.addSuccess();
            }

        },
        getError : function () {
            if (this.parent.options.customErrorMessage) {
                return (this.parent.options.errorMessages[this.type][this.validityState.valueMissing && 'valueMissing' || this.validityState.patternMismatch && 'patternMismatch' || this.validityState.typeMismatch && 'typeMismatch']);
            } else {
                return this.DOMElement.validationMessage || this.validationMessage;
            }
        }
    };
    

    /*
     * Group wrapper class
     *
     * @param {String} name
     * @param {Array} array of nodes
     *
     */
    function Group(name, els) {
        if (name === 'undefined') {
            throw new Error('Nae name');
        }
        this.name = name;
        this.elements = els;
        this.parent = els[0].parent;

        this.init(els);
    }
    
    Group.prototype = {
        init : function () {
            this.valid = true;
        },
        addError : function (error) {
            for (var i = 0; i < this.elements.length; i++) {
                if (this.elements[i].DOMElement.parentElement.className.indexOf(' ' + this.parent.options.errorClass) === -1) {
                    this.elements[i].DOMElement.parentElement.className += ' ' + this.parent.options.errorClass;
                }
                this.elements[i].DOMElement.setAttribute('aria-invalid', 'true');
            }
            this.parent.manageValidationList(this.name, error);
            return this;
        },
        removeError : function () {
            for (var i = 0; i < this.elements.length; i++) {
                this.elements[i].DOMElement.setAttribute('aria-invalid', 'false');
                this.elements[i].DOMElement.removeAttribute('aria-labelledby');
                this.elements[i].DOMElement.parentNode.className = this.elements[i].DOMElement.parentNode.className.split(' ' + this.parent.options.errorClass).join('');
            }
            this.parent.manageValidationList(this.name, null);
        },
        validate : function () {
            var v,
                error = null;
            for (var i = 0; i < this.elements.length; i++) {
                if (!this.parent.HTML5) {
                    this.elements[i].setValidityState();
                }
                v = this.elements[i].DOMElement.checkValidity ? this.elements[i].DOMElement.checkValidity() : this.elements[i].getValidityState();

                if (!v) {
                    if (!!this.valid) {
                        this.valid = false;
                        error = this.elements[i].getError();
                    }
                } else {
                    //it's true but is a grouped input with a collective state
                    this.valid = true;
                    this.removeError();
                    return;
                }
            }
            if (!!error) {
                this.addError(error);
            }
        },
        getName : function() {
            return this.name;
        }

    };


     /*
     * UI wrapper class
     *
     * @param   {Form} Parent form
     * @roadMap Use templating to bypass DOM manipulation horrorshow
     *
     */
    function UI(form) {
        if (form === 'undefined') {
            throw new Error('Nae form');
        }
        this.parent = form;
        this.init();
    }

    UI.prototype = {
        init : function () {
            if (!!this.parent.options.displayMessages) {
                this.write = !!this.parent.options.listMessages ? this.listErrorMessages : this.displayInlineErrorMessages;
            } else {
                this.write = function () {return this;};
            }
        },
        addInlineError : function (erId) {
            var el,
                msg = document.createElement(this.parent.options.errorMessageElement);
            msg.textContent = this.parent.validationList[erId].error;
            msg.className = this.parent.options.errorMessagesClass;
            msg.setAttribute('role', 'alert');
            msg.setAttribute('id', erId + '-error');
            el = document.getElementById(erId) || document.getElementsByName(erId)[0];
            el.setAttribute('aria-labelledBy', erId + '-error');
            el.parentNode.insertBefore(msg, el.nextSibling);
            
            return;
        },
        clearInlineErrors : function () {
            var errorMessages = this.parent.DOMElement.querySelectorAll('.form-error-message');

            if (errorMessages.length === 0) {
                return;
            }
            for(var i = 0; i < errorMessages.length; i++) {
                errorMessages[i].parentNode.removeChild(errorMessages[i]);
            }

            return this;
        },
        updateInlineErrors : function (el) {
            var errorField = document.getElementById(el.DOMElement.getAttribute('id') + '-error') || document.getElementById(el.DOMElement.getAttribute('name') + '-error');

            if (!el.parent.validationList[el.errorGroup].error) {
                if (!errorField) {
                    return this;
                } else {
                    errorField.parentNode.removeChild(errorField);
                    return this;
                }
            } else {
                if (!errorField) {
                    this.addInlineError(el.errorGroup);
                    return this;
                } else {
                    errorField.textContent = el.parent.validationList[el.errorGroup].error;
                    return this;
                }
            }
        },
        displayInlineErrorMessages : function () {
            this.clearInlineErrors();

            for (var er in this.parent.validationList) {
                if (this.parent.validationList.hasOwnProperty(er)) {
                    if (er !== 'countErrors' && !!this.parent.validationList[er].error) {
                        this.addInlineError(er);
                    }
                }
            }
        },
        listErrorMessages : function () {
            var i = 0,
                oldListHolder = this.parent.DOMElement.querySelector('.form-error-list'),
                listHolder = document.createElement('dl'),
                listTitle = document.createElement('dt'),
                listDescription = document.createElement('dd'),
                list = document.createElement('ol'),
                listItem = document.createElement('li'),
                link = document.createElement('a'),
                item = null,
                itemLink = null;

            this.errorListHolder = listHolder;

            if (oldListHolder) {
                oldListHolder.parentElement.removeChild(oldListHolder);
            }
            if (this.parent.validationList.countErrors === 0) {
                return this;
            }
            listTitle.innerHTML = this.parent.options.listTitle;
            listHolder.appendChild(listTitle);
            listHolder.appendChild(listDescription);
            listHolder.className = 'form-error-list';
            listHolder.setAttribute('role', 'alert');
            listDescription.appendChild(list);
            
            for (var er in this.parent.validationList) {
                if (this.parent.validationList.hasOwnProperty(er)) {
                    if (er !== 'countErrors' && !!this.parent.validationList[er].error) {
                        item = listItem.cloneNode(true);
                        itemLink = link.cloneNode(true);
                        itemLink.setAttribute('href', '#' + this.parent.validationList[er].id);
                        itemLink.setAttribute('id', er + '-error');
                        itemLink.innerHTML = this.parent.validationList[er].error;
                        item.appendChild(itemLink);
                        list.appendChild(item);
                    }
                }
            }

            this.parent.DOMElement.insertBefore(listHolder, this.parent.DOMElement.firstChild);
        }
    };


    /*
     * Form wrapper class
     *
     * @param {DOM node} a single form element
     * @param  {object} to extend defaults{}
     *
     */
    function Form(element, options) {
        if (element === 'undefined') {
            throw new Error('Nae element');
        }
        this.DOMElement = element;
        this.options = extend(defaults, options);

        this.init();
    }

    Form.prototype = {
        HTML5 : false,
        groups : {},
        init: function () {
            var tmpGroups = [],
                self = this;
            this.HTML5 = 'noValidate' in document.createElement('form');
            this.liveValidating = false;

            if (!this.HTML5 || this.options.augmentHTML5) {
                this.fields = this.DOMElement.querySelectorAll('input, textarea, select');
                this.validatebleElements = {};
                this.DOMElement.querySelector('input[type=submit]').addEventListener('click', this, false);
                this.DOMElement.querySelector('input[type=submit]').addEventListener('onkeypress', this, false);

                for (var i = 0; i < this.fields.length; i += 1) {
                    if (this.fields[i].getAttribute('type') !== 'submit' && this.fields[i].getAttribute('type') !== 'reset' && this.fields[i].getAttribute('type') !== 'button' && this.fields[i].getAttribute('required') !== null && this.fields[i].getAttribute('type') !== 'hidden' && this.fields[i].getAttribute('novalidate') === null) {
                        this.validatebleElements[this.fields[i].getAttribute('id')] = new Element(this.fields[i], this);
                        /* This part needs re-thinkin to deal with data-grouping */
                        if (this.fields[i].getAttribute('type') === 'checkbox' || this.fields[i].getAttribute('type') === 'radio') {
                            tmpGroups.push(this.validatebleElements[this.fields[i].getAttribute('id')]);
                        }
                        if ((this.fields[i].getAttribute('name') !== this.fields[i + 1].getAttribute('name')) || i - 1 === this.fields.length) {
                            if (tmpGroups.length > 0) {
                                this.groups[this.fields[i].getAttribute('name')] = new Group(this.fields[i].getAttribute('name'), tmpGroups);
                                for (var j = 0; j < tmpGroups.length; j++) {
                                   tmpGroups[j].setGroup(this.groups[this.fields[i].getAttribute('name')]);
                                }
                                tmpGroups = [];
                            }
                        }
                    }
                }
                this.UI = new UI(this);
                this.makeValidationList();
            }
        },
        handleEvent : function (e) {
            if (!this.HTML5 || this.options.augmentHTML5) {
                this.liveValidating = true;
                if (e.type === 'click' || e.type === 'onkeypress') {
                    e.preventDefault();
                    this.test();
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
                        'id': this.groups[this.validatebleElements[i].errorGroup] ? document.getElementsByName(this.validatebleElements[i].errorGroup)[0].getAttribute('id') : document.getElementById(this.validatebleElements[i].errorGroup).getAttribute('id')
                    };
                }
            }
            this.validationList.countErrors = 0;
            return this;
        },
        manageValidationList : function (erId, er) {
            if (!!er) {
                if (this.validationList[erId].error === null) {
                    this.validationList.countErrors += 1;
                }
            } else {
                if (this.validationList.countErrors > 0) {
                    this.validationList.countErrors -= 1;
                }
            }
            this.validationList[erId].error = er;
            return this;
        },
        test : function () {
            var el = null,
                er = null,
                go = null,
                l = this.validatebleElements.length,
                self = this;

            this.makeValidationList();
            
            for (var i in this.validationList) {
                if (this.validationList.hasOwnProperty(i) && i !== 'countErrors') {
                    this.validationList[i].element.validate();
                }
            }
            
            if (this.validationList.countErrors > 0) {
                self.UI.write();
                if (!this.options.listMessages) {
                    window.scrollTo(0, this.DOMElement.offsetTop);
                    document.getElementsByClassName(this.options.errorMessagesClass)[0].focus();
                } else {
                    window.scrollTo(0, this.UI.errorListHolder.offsetTop);
                    this.UI.errorListHolder.focus();
                }
                this.options.fail.call();
            } else {
                go = this.options.pass ? this.options.pass.call() : this.DOMElement.submit();
            }
        }
    };
    
    
    return {
        init : function (el, options) {
            var elements = document.querySelectorAll(el),
                forms = [],
                i = null,
                l = elements.length;
            
            for (i = 0; i < l; i += 1) {
                if (!elements[i].hasAttribute('novalidate')) {
                    forms[i] = new Form(elements[i], options);
                }
            }
        }
    };
}));
    

