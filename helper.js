module.exports = {

    checkTimeDigit: function(i){
        if(i<10)
        {
            i="0"+i;
        }
        
        return i;
    },
    checkAMorPM: function(hour, minute, second){
        if(hour < 12)
        {
            return this.checkTimeDigit(hour) + ":" + minute + ":" + second +" AM";
        }
        else
        {
            return this.checkTimeDigit(hour - 12) + ":" + minute + ":" + second + " PM";
        }
    },
    isAuctionEnded: function(endDate){
        // Set the date we're counting down to
        var countDownDate = new Date(endDate).getTime();

        // Get today's date and time
        var now = new Date().getTime();
            
        // Find the distance between now and the count down date
        var distance = countDownDate - now;

        // If the count down is over
        if (distance < 0) {
            return true;
        }
        else{
            return false;
        }
    },
}