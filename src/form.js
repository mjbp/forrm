/*jslint browser:true,nomen:true*/
/*global define, console*/
/*!
 * @name        Form, lightweight vanilla js HTML5 form validation module
 * @version     Sept 13  
 * @author      mjbp
 * Licensed under the MIT license
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
            displayMessages : true,
            listMessages : true,
            listTitle : 'Errors were found in the form:',
            errorMessagesClass : 'form-error-message',
            errorMessageElement : 'p',
            errorMessages : {
                'required' : 'Fields marked * are required',
                'tel' : 'Enter a valid phone number',
                'dob' : 'Enter a valid date of birth',
                'email' : 'Enter a valid email address'
            },
            patterns : {
                email : "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
                tel : "[\\w\\d\\s\\(\\)\\.+-]+"
            },
            fail : function () {},
            pass : false
        };
    
    function extend(b, a) {
        var prop;
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
    
    function Plugin(element, options) {
        this.element = element;
        this.options = extend(defaults, options);

        this.init();
    }
    
    Plugin.prototype = {
        init: function () {
            var self = this;
            this.fields = this.element.querySelectorAll('input, textarea');
            this.element.querySelector('input[type=submit]').addEventListener('click', this, false);
        },
        handleEvent : function (e) {
            if (e.type === 'click') {
                e.preventDefault();
                this.clearErrors()
                    .test();
            }
        },
        write : function (msg) {
            var self = this,
                r = document.createElement(self.options.errorMessageElement);
            r.textContent = msg;
            r.className = self.options.errorMessagesClass;
            r.setAttribute('role', 'alert');
            return r;
        },
        clearErrors : function () {
            var self = this,
                er,
                i,
                l = self.fields.length;
            
            for (i = 0; i < l; i += 1) {
                if (self.fields[i].parentNode.className.indexOf('form-error') > -1) {
                    self.fields[i].parentNode.className = self.fields[i].parentNode.className.split('form-error').join('');
                    if (!self.options.listMessages) {
                        er = self.fields[i].nextElementSibling;
                        if (er) {
                            er.parentNode.removeChild(er);
                        }
                    }
                }
            }
            return self;
        },
        listErrorMessages : function () {
            var self = this,
                i,
                oldListHolder = document.querySelector('.form-error-list'),
                listHolder = document.createElement('dl'),
                listTitle = document.createElement('dt'),
                listDescription = document.createElement('dd'),
                list = document.createElement('ul'),
                item,
                l = self.errors.length,
                tmp = {};
            if (oldListHolder) {
                oldListHolder.parentElement.removeChild(oldListHolder);
            }
            listTitle.innerHTML = self.options.listTitle;
            listHolder.appendChild(listTitle);
            listHolder.appendChild(listDescription);
            listHolder.className = 'form-error-list';
            listHolder.setAttribute('role', 'alert');
            listDescription.appendChild(list);
            
            for (i = 0; i < l; i += 1) {
                tmp[self.errors[i][1]] = self.options.errorMessages[self.errors[i][1]];
            }
            for (i in tmp) {
                if (tmp.hasOwnProperty(i)) {
                    item = document.createElement('li');
                    item.innerHTML = tmp[i];
                    list.appendChild(item);
                }
            }
            self.element.insertBefore(listHolder, self.element.firstChild);
            window.scrollTo(0, listHolder.offsetTop);
            listHolder.focus();
        },
        displayErrorMessages : function () {
            var self = this,
                i,
                el,
                elParent,
                l = self.errors.length,
                tmp,
                li;
            for (i = 0; i < l; i += 1) {
                tmp = self.write(self.options.errorMessages[self.errors[i][1]]);
                el = document.getElementById(self.errors[i][0]) !== null ? document.getElementById(self.errors[i][0]) : document.getElementsByName(self.errors[i][0])[0];
                elParent = el.parentNode;
                if (elParent.getElementsByClassName(self.options.errorMessagesClass).length === 0) {
                    elParent.insertBefore(tmp, el.nextSibling);
                }
            }
            window.scrollTo(0, document.getElementsByClassName(self.options.errorMessagesClass)[0].offsetTop);
            document.getElementsByClassName(self.options.errorMessagesClass)[0].focus();
        },
        addError : function (f, er, g) {
            var self = this,
                field = f,
                a,
                p,
                t;
            a = g ? field.getAttribute('name') : field.getAttribute('id');
            t = g ? field.parentNode : field;
            t.className += ' form-error';
            field.setAttribute('aria-invalid', 'true');
            self.errors.push([a, er]);
        },
        test : function () {
            var self = this,
                checkedGroup = {},
                field,
                type,
                pattern,
                regExp,
                i,
                j,
                l,
                fs,
                f,
                go;
            
            this.errors = [];
            
            l = self.fields.length;
            
            for (i = 0; i < l; i += 1) {
                field = self.fields[i];
                if (field.getAttribute('type') !== 'hidden' && field.getAttribute('novalidate') === null && field.getAttribute('type') !== 'submit' && field.getAttribute('required') !== null) {
                    if (field.value === "") {
                        self.addError(field, 'required');
                    } else {
                        if (field.getAttribute('type') === 'radio' || field.getAttribute('type') === 'checkbox') {
                            if (!!field.checked) {
                                checkedGroup[field.getAttribute('name')] = 'checked';
                            } else {
                                if (checkedGroup[field.getAttribute('name')] !== 'checked') {
                                    checkedGroup[field.getAttribute('name')] = 'not-checked';
                                }
                            }
                            
                        } else {
                            type = field.getAttribute('type');
                            pattern = field.getAttribute('pattern') || self.options.patterns[type];
                            if (pattern !== undefined) {
                                regExp = new RegExp(pattern, "");
                                if (!regExp.test(field.value)) {
                                    self.addError(field, type);
                                }
                            }
                        }
                    }
                }
            }
            for (i in checkedGroup) {
                if (checkedGroup.hasOwnProperty(i) && checkedGroup[i] === 'not-checked') {
                    fs = document.getElementsByName(i);
                    for (j = 0; j < fs.length; j += 1) {
                        self.addError(fs[j], 'required', true);
                    }
                }
            }
            
            if (self.errors.length) {
                if (!!self.options.displayMessages) {
                    if (!!self.options.listMessages) {
                        self.listErrorMessages();
                    } else {
                        self.displayErrorMessages();
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
                i,
                l = elements.length;
            
            for (i = 0; i < l; i += 1) {
                if (!elements[i].hasAttribute('novalidate')) {
                    forms[i] = new Plugin(elements[i], options);
                }
            }
        }
    };
}));
    
    
    