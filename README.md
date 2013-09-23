#Form
A lightweight form validation wrapper module to polyfill and standardise HTML5 forms. 

##Why?
HTML5 forms are rather good but we needed 1/ better browser support and 2/ standardised validation errors for our projects.

##Getting started
Code your form(s) in HTML5 using new input types. Validation criteria for a field should be set using the pattern attribute. Set required and novalidate attributes as needed.

Form comes in two flavours - vanilla (requires a modern(ish) browser, ie9+ and friends) and jQuery (requires jQuery).

###Vanilla
Reference the script and instantiate the Form wrapper, passing in a string containing one or more CSS selectors separated by commas to select each form you wish to wrap.
<code>
    <script src="js/form.min.js"></script>
    <script>
        Form.init('form');
    </script>
</code>

###jQuery
Reference jquery library, jQuery Form script, and instantiate the Form wrapper, passing in a string containing one or more JQuery selectors separated by commas to select each form you wish to wrap.

<code>
    <script src="http://code.jquery.com/jquery-latest.min.js"></script>
    <script src="js/jquery.form.min.js"></script>
    <script>
        $('form').Form();
    </script>
</code>

##Options
* displayMessages : boolean, to show full error message for each field, default true 
* errorMessagesClass : string, css className for error messages used for styling hook, default 'error-message'
* errorMessageElement : string, html element used to hold error message, default 'p'
* errorMessages : object containing messages to display for each error type, default :
{ 'missing' : 'Fields marked * are required',
  'phone' : 'Please enter a valid phone number',
  'dob' : 'Please enter a valid date of birth',
  'email' : 'Please enter a valid email address'
}
* no : default, preventdefault() and show errors
* yes : default, submit form

##Example
Full example passing in all options:
<code>
    <script src="js/form.min.js"></script>
    <script>
        Form.init('form', {
            displayMessages : true,
            errorMessagesClass : 'awesome-error-messages',
            errorMessageElement  : 'span',
            errorMessages : {
                'missing' : 'This field is required',
                'phone' : 'Real phone number?',
                'dob' : 'Wrong dob format, brah',
                'email' : 'Wrong email format, brah'
            },
            no : function () {
                alert('no!');
            },
            yes : function () {
                alert('yes!');
            },
        });
    </script>
</code>

##To Do
* Rename poorly chosen variables, what was I thinking...
* Remove patterns from options - that's what pattern attribute is for
* is errorMessageElement config really necessary?

##License
[MIT] (http://opensource.org/licenses/MIT)



