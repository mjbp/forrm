/*jslint browser:true,nomen:true*/
/*global define, console*/
/*!
 * @name        Form, lightweight vanilla js HTML5 form validation module
 * @version     Jul 14  
 * @author      mjbp
 * Licensed under the MIT license
 */


/*
 * TO DO:
 * file input
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
            customErrorMessage : false,
            displayMessages : true,
            listMessages : true,
            listTitle : 'We couldn\'t submit the form, please check your answers:',
            errorMessagesClass : 'form-error-message',
            errorMessageElement : 'p',
            errorMessages : {
                'valueMissing' : {
                    'text' : 'This field is required',
                    'email' : 'This field is required',
                    'tel' : 'This field is required',
                    'checkbox' : 'Check at least one of the required boxes',
                    'radio' : 'Select one of the required radio options'
                },
                'patternMismatch' : {
                    'tel' : 'Enter a valid phone number',
                    'email' : 'Enter a valid email address',
                    'text' : 'Please match the requested format'
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
     * @param {DOM node} a single form input element
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
            var self = this;
            this.ph = 'placeholder' in document.createElement('input');
            this.type = this.DOMElement.getAttribute('type') || 'text';
            this.isGrouped = (this.DOMElement.getAttribute('type') === 'checkbox' || this.DOMElement.getAttribute('type') === 'radio');
            //this.dirty = false;

            //prevent validation if not dirty?

            this.DOMElement.validityState = this.DOMElement.validityState || this.defaultValidityState();
            this.DOMElement.checkValidity = this.DOMElement.checkValidity || this.getValidityState;

            /*this.DOMElement.addEventListener('blur', function () {
                if (self.getError()) {
                    self.parent.addError(this, self.getError(), self.isGrouped);
                } else {
                    self.parent.deleteError(this, self.isGrouped);
                }
            }, false);
                */
            if (!this.ph) {
                this.placeHolder();
            }
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
                pattern = this.DOMElement.getAttribute('pattern') || this.parent.options.patterns[this.type],
                m = null;

            if (this.DOMElement.value === "" || ((this.type === 'radio' || this.type === 'checkbox') && !this.DOMElement.checked)) {
                this.DOMElement.validityState.valid = false;
                this.DOMElement.validityState.valueMissing = true;
                m = this.parent.options.errorMessages.valueMissing[this.type];
            } else {
                this.DOMElement.validityState.valueMissing = false;
                regExp = new RegExp(pattern, "");
                if (!regExp.test(this.DOMElement.value)) {
                    this.DOMElement.validityState.valid = false;
                    this.DOMElement.validityState.patternMismatch = true;
                    m = this.parent.options.errorMessages.patternMismatch[this.type];
                } else {
                    this.DOMElement.validityState.valid = true;
                }
            }
            this.DOMElement.validationMessage = m;
            return this;
            //To do: set other validity states and refactor

        },
        placeHolder : function () {
            var focus = function (e) {
                    e.stopPropagation();
                    this.value = '';
                    this.className = this.className.split('form-placeholder').join('');
                },
                blur = function (e) {
                    e.stopPropagation();
                    if (this.value === '') {
                        this.value = this.getAttribute('placeholder');
                        this.className += ' form-placeholder';
                    }
                };

            if (!!this.DOMElement.getAttribute('placeholder')) {
                this.DOMElement.addEventListener('focus', focus, false);
                this.DOMElement.addEventListener('blur', blur, false);
                if (this.DOMElement.value === '') {
                    this.DOMElement.value = this.DOMElement.getAttribute('placeholder');
                    this.DOMElement.className += ' form-placeholder';
                }
            }
        },
        clearPlaceholder : function () {
            if (this.DOMElement.value === this.DOMElement.getAttribute('placeholder')) {
                this.DOMElement.value = '';
            }
            return this;
        },
        /*
         * Move error display/hide to element
         *      - add/remove error class/aria
         *      - add/remove item from form error list
         *      - show/hide error inline message
         */
        getError : function () {
            var r = false,
                v = null,
                regExp = null,
                value = this.DOMElement.value,
                pattern = this.DOMElement.getAttribute('pattern') || this.parent.options.patterns[this.type];
            if (!this.ph) {
                this.clearPlaceholder();
            }
            //polyfill if necessary
            if (!this.parent.HTML5) {
                this.setValidityState();
            }
            v = this.DOMElement.checkValidity();
            if (!v) {
                //if we want to use our custom error messages
                if (this.parent.options.customErrorMessage) {
                    if (this.isGrouped) {
                        if (this.parent.groups[this.DOMElement.getAttribute('name')] !== 'checked') {
                            this.parent.groups[this.DOMElement.getAttribute('name')] = 'not-checked';
                            return this.parent.options.errorMessages.valueMissing[this.type];
                        }
                    } else {
                        return (this.DOMElement.validity.valueMissing && this.parent.options.errorMessages.valueMissing[this.type]) ||
                            (this.DOMElement.validity.patternMismatch && this.parent.options.errorMessages.patternMismatch[this.type]);
                    }
                } else {
                    //show the default ones
                    return this.DOMElement.validationMessage;
                }
            } else {
                //it's true but is a grouped input with a collective state
                if (this.isGrouped) {
                    this.parent.groups[this.DOMElement.getAttribute('name')] = 'checked';
                    this.parent.errorList[this.DOMElement.getAttribute('name')].error = null;
                }
                return false;
            }
        }
    };
    
    /*
     * Form wrapper class
     *
     * @param {DOM node} a single form element
     * @param  {object} to overwrite / extend defaults{}
     *
     */
    function Form(element, options) {
        this.element = element;
        this.options = extend(defaults, options);

        this.init();
    }
    
    Form.prototype = {
        HTML5 : false,
        groups : [],
        init: function () {
            var i = 0,
                l = 0,
                self = this;
            this.HTML5 = 'noValidate' in document.createElement('form');
            
            if (!this.HTML5 || this.options.augmentHTML5) {
                this.fields = this.element.querySelectorAll('input, textarea');
                this.validatebleElements = {};
                l = this.fields.length;
                this.element.querySelector('input[type=submit]').addEventListener('click', this, false);
                this.element.querySelector('input[type=submit]').addEventListener('onkeypress', this, false);

                for (i = 0; i < l; i += 1) {
                    if (this.fields[i].getAttribute('type') !== 'submit' && this.fields[i].getAttribute('required') !== null && this.fields[i].getAttribute('type') !== 'hidden' && this.fields[i].getAttribute('novalidate') === null) {
                        this.validatebleElements[this.fields[i].getAttribute('id')] = new Element(this.fields[i], this);
                    }
                }
                this.makeErrorList();
            }
        },
        handleEvent : function (e) {
            if (!this.HTML5 || this.options.augmentHTML5) {
                if (e.type === 'click') {
                    e.preventDefault();
                    this.clearErrors()
                        .test();
                }
            }
        },
        writeInline : function (msg) {
            var self = this,
                r = document.createElement(self.options.errorMessageElement);
            r.textContent = msg;
            r.className = self.options.errorMessagesClass;
            r.setAttribute('role', 'alert');
            return r;
        },
        clearErrors : function () {
            var self = this,
                er = null,
                i  = null,
                l = self.fields.length;
            
            if (self.element.querySelectorAll('.form-error').length > 0) {
                for (i = 0; i < l; i += 1) {
                    if (self.fields[i].className.indexOf('form-error') > -1) {
                        self.fields[i].className = self.fields[i].className.split('form-error').join('');
                        if (!self.options.listMessages) {
                            self.fields[i].removeAttribute('aria-labelledBy');
                            self.fields[i].removeAttribute('aria-invalid');
                            er = self.fields[i].nextElementSibling;
                            if (er) {
                                er.parentNode.removeChild(er);
                            }
                        }
                    }
                }
            }
            return self;
        },
        listErrorMessages : function () {
            var self = this,
                i = 0,
                oldListHolder = this.element.querySelector('.form-error-list'),
                listHolder = document.createElement('dl'),
                listTitle = document.createElement('dt'),
                listDescription = document.createElement('dd'),
                list = document.createElement('ol'),
                listItem = document.createElement('li'),
                link = document.createElement('a'),
                item = null,
                itemLink = null,
                er = null,
                l = self.errorList.length,
                errByType = {};

            if (oldListHolder) {
                oldListHolder.parentElement.removeChild(oldListHolder);
            }
            listTitle.innerHTML = self.options.listTitle;
            listHolder.appendChild(listTitle);
            listHolder.appendChild(listDescription);
            listHolder.className = 'form-error-list';
            listHolder.setAttribute('role', 'alert');
            listDescription.appendChild(list);
            
            for (er in self.errorList) {
                if (self.errorList.hasOwnProperty(er)) {
                    if (er !== 'hasErrors' && !!self.errorList[er].error) {
                        item = listItem.cloneNode(true);
                        itemLink = link.cloneNode(true);
                        itemLink.setAttribute('href', '#' + self.errorList[er].id);
                        itemLink.setAttribute('id', er + '-error');
                        itemLink.innerHTML = self.errorList[er].error;
                        item.appendChild(itemLink);
                        list.appendChild(item);
                    }
                }
            }

            self.element.insertBefore(listHolder, self.element.firstChild);
            window.scrollTo(0, listHolder.offsetTop);
            listHolder.focus();
        },
        displayInlineErrorMessages : function () {
            var self = this,
                er = null,
                el = null,
                elParent = null,
                tmp = null,
                tmpId = null,
                li = null;

            console.log('To do\n - test displaying of inline errors');

            for (er in self.errorList) {
                if (self.errorList.hasOwnProperty(er)) {
                    if (er !== 'hasErrors') {
                        tmp = self.writeInline(self.errorList[er].error);
                        el = document.getElementById(er) !== null ? document.getElementById(self.errorList[er].id) : document.getElementsByName(er)[0];
                        tmpId = self.errorList[er].id + '-error';
                        tmp.setAttribute('id', tmpId);
                        el.setAttribute('aria-labelledBy', tmpId);
                        elParent = el.parentNode;
                        if (elParent.getElementsByClassName(self.options.errorMessagesClass).length === 0) {
                            elParent.insertBefore(tmp, el.nextSibling);
                        }
                    }
                }
            }
            window.scrollTo(0, this.element.offsetTop);
            document.getElementsByClassName(self.options.errorMessagesClass)[0].focus();
        },
        makeErrorList : function () {
            var a, g, i;

            this.errorList = {};

            for (i in this.validatebleElements) {
                if (this.validatebleElements.hasOwnProperty(i)) {
                    g = this.validatebleElements[i].isGrouped;
                    a = g ? this.validatebleElements[i].DOMElement.getAttribute('name') : this.validatebleElements[i].DOMElement.getAttribute('id');
                    this.errorList[a] = {'error': null, 'id': this.validatebleElements[i].DOMElement.getAttribute('id')};
                }
            }
            return this;
        },
        addError : function (f, er, g) {
            var self = this,
                field = f,
                a = null,
                id = null,
                t = null;

            a = g ? field.getAttribute('name') : field.getAttribute('id');
            console.log(a);
            id = field.getAttribute('id');
            t = g ? field.parentNode : field;
            if (t.className.indexOf('form-error') === -1) {
                t.className += ' form-error';
            }
            field.setAttribute('aria-invalid', 'true');
            self.errorList.hasErrors = true;
            self.errorList[a].error = er;
        },
        deleteError : function (f, g) {
            var field = f,
                a = null,
                id = null,
                t = null;

            a = g ? field.getAttribute('name') : field.getAttribute('id');
            id = field.getAttribute('id');
            t = g ? field.parentNode : field;
            if (t.className.indexOf('form-error') > -1) {
                t.className = t.className.split(' form-error').join('');
            }
            console.log('deleting error...');
            field.setAttribute('aria-invalid', 'false');
            this.errorList[a].error = null;
        },
        test : function () {
            var i = null,
                el = null,
                er = null,
                go = null,
                l = this.validatebleElements.length,
                self = this;

            this.makeErrorList();

            this.groups = [];
            
            for (i in this.validatebleElements) {
                if (this.validatebleElements.hasOwnProperty(i)) {
                    er = this.validatebleElements[i].getError();

                    if (er) {
                        if (!this.validatebleElements[i].isGrouped || this.groups[this.validatebleElements[i].DOMElement.getAttribute('name')] !== 'checked') {
                            self.addError(this.validatebleElements[i].DOMElement, er, this.validatebleElements[i].isGrouped);
                        }
                        if (!this.validatebleElements[i].ph) {
                            this.validatebleElements[i].placeHolder();
                        }
                    }
                }
            }
            
            if (this.errorList.hasErrors) {
                if (!!self.options.displayMessages) {
                    if (!!self.options.listMessages) {
                        self.listErrorMessages();
                    } else {
                        self.displayInlineErrorMessages();
                    }
                }
                this.options.fail.call();
            } else {
                go = this.options.pass ? this.options.pass.call() : this.element.submit();
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
    

