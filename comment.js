    rules.find(function (rule) {
      /**
                 *  errorMessage = rule(event.target.value);
                    nếu errorMessage nó không trả về lỗi thì không tìm
                    chỉ tìm những error message
                    trã errorMessage là 1 chuỗi trả về thì ta sẽ trả về 1 function
                 */
      errorMessage = rule(event.target.value);
      return errorMessage;
    });