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
}