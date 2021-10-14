//Global variables
let current_user_id = "";
let current_username = "";
let account_type = "";
let checked_login = false;

function SignUpAccount(){
    var username = document.getElementById("username").value;
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirm-password").value;
    var fullName = document.getElementById("full-name").value;
    var addressLine1 = document.getElementById("address-line-1").value;
    var addressLine2 = document.getElementById("address-line-2").value;
    var city = document.getElementById("city").value;
    var country = document.getElementById("country").value;
    var phoneNumber = document.getElementById("phone-number").value;
    var accountType = document.getElementById("account-type").value;

    //Validation
    var characters_validation = /^[ A-Za-z]+$/;
    var digit_validation = /^[0-9]+$/;
    var email_validation = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    var hasNumber = /\d/;
    var hasCharacter = /[a-zA-Z]/;

    //Error Prompt
    var error_prompt = document.getElementsByClassName("error-prompt");
    var signup_error = document.getElementById("signup-error");
    var error_count = 0;

    //Loader
    var signup_loader = document.getElementById("signup-loader");

    //Display loader
    signup_loader.style.display = "";

    //Username validation
    if(username === "")
    {
        error_prompt[0].innerHTML = "Username cannot be empty!";
        error_count++;
    }
    else if (characters_validation.test(username) === false)
    {
        error_prompt[0].innerHTML = "Username should only contain characters!";
        error_count++;
    }
    else
    {
        error_prompt[0].innerHTML = "";
    }

    //Email validation
    if(email === "")
    {
        error_prompt[1].innerHTML = "Email cannot be empty!";
        error_count++;
    }
    else if(email_validation.test(email) === false)
    {
        error_prompt[1].innerHTML = "This email format is invalid!";
        error_count++;
    }
    else
    {
        error_prompt[1].innerHTML = "";
    }

    //Password validation
    if(password === "")
    {
        error_prompt[2].innerHTML = "Password cannot be empty!";
        error_count++;
    }
    else if (password.length < 6)
    {
        error_prompt[2].innerHTML = "Password length cannot be lesser than 6!";
        error_count++;
    }
    else if (hasNumber.test(password) === false)
    {
        error_prompt[2].innerHTML = "Password should contain at least one number!";
        error_count++;
    }
    else if(hasCharacter.test(password) === false)
    {
        error_prompt[2].innerHTML = "Password should contain at least one character!";
        error_count++;
    }
    else
    {
        error_prompt[2].innerHTML = "";
    }

    //Confirm Password validation
    if(confirmPassword === "")
    {
        error_prompt[3].innerHTML = "Confirm password cannot be empty!";
        error_count++;
    }
    else if(confirmPassword !== password)
    {
        error_prompt[3].innerHTML = "Confirm password does not match with password!";
        error_count++;
    }
    else
    {
        error_prompt[3].innerHTML = "";
    }

    //Full name validation
    if(fullName === "")
    {
        error_prompt[4].innerHTML = "Full name cannot be empty!";
        error_count++;
    }
    else if(characters_validation.test(fullName) === false)
    {
        error_prompt[4].innerHTML = "Full name can only contain characters!";
        error_count++;
    }
    else
    {
        error_prompt[4].innerHTML = "";
    }

    //Phone number validation
    if(phoneNumber === "")
    {
        error_prompt[5].innerHTML = "Phone number cannot be empty!";
        error_count++;
    }
    else if(digit_validation.test(phoneNumber) === false)
    {
        error_prompt[5].innerHTML = "Phone number should only contain numbers!";
        error_count++;
    }
    else
    {
        error_prompt[5].innerHTML = "";
    }

    //Address Line 1 validation
    if(addressLine1 === "")
    {
        error_prompt[6].innerHTML = "Address line 1 cannot be empty!";
        error_count++;
    }
    else
    {
        error_prompt[6].innerHTML = "";
    }

    //City validation
    if(city === "")
    {
        error_prompt[8].innerHTML = "City cannot be empty!";
        error_count++;
    }
    else
    {
        error_prompt[8].innerHTML = "";
    }

    //Country validation
    if(country === "")
    {
        error_prompt[9].innerHTML = "Country cannot be empty!";
        error_count++;
    }
    else
    {
        error_prompt[9].innerHTML = "";
    }

    
    
    //If no error then sign up
    if(error_count === 0)
    {
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((user) => {

            firebase.auth().onAuthStateChanged(function(user) {
                if (user)
                {
                   //Add user
                    $.ajax({
                        type: "POST",
                        url: "/signup",
                        data: {
                            userID: user.uid,
                            username: username,
                            email: email,
                            fullName: fullName,
                            addressLine1: addressLine1,
                            addressLine2: addressLine2,
                            city: city,
                            country: country,
                            phoneNumber: phoneNumber,
                            accountType: accountType,
                        },
                        success: function(result) {    
                            // Signed in 
                            window.location.href = "login?loginNow";
                        },
                        error: function(result) {
                            alert(result)
                        }
                    });
                }
            });
            
        })
        .catch((error)=>{
            signup_error.innerHTML = error.message;

            //Remove Loader
            signup_loader.style.display = "none";
        });
    }
    else
    {
        //Remove Loader
        signup_loader.style.display = "none";
    }

}

