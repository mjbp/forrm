/*jslint browser:true*/
/*global jQuery,console*/
/*
 * @name 
 * @version 02/07/2013
 * @author Binary Vein Digital Media [www.binaryvein.com]
 */
var Form = (function ($) {
	"use strict";
	var emailPattern = "[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?",
		no,
		yes,
		error = 0,
        errorTemplate = '<p class="error-message">{{}}</p>',
        write = function (msg) {
            return errorTemplate.replace(/\{\{\}\}/, msg);
        },
		test = function (f) {
			f.find($(':input:not(input[type=hidden])')).each(function () {
				//check not empty
				var field = $(this),
					t = this,
					regExp;
				if (field.attr('required') && (field.val() === "" || !$.trim(field.val()))) {
					field.parent().addClass("error");
					error += 1;
				}
                if (field.attr('required') && field.attr('type') === 'email') {
					//check email address
					regExp = new RegExp(emailPattern, "");
					if (!regExp.test(field.val())) {
						field.parent().addClass("error");
						error += 1;
					}
				}
			});
			if (error > 0) {
				//return !1;
				no.call();
			} else {
				//return !0;
				yes.call();
			}
		};
				
	return {
		init : function (f, fail, success) {
            no = fail;
            yes = success;
            if (f.find('.error').length) {
                f.find('.error').removeClass('error');
                f.find('.error-message').remove();
            }
            return test(f);
		}
	};
}(jQuery));