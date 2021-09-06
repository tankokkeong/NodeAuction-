function loginNow()
{
    var login_now_message = document.getElementById("login-now");
    var signup_before = window.location.href.split("?")[1];

    if(signup_before === "loginNow")
    {
        //Display login now message
        login_now_message.style.display = "";
    }
}