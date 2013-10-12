/*jslint browser:true,nomen:true*/
/*global jQuery,console*/
/*!
 * @name        Form, lightweight jQuery HTML5 form validation plugin
 * @version     Sept 13  
 * @author      mjbp
 * Licensed under the MIT license
 */

;(function ($, window, document) {
    "use strict";
    
    var pluginName = "Form",
        defaults = {
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

    function Plugin(element, options) {
        this.element = element;
        this.options = $.extend(true, {}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

    Plugin.prototype = {
        init: function () {
            var self = this;
            
            $(this.element).find('input[type=submit]').on("click", function (e) {
                e.preventDefault();
                self.clearErrors()
                    .clearPlaceholders()
                    .test();
            });
            
            this.placeHolders();
        },
        clearPlaceholders : function () {
            $(this.element).find('.form-placeholder').each(function (i, f) {
                if ($(f)[0].value === $(f).attr('placeholder')) {
                    $(f)[0].value = '';
                }
            });
            return this;
        },
        placeHolders : function () {
            var i,
                test = 'placeholder' in document.createElement('input'),
                fields = $(this.element).find(':input:not(:hidden, :submit)'),
                l = fields.length,
                focus = function () {
                    $(this)[0].value = '';
                },
                blur = function () {
                    $(this)[0].value = $(this).attr('placeholder');
                };
            if (!test) {
                $.each(fields, function (i, f) {
                    if ($(f).attr('placeholder') !== undefined) {
                        $(f)[0].value = $(f).attr('placeholder');
                        $(f).addClass('form-placeholder');
                        $([f]).on('focus', focus)
                              .on('blur', blur);
                    }
                });
            }
        },
        write : function (msg) {
            var self = this;
            return $('<' + self.options.errorMessageElement + '/>').text(msg);
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
            return this;
        },
        listErrorMessages : function () {
            var self = this,
                i,
                listHolder = $('<dl class="form-error-list"><dt>' + self.options.listTitle + '</dt><dd><ul></ul></dd></dl>'),
                l = self.errors.length,
                tmp = {},
                li;
            
            
            for (i = 0; i < l; i += 1) {
                tmp[self.errors[i][1]] = self.options.errorMessages[self.errors[i][1]];
            }
            for (i in tmp) {
                if (tmp.hasOwnProperty(i)) {
                    $(listHolder).find('ul').append('<li>' + tmp[i] + '</li>');
                }
            }
            $(self.element).prepend(listHolder);
        },
        displayErrorMessages : function () {
            var self = this,
                i,
                l = self.errors.length,
                tmp;
            for (i = 0; i < l; i += 1) {
                tmp = self.write(self.options.errorMessages[self.errors[i][1]]);
                $('#' + self.errors[i][0]).after($(tmp).addClass(self.options.errorMessagesClass));
                
            }
        },
        test : function () {
            var self = this,
                go;
            
            this.errors = [];
            
            $(this.element).find(':input').each(function () {
                var field = $(this),
                    t = this,
                    type,
                    regExp,
                    tmp,
                    pattern;
                
                if (field.attr('type') !== 'hidden' && !field.attr('novalidate') && field.attr('type') !== 'submit') {
                    if (field.attr('required') && (field.val() === "" || !$.trim(field.val()))) {
                        field.addClass('form-error');
                        self.errors.push([$(field).attr('id'), 'required']);
                    } else {
                        if (field.attr('required')) {
                            type = field.attr('type');
                            pattern = field.attr('pattern') || self.options.patterns[type];
                            if (pattern !== undefined) {
                                regExp = new RegExp(pattern, "");
                                if (!regExp.test(field.val())) {
                                    field.addClass('form-error');
                                    self.errors.push([$(field).attr('id'), type]);
                                }
                            }
                        }
                    }
                }
                
            });
            if (self.errors.length) {
                if (!!self.options.displayMessages) {
                    if (!!self.options.listMessages) {
                        self.listErrorMessages();
                    } else {
                        self.displayErrorMessages();
                    }
                }
                this.placeHolders();
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