function postItemVerification(){
    var item_image = document.getElementById("item-image");
    var item_name = document.getElementById("item-name");
    var item_description = document.getElementById("item-description");
    var item_retail_price = document.getElementById("item-retail-price");
    var item_starting_price = document.getElementById("item-starting-price");
    var item_price_per_bid = document.getElementById("price-per-bid");
    var shipping_fee = document.getElementById("shipping-fee");
    var item_condition = document.getElementById("condition");
    var start_date = document.getElementById("start-date");
    var end_date = document.getElementById("end-date");
    var error_prompt = document.getElementsByClassName("error-prompt");
    var error_count = 0;
    var posted_successful = document.getElementById("posted-successful");

    //Validate item image
    if(item_image.value == "")
    {
        error_prompt[0].style.display = "";
        error_prompt[0].innerHTML = "Item image is required!";
        error_count++;
    }
    else
    {
        error_prompt[0].style.display = "none";
    }

    //Validate item name
    if(item_name.value == ""){
        error_prompt[1].style.display = "";
        error_prompt[1].innerHTML = "Item name is required!";
        error_count++;
    }
    else
    {
        error_prompt[1].style.display = "none";
    }

    //Validate item description value
    if(item_description.value == ""){
        error_prompt[2].style.display = "";
        error_prompt[2].innerHTML = "Item description is required!";
        error_count++;
    }
    else
    {
        error_prompt[2].style.display = "none";
    }

    //Validate item retail price value
    if(item_retail_price.value == ""){
        error_prompt[3].style.display = "";
        error_prompt[3].innerHTML = "Item retail price is required!";
        error_count++;
    }
    else
    {
        error_prompt[3].style.display = "none";
    }

    //Validate item starting price
    if(item_starting_price.value == ""){
        error_prompt[4].style.display = "";
        error_prompt[4].innerHTML = "Item starting price is required!";
        error_count++;
    }
    else
    {
        error_prompt[4].style.display = "none";
    }

    //Validate item price per bid 
    if(item_price_per_bid.value == ""){
        error_prompt[5].style.display = "";
        error_prompt[5].innerHTML = "Item price per bid is required!";
        error_count++;
    }
    else
    {
        error_prompt[5].style.display = "none";
    }

    //Validate shipping fee
    if(shipping_fee.value == ""){
        error_prompt[6].style.display = "";
        error_prompt[6].innerHTML = "Shipping fee is required!";
        error_count++;
    }
    else
    {
        error_prompt[6].style.display = "none";
    }

    //Validate start date
    if(start_date.value == ""){
        error_prompt[8].style.display = "";
        error_prompt[8].innerHTML = "Start date is required!";
        error_count++;
    }
    else
    {
        error_prompt[8].style.display = "none";
    }

    //Validate 
    if(end_date.value == ""){
        error_prompt[9].style.display = "";
        error_prompt[9].innerHTML = "End date is required!";
        error_count++;
    }
    else
    {
        error_prompt[9].style.display = "none";
    }

    console.log(auctionDateValidation(start_date.value, end_date.value))

    // Valid the date range
    if(auctionDateValidation(start_date.value, end_date.value) == "invalid start date"){
        error_prompt[8].style.display = "";
        error_prompt[8].innerHTML = "The start date time cannot be the past date time";
        error_count++;
    }
    else if (auctionDateValidation(start_date.value, end_date.value) == "invalid end date"){
        error_prompt[9].style.display = "";
        error_prompt[9].innerHTML = "The end date time cannot be earlier than the start date time";
        error_count++;
    }
    else if (auctionDateValidation(start_date.value, end_date.value) == "invalid date range"){
        error_prompt[9].style.display = "";
        error_prompt[9].innerHTML = "The duration of the auction should be at least 1 day!";
        error_count++;
    }

    if(error_count == 0){
        posted_successful.style.display = "";

        //Empty the form
        item_image.value = "";
        item_name.value = "" ;
        item_description.value = "";
        item_retail_price.value = "";
        item_starting_price.value = "";
        item_price_per_bid.value = "";
        shipping_fee.value = "";
        item_condition.value = "";
        start_date.value = "";
        end_date.value = "";

        return true;
    }
    else
    {
        return false;
    }
}

function auctionDateValidation(startDate, endDate){

    // Set the date we're counting down to
    var countDownDate = new Date(endDate).getTime();
    var startDateTime = new Date(startDate).getTime();
    
    // Get today's date and time
    var now = new Date().getTime();
    
    // Find the distance between now and the count down date
    var distance = countDownDate - startDateTime;

    if(startDateTime < now){
        return "invalid start date";
    }
    
    if (distance < 0) {
        return "invalid end date";
    }

    if(distance < 86400000){
        return "invalid date range";
    }

    return "";

}