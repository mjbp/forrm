/*jslint browser:true*/
/*global $,define*/
/*
 * @name 
 * @version 02/07/2013
 * @author Binary Vein Digital Media [www.binaryvein.com]
 */

(function (name, context, definition) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(definition);
    } else {
        context[name] = definition();
    }
}('Tabs', this, function (name, context) {
    'use strict';
    
    name = name || 'Tabs';
    context = context || this;
	
    return {
        init : function (ts) {
            $(ts).each(function () {
                var t = this,
                    menuItems = ts.find('a');
                $(menuItems).each(function () {
                    var item = this,
                        target = $(this).attr('href');
                    $(item).on('click', function (e) {
                        e.preventDefault();
                        //console.log(item);
                        if (!$(target).hasClass('visible')) {
                            $(item).parent().find('.active').removeClass('active');
                            $(item).addClass('active');
                            $(target).siblings().removeClass('visible');
                            $(target).addClass('visible');
                        }
                    });
                });
            });
        }
    };
}));