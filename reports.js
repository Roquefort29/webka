document.querySelector("#accept").addEventListener("click", function () {
  if ($("#btnSubmit").is(":disabled")) {
    $("#btnSubmit").removeAttr("disabled");
  } else {
    $("#btnSubmit").attr("disabled", "disabled");
  }
});

$(function () {
    var error_email = false;

    $("#form_email").focusout(function () {
      check_email();
    });

    function check_email() {
      var pattern = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      var email = $("#form_email").val();
      if (pattern.test(email) && email !== "") {
        $("#email_error_message").hide();
      } else {
        $("#email_error_message").html("Invalid Email");
        $("#email_error_message").show();
        $("#form_email").css("border", "2px solid #F90A0A");
        error_email = true;
      }
    }
    $("#registration_form").submit(function () {
      error_email = false;
      check_email();
  
      if (
        error_email === false
      ) {
        alert("Registration succesfull");
        return window.open("index.html",'_blank').focus();
      } else {
        alert("Please fill out the form correctly");
        return false;
      }
    });
  });




  
  