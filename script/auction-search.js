function auctionTimeLeft(endDate){
    // Set the date we're counting down to
    var countDownDate = new Date(endDate).getTime();

    // Get today's date and time
    var now = new Date().getTime();

    // Find the distance between now and the count down date
    var distance = countDownDate - now;
    
    // Time calculations for days, hours, minutes and seconds
    var days = Math.floor(distance / (1000 * 60 * 60 * 24));
    var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    if(distance < 0){
        return "Auction Ended";
    }
    else{
        return days + " days  " + hours + " hours  " + minutes + " minutes"; 
    }
}

function enterKeySearch(){
    var search_input = document.getElementById("search-input").value;

    //If user press the enter key
    if (event.keyCode === 13) {
        event.preventDefault();

        window.location.href = "auctionResults?item=" + search_input;
    }
}