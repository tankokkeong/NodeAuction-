let firstTimeBidPage = true;

function submitNewBidding(item_id, minimum_bid)
{
    var bidder_price = parseInt(document.getElementById("bid-input").value);
    var error_prompt = document.getElementById("error-prompt");
    var item_id = window.location.href.split("?item=")[1];
    var bidDoc = firestore.collection("bidList").doc(item_id).collection(item_id);
    var error_count = 0;
    

    if(checked_login)
    {   
        //Bidder_price validation
        if(bidder_price == "")
        {
            error_prompt.innerHTML = "Bid amount is required!";
            error_count++;
        }
        else
        {
            error_prompt.innerHTML = "";
            bidder_price = parseInt(bidder_price);
        }
    
        
        if(error_count == 0){

            bidDoc.orderBy("BidPrice", "desc").get().then((querySnapshot) => {
                if(querySnapshot.docs.length > 0)
                {
                    var next_bid_minimum =  parseInt(querySnapshot.docs[0].data().BidPrice) + parseInt(minimum_bid)

                    if(bidder_price < next_bid_minimum)
                    {
                        error_prompt.innerHTML = "Your bid price is lower than the minimum price per bid!";
                    }
                    else
                    {
                        $.ajax({
                            type: "POST",
                            url: "/submitBid/" + item_id,
                            data: {
                                bid_price: bidder_price
                            },
                            success: function(result) {    

                            },
                            error: function(result) {
                                alert(result)
                            }
                        });

                        //Display submit bid alert
                        displaySubmitBidAlert();
                    }
                }
                else
                {
                    $.ajax({
                        type: "POST",
                        url: "/submitBid/" + item_id,
                        data: {
                            bid_price: bidder_price
                        },
                        success: function(result) {    

                        },
                        error: function(result) {
                            alert(result)
                        }
                    });

                    //Display submit alert
                    displaySubmitBidAlert();
                }
            });


        }
    }
    else
    {
        error_prompt.innerHTML = "Please login to start bidding!";
    }
    

}

function displayBidList(minimum_per_bid)
{
    var item_id = window.location.href.split("?item=")[1];
    var bid_list = document.getElementById("bidding-list");
    var bidDoc = firestore.collection("bidList").doc(item_id).collection(item_id);


    bidDoc.orderBy("BidPrice", "desc").onSnapshot((querySnapshot) => {

        //row count
        var row_count = 0;

        //bidDoc.orderBy("bid_price", "desc").limit(10).get().then((querySnapshot) => {

        bidDoc.orderBy("BidPrice", "desc").get().then((querySnapshot) => {
            
            //Remove previous value 
            bid_list.innerHTML = "";

            //Destroy the old Datatable
            destroyDatatable();

            querySnapshot.forEach((bid) => {

                row_count++;
    
                if(row_count == 1)
                {
                    bid_list.innerHTML = bid_list.innerHTML + 
                    "<tr>" +
                    "<th scope='row'>" + row_count + "</th>" + 
                    "<td>" + bid.data().BidderName + "</td>" +
                    "<td> $" + priceFormatter(bid.data().BidPrice) + "</td>" +
                    "<td>" + bid.data().BidTime + "</td>" + 
                    "</tr>"; 

                    //Update current bid amount
                    updateCurrentBid(parseInt(bid.data().BidPrice), minimum_per_bid);

                    //Display outbid alert
                    outbidAlert(bid.data().BidderName);
                }
                else
                {
                    bid_list.innerHTML = bid_list.innerHTML + 
                    "<tr>" +
                    "<th scope='row'>" + row_count + "</th>" + 
                    "<td>" + bid.data().BidderName + "</td>" +
                    "<td> $" + priceFormatter(bid.data().BidPrice) + "</td>" +
                    "<td>" + bid.data().BidTime + "</td>" + 
                    "</tr>"; 
                }
            });

            if(querySnapshot.docs.length == 0)
            {
                bid_list.innerHTML = "<tr>" +
                "<th scope='row' colspan='4'> No bid history now</th>" + 
                "<th style='display:none;'></th>" + 
                "<th style='display:none;'></th>" + 
                "<th style='display:none;'></th>" + 
                "</tr>"; 

                //Display outbid alert
                outbidAlert('');
            }

            //Display table
            initializeDataTable();

        });
    });

}

function priceFormatter(price)
{
    return Number(price).toLocaleString("en-GB");
}


function initializeDataTable(){

    $(document).ready( function () {
        //Create new Datatable
        $('#bidding-history-table').DataTable();

    } );
}

function destroyDatatable(){
    $('#bidding-history-table').DataTable().clear().destroy();
}

function displaySubmitBidAlert()
{
    var outbid_alert = document.getElementById("submit-alert");

    //Display submit bid alert
    outbid_alert.innerHTML = 
    '<div class="alert alert-success alert-dismissible fade show" role="alert">' +
        'Successfully submit your bid!' + 
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
            '<span aria-hidden="true">&times;</span>' +
        '</button>' +
    '</div>';

    //Clear input
    document.getElementById("bid-input").value = "";
}

function updateCurrentBid(bidAmount, minimumBid)
{
    var currentBidAmount = document.getElementById("current-bid-amount");
    var placeBidMessage = document.getElementById("place-bid-message");

    //Update current Bid Amount
    currentBidAmount.innerHTML = "$ " + bidAmount;
    placeBidMessage.innerHTML = "place $ " + (parseInt(bidAmount)+ parseInt(minimumBid)) + " or more";
}

function outbidAlert(outbidder)
{
    var outbidAlert = document.getElementById("outbid-alert");
    var outbidAudio = document.getElementById("outbid-audio");

    if(outbidder.trim() != ""){
        //Display outbid message
        outbidAlert.innerHTML = outbidder + " just outbids everyone in this bidding!";
    }

    if(firstTimeBidPage === true)
    {
        firstTimeBidPage = false;
    }
    else
    {
        // Display outbid alert audio
        outbidAudio.play();
    }

}