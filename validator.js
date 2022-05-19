function Validator(formSelector) {

    var _this = this;

  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }
  var formRules = {};

  /**
   * Quy ước tạo rule:
   * - Nếu có lỗi thì return `error message`
   * - Nếu không có lỗi thì return `undefined`
   */
  var validatorRules = {
    required: function (value) {
      return value ? undefined : `Vui lòng nhập trường này`;
    },
    email: function (value) {
      var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value) ? undefined : `Vui lòng nhập email`;
    },
    min: function (min) {
      return function (value) {
        return value.length >= min
          ? undefined
          : `Vui lòng nhập ít nhất ${min} kí tự`;
      };
    },
    max: function (max) {
      return function (value) {
        return value.length <= max
          ? undefined
          : `Vui lòng nhập tối đa ${max} kí tự`;
      };
    },
  };

  // lấy ra form element trong DOM theo `formSelector`
  var formElement = document.querySelector(formSelector);
  if (formElement) {
    var inputs = formElement.querySelectorAll("[name][rules]");

    for (var input of inputs) {
      var ruleInfo;
      var rules = input.getAttribute("rules").split("|");

      for (var rule of rules) {
        var isRuleHasValue = rule.includes(":");

        if (isRuleHasValue) {
          ruleInfo = rule.split(":");
          rule = ruleInfo[0];
        }

        var ruleFunc = validatorRules[rule];

        if (isRuleHasValue) {
          ruleFunc = ruleFunc(ruleInfo[1]);
        }

        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunc);
        } else {
          formRules[input.name] = [ruleFunc];
        }
      }

      console.log(formRules);

      // Lắng nghe sự kiện để validate (blur, change ...)

      input.onblur = handleValidate;
      input.oninput = handleClearError;
    }
    console.log(formRules);
  }
  function handleValidate(event) {
    // lấy thẻ input vì nếu không chấm target nó chỉ rả về FocusEvent không phải thẻ input
    console.log(event.target);
    var rules = formRules[event.target.name];
    var errorMessage;

    // Việc dùng find sẽ không đũng mục đích bài toán bạn có thể tham khảo cách viết này ở comment.js
    // tôi sẻ sử dụng cách này để viết dễ hiểu và đúng mục đích hơn
    for(var rule of rules) {
        errorMessage = rule(event.target.value);
        if(errorMessage) break;
    }

    // Nếu có lỗi thì hiển thị message lỗi ra UI
    if (errorMessage) {
      var formGroup = getParent(event.target, ".form-group");

      if (formGroup) {
        formGroup.classList.add("invalid");

        var formMessage = formGroup.querySelector(".form-message");
        if (formMessage) {
          formMessage.innerText = errorMessage;
        }
      }
    }
    console.log("errorMessage: ", errorMessage);
    return !errorMessage;
  }

  // Hàm clear message lỗi
  function handleClearError(event) {
    var formGroup = getParent(event.target, ".form-group");

    if (formGroup.classList.contains("invalid")) {
      formGroup.classList.remove("invalid");

      var formMessage = formGroup.querySelector(".form-message");

      if (formMessage) {
        formMessage.innerText = "";
      }
    }
  }




  // Xửa lý hàn vi submit form
  formElement.onsubmit = function (event) {
    event.preventDefault();

    var isValid = true;

    var inputs = formElement.querySelectorAll("[name][rules]");

    for (var input of inputs) {
      if (!handleValidate({ target: input })) {
        isValid = false;
      }
    }

    console.log("isValid: ", isValid);

    if (isValid) {
      if (typeof _this.onSubmit === "function") {
        var enableInputs = formElement.querySelectorAll("[name]");
        var formValues = Array.from(enableInputs).reduce(function (
          values,
          input
        ) {
          switch (input.type) {
            case "radio":
              values[input.name] = formElement.querySelector(
                'input[name="' + input.name + '"]:checked'
              ).value;
              break;
            case "checkbox":
              if (!input.matches(":checked")) {
                values[input.name] = "";
                return values;
              }
              if (!Array.isArray(values[input.name])) {
                values[input.name] = [];
              }
              values[input.name].push(input.value);
              break;
            case "file":
              values[input.name] = input.files;
              break;
            default:
              values[input.name] = input.value;
          }

          return values;
        },
        {});
        // Gọi lại hàm onSubmit và trả về giá trị của form
        _this.onSubmit(formValues);
      } else {
        formElement.submit();
      }
    }
  };
}
