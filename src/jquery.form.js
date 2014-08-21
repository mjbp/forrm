/*jslint browser:true,nomen:true*/
/*global jQuery,console*/
/*!
 * @name        Form, lightweight jQuery HTML5 form validation plugin
 * @version     Sept 13  
 * @author      mjbp
 * Licensed under the MIT license
 */

(function ($, window, document) {
    "use strict";
    
    var pluginName = "Form",
        defaults = {
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

    function PluginChild(element, parent) {
        this.DOMElement = element;
        this.parent = parent;
        this.init();
    }

    PluginChild.prototype = {
        init : function () {
            this.ph = 'placeholder' in document.createElement('input');

            this.type = $(this.DOMElement).attr('type') || 'text';

            this.DOMElement.validityState = this.DOMElement.validityState || this.defaultValidityState();
            this.DOMElement.checkValidity = this.DOMElement.checkValidity || this.getValidityState;
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
            //To do: set other validity states

        },
        placeHolder : function () {
            var focus = function (e) {
                    e.stopPropagation();
                    $(this).val()
                        .removeClass('form-placeholder');
                },
                blur = function (e) {
                    e.stopPropagation();
                    if ($(this).val() === '') {
                        e.stopPropagation();
                        $(this).val($(this).attr('placeholder'))
                            .addClass('form-placeholder');
                    }
                };

            if (!!this.DOMElement.getAttribute('placeholder')) {
                $(this.DOMElement).on('focus', focus)
                    .on('blur', blur, false);
                if ($(this.DOMElement).val() === '') {
                    $(this.DOMElement).val($(this.DOMElement).attr('placeholder'))
                        .addClass('form-placeholder');
                }
            }
        },
        clearPlaceholder : function () {
            if ($(this.DOMElement).val() === $(this.DOMElement).attr('placeholder')) {
                $(this.DOMElement).val('');
            }
            return this;
        },
        validate : function () {
            var r = false,
                v = null,
                regExp = null,
                value = $(this.DOMElement).val(),
                pattern = $(this.DOMElement).attr('pattern') || this.parent.options.patterns[this.type];

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
                    if (this.type === 'radio' || this.type === 'checkbox') {
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
                if (this.type === 'checkbox' || this.type === 'radio') {
                    this.parent.groups[this.DOMElement.getAttribute('name')] = 'checked';
                    if (this.parent.errors[this.DOMElement.getAttribute('name')]) {
                        delete this.parent.errors[this.DOMElement.getAttribute('name')];
                    }
                }
                return false;
            }
        }
    };

    function Plugin(element, options) {
        this.element = element;
        this.options = $.extend(true, {}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.elements = [];

        this.init();
    }

    Plugin.prototype = {
        HTML5 : false,
        groups : [],
        init: function () {
            var self = this;
            this.HTML5 = 'noValidate' in document.createElement('form');
            
            if (!this.HTML5 || this.options.augmentHTML5) {

                $(this.element).find('input, textarea').each(function () {
                    self.elements.push(new PluginChild(this, self));
                });

                $(this.element).find('input[type=submit]').on("click", function (e) {
                    e.preventDefault();
                    self.clearErrors()
                        .test();
                });
            }
        },
        writeInline : function (msg) {
            var self = this;
            return $('<' + self.options.errorMessageElement + ' role="alert"/>').addClass(self.options.errorMessagesClass).text(msg);
        },
        clearErrors : function () {
            var self = this;
            if ($(self.element).find('.form-error-list').length) {
                $(self.element).find('.form-error-list').remove();
            }
            if ($(self.element).find('.form-error').length) {
                $(self.element).find('.form-error').removeClass('form-error');
                $(self.element).find('.form-error-message').remove();
            }
            if ($(self.element).find('[aria-labelledBy]')) {
                $(self.element).find('[aria-labelledBy]').removeAttr('aria-labelledBy');
            }
            if ($(self.element).find('[aria-invalid]')) {
                $(self.element).find('[aria-invalid]').removeAttr('aria-invalidy');
            }
            return this;
        },
        listErrorMessages : function () {
            var self = this,
                er,
                listHolder = $('<dl class="form-error-list"><dt>' + self.options.listTitle + '</dt><dd><ol></ol></dd></dl>'),
                tmp = {},
                li;
            
            for (er in self.errors) {
                if (self.errors.hasOwnProperty(er)) {
                    if (er !== 'hasErrors') {
                        $(listHolder).find('ol').append('<li><a id=' + er + '-error' + '" href="#' + self.errors[er].id + '">' + self.errors[er].error + '</a></li>');
                    }
                }
            }
            $(self.element).prepend(listHolder);
            $('html, body').animate({
                scrollTop: $(listHolder).offset().top
            }, 500);
            //window.scrollTo(0, listHolder.offsetTop);
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

            for (er in self.errors) {
                if (self.errors.hasOwnProperty(er)) {
                    if (er !== 'hasErrors') {
                        tmp = self.writeInline(self.errors[er].error);
                        el = document.getElementById(er) !== null ? document.getElementById(self.errors[er].id) : document.getElementsByName(er)[0];
                        tmpId = self.errors[er].id + '-error';
                        tmp.setAttribute('id', tmpId);
                        el.setAttribute('aria-labelledBy', tmpId);
                        elParent = el.parentNode;
                        if (elParent.getElementsByClassName(self.options.errorMessagesClass).length === 0) {
                            elParent.insertBefore(tmp, el.nextSibling);
                        }
                    }
                }
            }
            $('html, body').animate({
                scrollTop: $(this.element).offset().top
            }, 50);
            //window.scrollTo(0, this.element.offsetTop);
            document.getElementsByClassName(self.options.errorMessagesClass)[0].focus();
        },
        addError : function (f, er, g) {
            var self = this,
                field = f,
                a = null,
                id = null,
                t = null;
            a = g ? $(field).attr('name') : $(field).attr('id');
            id = $(field).attr('id');
            t = g ? field.parentNode : field;
            $(t).addClass('form-error');
            $(field).attr('aria-invalid', 'true');
            self.errors.hasErrors = true;
            self.errors[a] = {'error': er, 'id': id};
        },
        test : function () {
            var i = null,
                el = null,
                er = null,
                go = null,
                l = this.elements.length,
                self = this;
            
            console.log(this);
            this.errors = {};
            this.groups = [];
            
            for (i = 0; i < l; i += 1) {
                el = this.elements[i].DOMElement;
                if (el.getAttribute('type') !== 'submit' && el.getAttribute('required') !== null && el.getAttribute('type') !== 'hidden' && el.getAttribute('novalidate') === null) {
                    er = this.elements[i].validate();
                    if (er) {
                        self.addError(this.elements[i].DOMElement, er, (this.elements[i].type === 'checkbox' || this.elements[i].type === 'radio'));
                        if (!this.elements[i].ph) {
                            this.elements[i].placeHolder();
                        }

                    }
                }
            }
            
            if (this.errors.hasErrors) {
                if (!!self.options.displayMessages) {
                    if (!!self.options.listMessages) {
                        self.listErrorMessages();
                    } else {
                        self.displayInlineErrorMessages();
                    }
                }
                this.options.fail.call();
            } else {
                go = this.options.pass ? this.options.pass.call() : $(this.element).submit();
            }
        }
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName,
                    new Plugin(this, options));
            }
        });
    };

}(jQuery, window, document, undefined));
