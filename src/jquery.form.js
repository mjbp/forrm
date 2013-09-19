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
                    .test();
            });
        },
        write : function (msg) {
            return this.options.errorTemplate.replace(/></, '>' + msg + '<');
        },
        clearErrors : function () {
            var self = this;
            
            if ($(self.element).find('.error').length) {
                $('.error').removeClass('error');
                $('.error-message').remove();
            }
            return this;
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
                        field.addClass('error');
                        self.errors.push([$(field).attr('id'), 'missing']);
                    } else {
                        if (field.attr('required')) {
                            type = field.attr('type');
                            pattern = field.attr('pattern') || self.options.patterns[type];
                            regExp = new RegExp(pattern, "");
                            if (!regExp.test(field.val())) {
                                field.addClass('error');
                                self.errors.push([$(field).attr('id'), type]);
                            }
                        }
                    }
                }
                
            });
            if (self.errors.length) {
                if (!!self.options.displayMessages) {
                    self.displayErrorMessages();
                }
                this.options.no.call();
            } else {
                go = this.options.yes ? this.options.yes.call() : $(this.element).submit();
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