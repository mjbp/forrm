'use strict';
/*
 * Default configuration
 *
 */
var defaults = {
	augmentHTML5 : true,
	autocomplete : true,
	customErrorMessage : false,
	displayMessages : true,
	firstErrorOnly : false,
	css : {
		prefix: 'forrm-',
		successClass : 'success',
		errorClass : 'error',
		errorMessageClass : 'error-message',
		errorListClass : 'error-list',
		disabledClass : 'disabled',
		hiddenClass : 'hidden',
		buttonClass : 'btn',
		buttonNextClass : 'btn--submit',
		buttonPreviousClass : 'btn--previous',
		stepPrefix : 'step-'
	},
	listMessages : false,
	listTitle : 'We couldn\'t submit the form, please check your answers:',
	errorMessageElement : 'span',
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
		'password': {
			'valueMissing' : 'This field is required',
			'patternMismatch' : 'Enter a valid password'
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
	fail : false,
	pass : false,
	conditionalConstraint : false,
	customConstraint : false,
	patterns : {
		email : '[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?',
		tel : '[\\w\\d\\s\\(\\)\\.+-]+',
		number : '[\\d]'
	}
};