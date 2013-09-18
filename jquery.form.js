/*jslint browser:true,nomen:true*/
/*global jQuery,console*/
/*!
 * @name        Form, lightweight jQuery form validation plugin
 * @version     Sept 13  
 * @author      mjbp
 * Licensed under the MIT license
 */

;(function ($, window, document) {
        "use strict";
        
        var pluginName = "Form",
            defaults = {
                errorTemplate : '<p class="error-message"></p>',
                errorMessages : {
                    'missing' : 'Fields marked * are required',
                    'email' : 'Please enter a valid email address'
                },
                no : function () { console.log('nein'); }
            };
    
        function Plugin(element, options) {
            this.element = element;
            this.options = $.extend(true, {}, defaults, options);
            this.emailPattern = "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?";
    
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
                    
                    //$(this.element).next().remove();
                }
                return this;
            },
            test : function () {
                var self = this;
                
                this.errors = [];
                
                $(':input:not(input[type=hidden])').each(function () {
                    var field = $(this),
                        t = this,
                        regExp,
                        tmp;
                    
                    if (field.attr('required') && field.attr('type') !== 'email' && (field.val() === "" || !$.trim(field.val()))) {
                        field.addClass('error');
                        self.errors.push([$(field).attr('id'), 'missing']);
                    }
                    if (field.attr('required') && field.attr('type') === 'email') {
                        regExp = new RegExp(self.emailPattern, "");
                        if (!regExp.test(field.val())) {
                            field.addClass('error');
                            self.errors.push([$(field).attr('id'), 'email']);
                        }
                    }
                });
                if (!!self.errors) {
                    console.log(this.errors);
                    console.log(this.options.errorMessages);
                    this.options.no.call();
                } else {
                    console.log('ya');
                    $(this.element).submit();
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