function login()
{
    email = document.getElementById("email").value;
    password = document.getElementById("password").value;
    error_prompt = document.getElementsByClassName("error-prompt");
    login_loader = document.getElementById("login-loader");
    error_count = 0;

    // Display Loader
    login_loader.style.display = "";

    // Clear the error prompt
    error_prompt.innerHTML = "";

    if(email === "")
    {
        //Remove loader
        login_loader.style.display = "none";

        // Display error
        error_prompt[0].innerHTML = "Email cannot be empty!";

        error_count++;
    }
    else
    {
        //Remove error
        error_prompt[0].innerHTML = "";
    }


    if (password === "")
    {
        //Remove loader
        login_loader.style.display = "none";

        // Display error
        error_prompt[1].innerHTML = "Password cannot be empty!";

        error_count++;
    }
    else
    {
        //Remove error
        error_prompt[1].innerHTML = "";
    }

    //If no error
    if(error_count === 0)
    {
        firebase.auth().signInWithEmailAndPassword(email, password)
        .then((user) => {
            // Signed in 

            fetch('/login', {
                method: 'POST', // or 'PUT'
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({uid: user.user.uid}),
            })
            .then((response) => {
                
                if(response.statusText === "account suspended"){
                    firebase.auth().signOut();
                    window.location.href = "login?account-suspended";
                }
                else{
                    window.location.href = "home";
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
            
        })
        .catch((error) => {
            // var errorCode = error.code;
            // var errorMessage = error.message;

            //Remove loader
            login_loader.style.display = "none";

            // Display error
            error_prompt[1].innerHTML = "Invalid username or password!";
        });
    }
    
}

function passwordReset()
{
    var auth = firebase.auth();
    email = document.getElementById("email").value;
    error_prompt = document.getElementById("error-prompt");
    reset_loader = document.getElementById("reset-loader");

    // Display the loader
    reset_loader.style.display = "";

    // Clear the error prompt
    error_prompt.innerHTML = "";

    // Email validation
    if(email === "")
    {
        error_prompt.innerHTML = "Email is required!";

        // Remove the loader
        reset_loader.style.display = "none";
    }
    else
    {
        auth.sendPasswordResetEmail(email).then(function() {

            // Email sent.
            window.location.href = "forgot-password?email-sent";

            // Remove the loader
            reset_loader.style.display = "none";
    
        }).catch(function(error) {
            // An error happened.
            // var errorCode = error.code;
            // var errorMessage = error.message;
    
            // Display error
            error_prompt.innerHTML = "Invalid email!";

            // Remove the loader
            reset_loader.style.display = "none";
    
        });
    }

}


function checkSignIn()
{
    // Check Login
    firebase.auth().onIdTokenChanged(function(user) {
        if (user) {
            // User is signed in or token was refreshed.
            checked_login = true;   

            current_user_id = user.uid;

            //Get User Info
            getUserInfo(current_user_id);
        }
    });

}

function logout()
{
    firebase.auth().signOut();

    window.location.href = "logout";
}

function getUserInfo(user_id)
{
    var UserRef = firestore.collection("users").doc(user_id);
    var user_status = document.getElementsByClassName("nav-item");
    var current_url = window.location.pathname;

    UserRef.get().then((doc) => {
        if (doc.exists) {
            //Assign user info to the global variables
            current_user_id = user_id;
            current_username = doc.data().Username;
            current_user_email = doc.data().Email;
            account_type = doc.data().AccountType
            console.log("success")

            // if(account_type == "bidder")
            // {
            //     //Show my profile and logout button
            //     user_status[1].innerHTML = '<a class="nav-link" href="bidder-profile">My profile</a>';
            //     user_status[2].innerHTML = '<a class="nav-link" onclick=\'logout()\' href="">Logout</a>';

            //     if(current_url == "/bidder-profile"){
            //         displayBidderProfile();
            //     }
            // }
            // else
            // {
            //     //Show my profile and logout button
            //     user_status[1].innerHTML = '<a class="nav-link" href="auctioneer-profile">My profile</a>';
            //     user_status[2].innerHTML = '<a class="nav-link" onclick=\'logout()\' href="">Logout</a>';

            //     if(current_url == "/auctioneer-profile"){
            //         displayBidderProfile();
            //     }
            // }
        }



        
    }).catch((error) => {
        console.log("Error getting document:", error);
    });

}

function enterSignIn()
{
    if (event.keyCode === 13) {
        event.preventDefault();
        login();
    }
}


function profileChanges(){
    var changed_url = window.location.href.split("?");
    var changes_alert = document.getElementById("changes-made");

    if(changed_url[1] == "edited"){
        //Display alert
        changes_alert.style.display = "";

        //Remove alert after 3 seconds
        setTimeout(function(){
            changes_alert.style.display = "none";
        }, 3000);
    }

}

function addPayment(){
    var payment_row = document.getElementById("payment-row");
    var no_payment = document.getElementById("no-payment");
    var payment_added = document.getElementById("payment-added");

    //Display Payment
    payment_row.style.display = "";
    payment_added.style.display = "";
    no_payment.style.display = "none";

    //Remove payment added alert after 3 seconds
    setTimeout(function(){
        payment_added.style.display = "none";
    }, 3000);
}

function deletePayment(){
    var payment_row = document.getElementById("payment-row");
    var no_payment = document.getElementById("no-payment");
    var payment_deleted = document.getElementById("payment-deleted");

    //Remove Payment
    payment_row.style.display = "none";
    payment_deleted.style.display = "";
    no_payment.style.display = "";
    

    //Remove payment deleted alert after 3 seconds
    setTimeout(function(){
        payment_deleted.style.display = "none";
        
    }, 3000);
}

function fileValidation(id)
{
    var file = document.getElementById(id).value;
    file = file.split(".");
    
    switch (file[1].toUpperCase()) {
        case 'JPG':
        case 'JPEG':
        case 'PNG':
            break;
        default:
            alert('Only jpg, jpeg and png images file type is allowed');
            document.getElementById(id).value = '';
    }
    
}

function dashboardSearch() {
    var search_input = document.getElementById("dashboard-search-input").value;

    //If user press the enter key
    if (event.keyCode === 13) {
        event.preventDefault();

        window.location.href = "auctionResults?item=" + search_input;
    }
}
