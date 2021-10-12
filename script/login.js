function loginNow()
{
    var login_now_message = document.getElementById("login-now");
    var suspension_message = document.getElementById("account-suspension")
    var signup_before = window.location.href.split("?")[1];

    if(signup_before === "loginNow")
    {
        //Display login now message
        login_now_message.style.display = "";
    }
    else if(signup_before === "account-suspended"){
        //Display account suspension message
        suspension_message.style.display = "";
    }
}