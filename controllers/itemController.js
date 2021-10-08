

const admin = require('firebase-admin');
const firestore = admin.firestore();
var stripJs = require('strip-js');
var helper = require('../server');

exports.product_info_page = function(req, res){

    //Get item id
    var id = req.query.item ? req.query.item : ""; 

    if(id != ""){
        const itemRef = firestore.collection('items').doc(id);
        const bidListRef = firestore.collection('bidList').doc(id).collection(id);

        var item_record = new Object();
        var bidding_list = [];

        itemRef.get().then((doc) => {
            if (doc.exists) {
                item_record.itemID = id;
                item_record.itemName = doc.data().itemName;
                item_record.itemImage = doc.data().itemImage;
                item_record.itemDescription = doc.data().itemDescription;
                item_record.itemStartingPrice =  doc.data().itemStartingPrice;
                item_record.minimumPerBid = doc.data().minimumPerBid;
                item_record.startDate = doc.data().startingDate;
                item_record.endDate = doc.data().endDate;
                item_record.startingPrice = doc.data().itemStartingPrice;
                item_record.condition = doc.data().itemCondition;
                item_record.shippingFees = doc.data().shippingFees;

                // Get bidding list
                bidListRef.orderBy("BidPrice", "desc").get().then((bidListSnap) => {
                    bidListSnap.forEach(bidListDoc => {
                        bidding_list.push(bidListDoc.data());
                    });

                    if(req.session.userID){
                        var account_type = req.session.userID.accountType;
                        res.render('product-info', {authenticated: true, accountType: account_type, itemRecord: item_record, biddingList : bidding_list});
                    }
                    else{
                        res.render('product-info', {authenticated: false, itemRecord: item_record, biddingList : bidding_list});
                    }
                }).catch((error)=>{
                    console.log("Error getting document:", error);
                    res.redirect("/");
                });

            }
            
        }).catch((error) => {
            console.log("Error getting document:", error);
            res.redirect("/");
        });

    }
    else{
        res.redirect('/');
    }
}

exports.post_item = function(req, res){

    if(req.session.userID){

        //Get unique id for uploaded images
        var item_image = helper.getFileName();

        //Get user's input
        var item_name = stripJs(req.body.item_name);
        var item_description = stripJs(req.body.item_description);
        var item_retail_price = stripJs(req.body.item_retail_price);
        var item_starting_price = stripJs(req.body.item_starting_price);
        var minimum_per_bid = stripJs(req.body.minimum_price_per_bid);
        var shipping_fees = stripJs(req.body.shipping_fee);
        var condition = stripJs(req.body.condition);
        var start_date = stripJs(req.body.start_date).split("T");
        var end_date = stripJs(req.body.end_date).split("T");
        var posted_by = req.session.userID.userID;

        //Format the time
        start_date = start_date[0] + ", " + start_date[1];
        end_date = end_date[0] + ", " + end_date[1];


        firestore.collection('items').add({
            itemImage: item_image,
            itemName : item_name,
            itemDescription: item_description,
            itemRetailPrice: item_retail_price,
            itemStartingPrice: item_starting_price,
            minimumPerBid: minimum_per_bid,
            shippingFees : shipping_fees,
            itemCondition : condition,
            startingDate : start_date,
            endDate : end_date,
            postedBy: posted_by
        }).then(()=>{
            res.redirect("/auctioneer-profile");
        });
    }
    else{
        res.render('/', {authenticated: false});
    }
}

exports.submit_bid = function(req, res){

    //Get item id
    const id = req.params.id;
    const bidPrice = Number(stripJs(req.body.bid_price));

    if(id != ""){

        //Check number
        if(!isNaN(bidPrice)){
            const bidListRef = firestore.collection('bidList').doc(id).collection(id);

            if(req.session.userID){
                var account_type = req.session.userID.accountType;

                //Retrieve user input
                var username = req.session.userID.userName;

                //Bid Time
                // Get Current Timestamp
                var date = new Date();

                var months_array = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                // Get hour, minute, and second
                var time = helper.checkAMorPM(date.getHours(), helper.checkTimeDigit(date.getMinutes()), helper.checkTimeDigit(date.getSeconds()) );


                // Get date, month, and year
                var day = date.getDate(); 
                var month = months_array[date.getMonth()];
                var year = date.getFullYear();

                var bid_time = day + " " + month  + " " + year + ", " + time;

                bidListRef.add({
                    BidderName : username,
                    BidPrice : bidPrice,
                    BidTime : bid_time,
                }).then(()=>{
                    res.redirect('/product-info?item=' + id);
                });
                
            }
            else{
                res.redirect('/product-info?item=' + id + "&unauthorized=" + 'true');
            }
        }
        else{
            res.redirect('/');
        }
        

    }
    else{
        res.redirect('/');
    }
}