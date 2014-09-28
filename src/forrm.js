/*jslint browser:true,nomen:true*/
/*global define, console*/
/*!
 * @name        Forrm, lightweight vanilla js HTML5 form validation based on constraintValidation API
 * @version     Sept 14
 * @author      mjbp
 * Licensed under the MIT license
 */

/*
 * ROADMAP:
 * minlength attribute polyfill
 * conditionals
 *  - one required for custom group √
 *    - min number of group required
 *  - reveal named field(s) once valid
 *
 * multi-step (hidden/reveal)
 *  - validate each step independently to reveal the next, display step number/total steps
 *
 *
 *
 */
(function (name, context, definition) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(definition);
    } else {
        context[name] = definition();
    }
}('Forrm', this, function (name, context) {
    'use strict';

    name = name || 'Forrm';
    context = context || this;

    var defaults = {
            augmentHTML5 : true,
            autocomplete : true,
            customErrorMessage : false,
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
                'select': {
                    'valueMissing' : 'Choose an option'
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
                },
                'group': {
                    'valueMissing' : 'One of these fields is required',
                    'patternMismatch' : 'Match the requested format one on of these fields'
                }
            },
            patterns : {
                //very simple checks, let most through
                //not even attempting to validate urls by regex
                email : "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
                //email : "[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\\.[a-z0-9-]+)+",
                tel : '[\\w\\d\\s\\(\\)\\.+-]+',
                number : '[\\d]',
                color: '/^#?([a-f0-9]{6}|[a-f0-9]{3})$/'
            },
            fail : function () {},
            pass : false
        },
        toolkit = {
            extend: function (){
                for(var i = 1; i < arguments.length; i++) {
                    for(var key in arguments[i]) {
                        if(arguments[i].hasOwnProperty(key)) {
                            arguments[0][key] = arguments[i][key];
                        }
                    }
                }
                return arguments[0];
            },
            forEach: function (a, fn, scope) {
                var i, l = a.length;
                if ([].forEach) {
                    return a.forEach(fn);
                }
                for (i = 0; i < l; i += 1) {
                    if (a.hasOwnProperty(i)) {
                        fn.call(scope, a[i], i, a);
                    }
                }
            },
            on : function (element, events, fn) {
                var evts = events.split(' ');

                for (var i = 0; i < evts.length; i++) {
                    if (element.addEventListener) {
                        element.addEventListener(evts[i], fn, false);
                    } else {
                        element.attachEvent('on' + evts[i], fn);
                    }
                }
            },
            preventDefault : function (e) {
                if (e.preventDefault) {
                    e.preventDefault();
                } else {
                    e.returnValue = false;
                }
                return;
            }
        };

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
                liveValidate = function () {
                    if (!self.parent.liveValidating) {
                        return;
                    }
                    //TO DO
                    //check if value has changed against saved data attibute
                    //only validate if value has changed
                    //save to data attribute

                    self.parent.validationList[self.errorGroup].element.validate();
                    if (!self.parent.options.listMessages) {
                        self.parent.UI.updateInlineErrors(self);
                    } else {
                        self.parent.UI.listErrorMessages();
                    }
                };
            this.type = (this.DOMElement.tagName.toLowerCase() === 'input') && this.DOMElement.getAttribute('type') || (this.DOMElement.tagName.toLowerCase() === 'textarea') && 'text' || this.DOMElement.tagName.toLowerCase();

            //if customMessages is set, check if type exists in errorMessages object
            if(!!(this.parent.options.customErrorMessage) && !(this.type in this.parent.options.errorMessages)) {
                this.type = 'text';
            }

            this.validationTrigger = (this.type === 'checkbox' || this.type === 'radio' || this.type === 'select') && 'click' || this.type === 'file' && 'change' || 'keyup';
            this.errorGroup = this.DOMElement.getAttribute('id');
            this.validity = this.DOMElement.validity || this.defaultValidity();

            if ('autocomplete' in this.DOMElement && !this.parent.options.autocomplete) {
                this.DOMElement.setAttribute('autocomplete', 'off');
            }
            toolkit.on(this.DOMElement, 'propertychange keyup input paste change', liveValidate);
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
                //check min, max... all the containts
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
                    //passed everything
                    this.validity.valid = true;
                }
            }

            return this;
            //To do: set other validity states and refactor

        },
        setGroup : function (g) {
            this.group = g;
            this.errorGroup = g.name;
            this.type = (g.type === 'custom') && 'group' || this.type;
            return this;
        },
        addError : function (error) {
            this.DOMElement.parentNode.className = this.DOMElement.parentNode.className.split(' ' + this.parent.options.successClass).join('');
            if (this.DOMElement.parentNode.className.indexOf(this.parent.options.errorClass) === -1) {
                this.DOMElement.parentNode.className += ' ' + this.parent.options.errorClass;
            }
            this.DOMElement.setAttribute('aria-invalid', 'true');
            this.parent.manageValidationList(this.errorGroup, error);
            return this;
        },
        removeError : function () {
            this.DOMElement.parentNode.className = this.DOMElement.parentNode.className.split(' ' + this.parent.options.errorClass).join('');
            this.DOMElement.setAttribute('aria-invalid', 'false');
            this.DOMElement.removeAttribute('aria-labelledby');
            this.parent.manageValidationList(this.errorGroup, null);
            return this;
        },
        addSuccess : function () {
            this.removeError();
            if (this.DOMElement.parentNode.className.indexOf(this.parent.options.successClass) === -1) {
                this.DOMElement.parentNode.className += ' ' + this.parent.options.successClass;
            }
            return this;
        },
        test : function () {
            if (!this.parent.HTML5) {
                this.setValidity();
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
            if (this.parent.options.customErrorMessage || this.type === 'group') {
                return (this.parent.options.errorMessages[this.type][this.validity.valueMissing && 'valueMissing' || this.validity.patternMismatch && 'patternMismatch' || this.validity.typeMismatch && 'typeMismatch']);
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
    function Group(name, els, type) {
        if (name === 'undefined') {
            throw new Error('Nae name');
        }
        this.name = name;
        this.elements = els;
        this.type = type;
        this.parent = els[0].parent;

        this.init(els);
    }

    Group.prototype = {
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
            var v,
                error = null;
            for (var i = 0; i < this.elements.length; i++) {
                if (!this.elements[i].test()) {
                    if (!!this.valid) {
                        this.valid = false;
                        error = this.elements[i].getError();
                    }
                } else {
                    this.valid = true;
                    this.addSuccess();
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
            el = document.getElementById(this.parent.validationList[erId].id);
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
            var errorField = document.getElementById(el.errorGroup + '-error');
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
     * Forrm wrapper class
     *
     * @param {DOM node} a single form element
     * @param  {object} to extend defaults{}
     *
     */
    function Forrm(element, options) {
        if (element === 'undefined') {
            throw new Error('Nae element');
        }
        this.DOMElement = element;
        this.options = toolkit.extend(defaults, options);

        this.init();
    }

    Forrm.prototype = {
        HTML5 : false,
        groups : {},
        init: function () {
            var tmpGroups = [],
                self = this;
            this.HTML5 = 'noValidate' in document.createElement('form');
            this.liveValidating = false;

            if (!this.HTML5 || this.options.augmentHTML5) {
                if ('autocomplete' in this.DOMElement && !this.options.autocomplete) {
                    this.DOMElement.setAttribute('autocomplete', 'off');
                }

                this.fields = this.DOMElement.querySelectorAll('input, textarea, select');
                this.validatebleElements = {};

                toolkit.on(this.DOMElement.querySelector('input[type=submit]'), 'click onkeypress', function (e) {
                    self.handleEvent.call(self, e);
                });

                for (var i = 0, field; field = this.fields[i]; i++) {
                    //console.log(field.getAttribute('type'));
                    if (field.getAttribute('type') !== 'submit' &&
                        field.getAttribute('type') !== 'reset' &&
                        field.getAttribute('type') !== 'button' &&
                        field.getAttribute('type') !== 'hidden' &&
                        field.getAttribute('disabled') === null &&
                        field.getAttribute('required') !== null &&
                        field.getAttribute('novalidate') === null) {
                        this.validatebleElements[field.getAttribute('id')] = new Element(field, this);
                        /* This part needs re-thinkin to deal with data-grouping */
                        if (field.getAttribute('type') === 'checkbox' || field.getAttribute('type') === 'radio' || field.getAttribute('data-form-group') !== null) {
                            tmpGroups.push(this.validatebleElements[field.getAttribute('id')]);
                        }

                        //if it's the last of it's group
                        if ((!(field.getAttribute('data-form-group')) && (field.getAttribute('name') !== this.fields[i + 1].getAttribute('name')) || i - 1 === this.fields.length) || field.getAttribute('data-form-group') !== this.fields[i + 1].getAttribute('data-form-group')) {
                            if (tmpGroups.length > 0) {
                                var groupName = field.getAttribute('data-form-group') || field.getAttribute('name'),
                                    groupType = field.getAttribute('data-form-group') ? 'custom' : 'checked';
                                this.groups[groupName] = new Group(groupName, tmpGroups, groupType);
                                for (var j = 0; j < tmpGroups.length; j++) {

                                   tmpGroups[j].setGroup(this.groups[groupName]);
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
                    toolkit.preventDefault(e);
                    this.test();
                }
            }
        },
        makeValidationList : function () {
            this.validationList = {};

            for (var i in this.validatebleElements) {
                if (this.validatebleElements.hasOwnProperty(i)) {
                    //if in a group
                    //check if group type is 'checked elements' or 'custom' (i.e., set by data attribute)
                    //if custom, set validationList id as first element in group, otherwise first elementByName

                    this.validationList[this.validatebleElements[i].errorGroup] = {
                        'error': null,
                        'element': (this.groups[this.validatebleElements[i].errorGroup] || this.validatebleElements[i]),
                        'id': !!(this.groups[this.validatebleElements[i].errorGroup]) ?
                                this.groups[this.validatebleElements[i].errorGroup].elements[0].DOMElement.getAttribute('id') :
                                //document.getElementsByName(this.validatebleElements[i].errorGroup)[0].getAttribute('id') :
                        document.getElementById(this.validatebleElements[i].errorGroup).getAttribute('id')
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
                    //document.getElementsByClassName(this.options.errorMessagesClass)[0].focus();
                    document.querySelector('.' + this.options.errorMessagesClass).focus();
                } else {
                    window.scrollTo(0, this.UI.errorListHolder.offsetTop);
                    this.UI.errorListHolder.focus();
                }
                this.options.fail.call();
            } else {
                //go = this.options.pass ? this.options.pass.call() : this.DOMElement.submit();
            }
        }
    };


    return {
        init : function (el, options) {
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
    };
}));


