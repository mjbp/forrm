/*
 * ForrmUI wrapper class
 *
 * @param   {Form} Parent forrm
 *
 * @roadMap Improve DOM manipulation horrorshow, add interface for templating systems
 *
 */

function ForrmUI(form) {
  this.parent = form;
  this.init();
}

ForrmUI.prototype = {
  init : function () {
	  if (!!this.parent.options.displayMessages) {
		  this.write = !!this.parent.options.listMessages ? this.listErrorMessages : this.displayInlineErrorMessages;
	  } else {
		  this.write = function () {return this;};
	  }
  },
  addInlineError : function (erId) {
	  var el,
		  msg = document.createElement(this.parent.options.errorMessageElement);
	  msg.innerHTML = this.parent.validationList[erId].error;
	  msg.className = this.parent.options.css.prefix + this.parent.options.css.errorMessageClass;
	  msg.setAttribute('role', 'alert');
	  msg.setAttribute('id', erId + '-error');
	  el = document.getElementById(this.parent.validationList[erId].id);
	  el.setAttribute('aria-labelledBy', erId + '-error');
	  el.parentNode.appendChild(msg);

	  return;
  },
  clearInlineErrors : function () {
	  var errorMessages = this.parent.DOMElement.querySelectorAll('.' + this.parent.options.css.prefix + this.parent.options.css.errorMessageClass);

	  if (errorMessages.length === 0) {
		  return;
	  }
	  for(var i = 0; i < errorMessages.length; i++) {
		  errorMessages[i].parentNode.removeChild(errorMessages[i]);
	  }

	  return this;
  },
  updateInlineErrors : function (el) {
	  var errorField = document.getElementById(el.errorGroup + '-error');
	  if (!el.parent.validationList[el.errorGroup].error) {
		  if (!errorField) {
			  return this;
		  } else {
			  errorField.parentNode.removeChild(errorField);
			  return this;
		  }
	  } else {
		  if (!errorField) {
			  this.addInlineError(el.errorGroup);
			  return this;
		  } else {
			  errorField.textContent = el.parent.validationList[el.errorGroup].error;
			  return this;
		  }
	  }
  },
  displayInlineErrorMessages : function () {
	  this.clearInlineErrors();
	  for (var er in this.parent.validationList) {
		  if (this.parent.validationList.hasOwnProperty(er)) {
			  if (!!this.parent.validationList[er].error) {
				  this.addInlineError(er);
			  }
		  }
	  }
  },
  listErrorMessages : function () {
	  var i = 0,
		  oldListHolder = this.parent.DOMElement.querySelector('.' + this.parent.options.css.prefix +  this.parent.options.css.errorListClass),
		  listHolder = document.createElement('dl'),
		  listTitle = document.createElement('dt'),
		  listDescription = document.createElement('dd'),
		  list = document.createElement('ol'),
		  listItem = document.createElement('li'),
		  link = document.createElement('a'),
		  item = null,
		  itemLink = null;

	  this.errorListHolder = listHolder;

	  if (oldListHolder) {
		  oldListHolder.parentElement.removeChild(oldListHolder);
	  }
	  if (this.parent.countErrors() === 0) {
		  return this;
	  }
	  listTitle.innerHTML = this.parent.options.listTitle;
	  listHolder.appendChild(listTitle);
	  listHolder.appendChild(listDescription);
	  listHolder.className = this.parent.options.css.prefix +  this.parent.options.css.errorListClass;
	  listHolder.setAttribute('role', 'alert');
	  listDescription.appendChild(list);

	  for (var er in this.parent.validationList) {
		  if (this.parent.validationList.hasOwnProperty(er)) {
			  if (!!this.parent.validationList[er].error) {
				  item = listItem.cloneNode(true);
				  itemLink = link.cloneNode(true);
				  itemLink.setAttribute('href', '#' + this.parent.validationList[er].id);
				  itemLink.setAttribute('id', er + '-error');
				  itemLink.innerHTML = this.parent.validationList[er].error;
				  item.appendChild(itemLink);
				  list.appendChild(item);
			  }
		  }
	  }

	  this.parent.DOMElement.insertBefore(listHolder, this.parent.DOMElement.firstChild);
  },
  toggleEnabled : function (els, reveal) {
	  for (var i = 0, el; el = els[i];++i) {
		  if (reveal !== null) {
			  el.parentNode.className = el.parentNode.className.split(' ' + this.parent.options.css.prefix + this.parent.options.css.disabledClass).join('');
			  el.removeAttribute('disabled');
		  } else {
			  el.parentNode.className = el.parentNode.className + ' ' + this.parent.options.css.prefix + this.parent.options.css.disabledClass;
			  el.setAttribute('disabled', 'disabled');
		  }
	  }
  }
};