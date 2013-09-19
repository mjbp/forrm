/*jslint browser:true,nomen:true*/
/*global define, console*/
/*!
 * @name        Form, lightweight vanilla js HTML5 form validation helper
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
            displayMessages : false,
            errorMessagesClass : 'error-message',
            errorTemplate : '<p></p>',
            errorMessages : {
                'missing' : 'Fields marked * are required',
                'phone' : 'Please enter a valid phone number',
                'dob' : 'Please enter a valid date of birth',
                'email' : 'Please enter a valid email address'
            },
            patterns : {
                email : "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
                tel : "[\\w\\d\\s\\(\\)\\.+-]+"
            },
            no : function () {},
            yes : false
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
            return this.options.errorTemplate.replace(/></, '>' + msg + '<');
        },
        clearErrors : function () {
            var self = this,
                fields = this.element.querySelectorAll('input, textarea'),
                i,
                l = fields.length;
            //remove .error className
            for (i = 0; i < l; i += 1) {
                fields[i].className = fields[i].className.replace(/\serror/g, '');
            }
            
            /*
            if ($(self.element).find('.error').length) {
                $('.error-message').remove();
            }
            */
            return this;
        },
        displayErrorMessages : function () {
            /*
            var self = this,
                i,
                l = self.errors.length,
                tmp;
            for (i = 0; i < l; i += 1) {
                tmp = self.write(self.options.errorMessages[self.errors[i][1]]);
                $('#' + self.errors[i][0]).after($(tmp).addClass(self.options.errorMessagesClass));
                
            }
            */
        },
        test : function () {
            var self = this,
                fields,
                field,
                type,
                pattern,
                regExp,
                i,
                l,
                go;
            
            this.errors = [];
            
            fields = this.element.querySelectorAll('input, textarea');
            l = fields.length;
            
            for (i = 0; i < l; i += 1) {
                field = fields[i];
                
                if (field.getAttribute('type') !== 'hidden' && field.getAttribute('novalidate') === null && field.getAttribute('type') !== 'submit') {
                    if (field.getAttribute('required') !== null && (field.value === "")) {
                        field.className += ' error';
                        self.errors.push([field.getAttribute('id'), 'missing']);
                    } else {
                        if (field.getAttribute('required') !== null) {
                            type = field.getAttribute('type');
                            pattern = field.getAttribute('pattern') || self.options.patterns[type];
                            regExp = new RegExp(pattern, "");
                            if (!regExp.test(field.value)) {
                                field.className += ' error';
                                self.errors.push([field.getAttribute('id'), type]);
                            }
                        }
                    }
                }
            }
            
            if (self.errors.length) {
                if (!!self.options.displayMessages) {
                    self.displayErrorMessages();
                }
                
                this.options.no.call();
            } else {
                go = this.options.yes ? this.options.yes.call() : this.element.submit();
            }
            
            /*
                 
            if (self.errors.length) {
                if (!!self.options.displayMessages) {
                    self.displayErrorMessages();
                }
                this.options.no.call();
            } else {
                go = this.options.yes ? this.options.yes.call() : $(this.element).submit();
            }
            */
        }
    };
    
    
    return {
        init : function (el, options) {
            var elements = document.querySelectorAll(el),
                forms = [],
                i,
                l = elements.length;
        
            for (i = 0; i < l; i += 1) {
                forms[i] = new Plugin(elements[i], options);
            }
        }
    };
}));
    
    
    