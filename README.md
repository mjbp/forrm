#Form
A lightweight form validation wrapper module to polyfill and standardise HTML5 form validation behaviour. 

Demo: [http://mjbp.github.io/form] (http://mjbp.github.io/form)

###Why?
HTML5 forms are rather good but branding and UI design requirements determined default browser form validation to be unsatisfactory or unacceptable. The choice we faced was between abandoning html5 client-side form validation or taking control of the browser validation behaviour. 

This script is our attempt at the latter.

###Getting started
Code your form(s) in HTML5 using new input types. Validation criteria for a field should be set using the pattern attribute. Set required and novalidate attributes as needed.

Form comes in two flavours - vanilla (requires a modern browser and only standardises form validation errors) and jQuery (requires jQuery and supplies legacy browser support).

Forms with novalidate attribute are not wrapped, fields with novalidate attribute are not validated.

###Vanilla
Reference the script and instantiate the Form wrapper, passing in a string containing one or more CSS selectors separated by commas to select each form you wish to wrap.
```javascript
<script src="js/form.min.js"></script>
<script>
    Form.init('form');
</script>
```

###jQuery
Reference jQuery library, jQuery Form script, and instantiate the Form wrapper, passing in a string containing one or more JQuery selectors separated by commas to select each form you wish to wrap.

```javascript
    <script src="http://code.jquery.com/jquery-latest.min.js"></script>
    <script src="js/jquery.form.min.js"></script>
    <script>
        $('form').Form();
    </script>
```

This version also polyfills input placeholders, adding the class '.form-placeholder' when the input is in placeholder mode so you can style the placeholder differently to the input value when entered.

###Options
* displayMessages : boolean, show full error message for each field, default true 
* listMessages : boolean, show errors in a list at the top of the form, displayed inline if false, default false
* listTitle : string, title for the list of errors, default 'Errors were found in the form:'
* errorMessagesClass : string, css className for error messages used for styling hook, default 'form-error-message'
* errorMessages : object containing messages to display for each error type, default :
```javascript
{ 'required' : 'Fields marked * are required',
  'phone' : 'Enter a valid phone number',
  'dob' : 'Eenter a valid date of birth',
  'email' : 'Enter a valid email address'
}
```
* fail : function, default preventDefault() and show errors
* pass : function, default submit form

###Example
Full example passing in all options:
```javascript
    <script src="js/form.min.js"></script>
    <script>
        Form.init('form', {
            displayMessages : true,
            errorMessagesClass : 'awesome-error-messages',
            errorMessages : {
                'missing' : 'This field is required',
                'phone' : 'Real phone number?',
                'dob' : 'Wrong dob format',
                'email' : 'Wrong email format'
            },
            no : function () {
                alert('no!');
            },
            yes : function () {
                alert('yes!');
            },
        });
    </script>
```

###License
[MIT] (http://opensource.org/licenses/MIT)



