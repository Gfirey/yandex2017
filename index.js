MyForm = {
   validator: {
      fio: function (fio) {
         return typeof fio === 'string' && fio.split(' ').length === 3;
      },
      email: function (email) {
         return typeof email === 'string' && email.match(/.+@(ya.ru|yandex.ru|yandex.ua|yandex.by|yandex.kz|yandex.com)/g);
      },
      phone: function (phone) {
         // Номер телефона в формате +7(999)999-99-99:
         var reg = /^\+7\(([0-9]{3})\)([0-9]{3})\-([0-9]{2})\-([0-9]{2})$/;
         return typeof phone === 'string' &&
            reg.test(phone) &&
            phone.match(/\d/g) !== null &&
            phone.match(/\d/g).reduce(function (sum, value) {
               return +sum + +value;
            }, 0) <= 30;
      }
   },
   validate: function () {
      var self = this,
         isValid = true,
         errorFields = [],
         data = this.getData();
      for (key in data) {
         if (!self.validator[key](data[key])) {
            isValid = false;
            errorFields.push(key);
         }
      }
      return {isValid: isValid, errorFields: errorFields}
   },

   getData: function () {
      var form = document.forms.myForm;
      return {
         fio: form.fio.value,
         email: form.email.value,
         phone: form.phone.value
      };
   },

   setData: function (obj) {
      var form = document.forms.myForm;
      form.fio.value = obj.fio;
      form.email.value = obj.email;
      form.phone.value = obj.phone;
   },
   submit: function () {
      var valid = MyForm.validate(),
         errorElements = document.getElementsByClassName('error');
      Array.prototype.forEach.call(errorElements, function (elem) {
         elem.classList.toggle('error', false)
      });

      if (valid.isValid) {
         MyForm._setDisableBtn(true);
         MyForm._sendRequset(MyForm._getAction(), MyForm._response);
      } else {
         valid.errorFields.forEach(function (id) {
            document.getElementById(id).classList.toggle('error', true);
         });
      }
   },

   _getAction: function () {
      return document.forms.myForm.action;
   },
   _setDisableBtn: function (bool) {
      document.getElementById('submitButton').disabled = bool;
   },
   _changedInput: function (input) {
      input.classList.toggle('error', false)
   },
   _sendRequset: function (path, callback) {
      var httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = function () {
         if (httpRequest.readyState === 4 && httpRequest.status === 200) {
            var data = JSON.parse(httpRequest.responseText);
            if (callback) callback(data);
         }
      };
      httpRequest.open('POST', path);
      httpRequest.send(JSON.stringify(MyForm.getData()));
   },
   _response: function (data) {
      var resultContainer = document.getElementById('resultContainer');
      switch (data.status) {
         case 'success':
            resultContainer.className = 'success';
            resultContainer.textContent = 'Success';
            break;
         case 'error':
            resultContainer.className = 'error';
            resultContainer.textContent = data.reason;
            break;
         case 'progress':
            resultContainer.className = 'progress';
            resultContainer.textContent += '.';
            setTimeout(MyForm.submit, data.timeout);
            break;
         default:
            resultContainer.className = '';
            resultContainer.textContent = '';
            break;
      }
      MyForm._setDisableBtn(false);
   }
};
