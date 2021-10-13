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

function newDeliveryAddress(required){
    var address_form = document.getElementById("shipping-form");

    if(required){
        //Display form
        address_form.style.display = "";
    }
    else{
        //Remove form
        address_form.style.display = "none";
    }
}