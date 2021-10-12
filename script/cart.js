
var card_payment = true;
var card_payment_open = false;
var online_payment = true;
var online_payment_open = false;

$(document).ready(function(){

    $("#pay-with-card-trigger").click(function(){
        if(card_payment == true){
            
            $("#pay-with-card-form").slideToggle("slow");

            if(card_payment_open == false){
                card_payment_open = true;
                online_payment = false;

                //Disable online payment trigger
                $("#pay-with-online-trigger").css("opacity", "0.5");
                $("#pay-with-online-trigger").css("cursor", "not-allowed");
            }
            else{
                card_payment_open = false;
                online_payment = true;

                //Enable online payment trigger
                $("#pay-with-online-trigger").css("opacity", "1");
                $("#pay-with-online-trigger").css("cursor", "pointer");
            }
        }

    });

    $("#pay-with-online-trigger").click(function(){

        if(online_payment == true)
        {
            $("#pay-with-online-form").slideToggle("slow");

            if(online_payment_open == false){
                online_payment_open = true;
                card_payment = false;

                //Disable card payment trigger
                $("#pay-with-card-trigger").css("opacity", "0.5");
                $("#pay-with-card-trigger").css("cursor", "not-allowed");

            }
            else{
                online_payment_open = false;
                card_payment = true;

                //Enable card payment trigger
                $("#pay-with-card-trigger").css("opacity", "1");
                $("#pay-with-card-trigger").css("cursor", "pointer");
            }
        }
        
    });

    $("#checkout-btn").click(function(){

        var checkout_warning = document.getElementById("checkout-warning");

        if(card_payment == true && card_payment_open == true){
            var card_visa = document.getElementById("card-visa");
            var card_mastercard = document.getElementById("card-mastercard");
            var card_maestro = document.getElementById("card-maestro");
            var cardholder_name = document.getElementById("cardholder-name").value;
            var cardNumber = document.getElementById("card-number").value;
            var expiry_date = document.getElementById("expiry-date").value;
            var cvv = document.getElementById("cvv").value; 
            var error_count = 0;
            var error_checkout = document.getElementsByClassName("error-checkout");
            
            if(cardholder_name == "" || cardNumber== "" || expiry_date == "" || cvv == ""){

                //Display the warning
                checkout_warning.style.display = "";
                checkout_warning.innerHTML = "Please fill in all your credit card details!";
                
                //Remove alert after 3 seconds
                setTimeout(function(){
                    checkout_warning.style.display = "none";
                }, 3000);

                error_count++;
            }
            else if(card_visa.checked == false && card_mastercard.checked == false && card_maestro.checked == false){
                //Display the warning
                checkout_warning.style.display = "";
                checkout_warning.innerHTML = "Please fill in all your credit card details!";
                
                //Remove alert after 3 seconds
                setTimeout(function(){
                    checkout_warning.style.display = "none";
                }, 3000);

                error_count++;
            }

            //Check card type format
            if(card_visa.checked == false && card_mastercard.checked == false && card_maestro.checked == false){
                error_checkout[0].style.display = "";
                error_count++;
            }
            else
            {
                error_checkout[0].style.display = "none";
            }

            //Check cardholder name format
            if(cardholder_name.trim().length == 0){
                error_checkout[1].style.display = "";
                error_count++;
            }
            else
            {
                error_checkout[1].style.display = "none";
            }

            //Check card number format
            if(cardNumber.length != 19)
            {
                error_checkout[2].style.display = "";
                error_count++;
            }
            else
            {
                error_checkout[2].style.display = "none";
            }

            //Check expiry date format
            if(expiry_date.length != 5){
                error_checkout[3].style.display = "";
                error_count++;
            }
            else
            {
                error_checkout[3].style.display = "none";
            }

            //Check CVV format
            if(cvv.length != 3){
                error_checkout[4].style.display = "";
                error_count++;
            }
            else
            {
                error_checkout[4].style.display = "none";
            }


            if(error_count == 0)
            {
                window.location.href = "thankyou.html";
            }
            
        }
        else if(online_payment == true && online_payment_open == true)
        {
            var direct_debit = document.getElementById("direct-debit");
            var paypal = document.getElementById("paypal");
            var checkout_warning = document.getElementById("checkout-warning");
            var error_count = 0;

            if(direct_debit.checked == false && paypal.checked == false){
                //Display the warning
                checkout_warning.style.display = "";
                checkout_warning.innerHTML = "Please select the online payment method!";
                
                //Remove alert after 3 seconds
                setTimeout(function(){
                    checkout_warning.style.display = "none";
                }, 3000);

                error_count++;
            }

            if(error_count == 0)
            {
                window.location.href = "thankyou.html";
            }

        }
        else if(card_payment_open == false && online_payment_open == false){
            var checkout_warning = document.getElementById("checkout-warning");

            //Display the warning
            checkout_warning.style.display = "";
            checkout_warning.innerHTML = "Please select your payment method!";
            
            //Remove alert after 3 seconds
            setTimeout(function(){
                checkout_warning.style.display = "none";
            }, 3000);
        }

    });
});

function creditCardFormatter(){
    var cardNumber = document.getElementById("card-number").value;
    var expiry_date = document.getElementById("expiry-date").value;
    var key = event.keyCode || event.charCode;

    // Format card numbers
    if( key != 8 && key != 46 )
    {
        if(cardNumber.length < 18 && (cardNumber.length == 4 || cardNumber.length == 9 || cardNumber.length == 14)){
            document.getElementById("card-number").value = document.getElementById("card-number").value + " ";
        }
    }

    // For expiry date
    if(expiry_date.length == 2){
        document.getElementById("expiry-date").value = document.getElementById("expiry-date").value + "/";
    }
}

function creditCardNameValidation(){
    var characters_validation = /^[ A-Za-z]+$/;

    if (!characters_validation.test(event.key)) {
        event.preventDefault();
    }
}

function creditCardNumberValidation(){
    var digit_validation = /^[0-9]+$/;
    if (!digit_validation.test(event.key)) {
        event.preventDefault();
    }
}


function checkoutTimeLeft(endDate, display_id){

    // Set the date we're counting down to
    var display_container = document.getElementById(display_id);
    var end_date = new Date(endDate).getTime();
    var countDownDate = new Date(end_date +  (3600 * 1000 * 24) *7).getTime();

    // Update the count down every 1 second
    var x = setInterval(function() {

        // Get today's date and time
        var now = new Date().getTime();

        // Find the distance between now and the count down date
        var distance = countDownDate - now;

        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if(distance < 0){
            // If the count down is over, write some text 
            clearInterval(x);
            display_container.innerHTML =  "Checkout Time Ended";
        }
        else{
            display_container.innerHTML = days + " days  " + hours + " hours  " + minutes + " minutes " + seconds + " seconds"; 
        }
    }, 1000);
}

function cartProductRemoval(product_id){

    var cart_input = document.getElementById("cart-id-input");

    //Insert the id to the input
    cart_input.value = product_id;
}