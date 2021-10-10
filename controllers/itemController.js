

const admin = require('firebase-admin');
const firestore = admin.firestore();
const firebase = require('firebase-admin')
var stripJs = require('strip-js');
var fileHelper = require('../server');
var helper = require('../helper');

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

                // Check if auction ended
                if(helper.isAuctionEnded(doc.data().endDate)){

                    //Check if update winners before
                    if(doc.data().winner.length === 0){
                        updateAuctionWinner(id);
                    }
                }

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
                        var account_type = "Non";
                        res.render('product-info', {authenticated: false, accountType: account_type, itemRecord: item_record, biddingList : bidding_list});
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
        var item_image = fileHelper.getFileName();
        var item_keywords = itemKeywordsGenerator(stripJs(req.body.item_name));

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

        const auctionedItemRef = firestore.collection('auctionedItem');

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
            postedBy: posted_by,
            winner: "",
            keywords : item_keywords,
            created: firebase.firestore.Timestamp.fromDate(new Date())
        }).then((docRef)=>{

            //Add record to auctionedItem ref
            auctionedItemRef.add({
                itemID: docRef.id,
                itemImage: item_image,
                itemName : item_name,
                soldPrice: "-",
                paymentStatus: "-",
                paymentMethod: "-",
                paymentDate: "-",
                auctionStatus: "Ongoing",
                startingPrice: item_starting_price,
                startingDate : start_date,
                endDate : end_date,
                postedBy: posted_by,
                created: firebase.firestore.Timestamp.fromDate(new Date())
            }).then(()=>{
                res.redirect("/auctioneer-profile?item-posted");
            })
            
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

            if(req.session.userID){
                const bidListRef = firestore.collection('bidList').doc(id).collection(id);
                var account_type = req.session.userID.accountType;

                //Check if is bidder
                if(account_type == "bidder"){
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
                    var bid_by = req.session.userID.userID;

                    bidListRef.add({
                        BidderName : username,
                        BidPrice : bidPrice,
                        BidTime : bid_time,
                        BidBy: bid_by
                    }).then(()=>{

                        const itemRef = firestore.collection('items').doc(id);
                        const bidderHistory = firestore.collection('bidderHistory').doc(bid_by).collection(bid_by);

                        itemRef.get().then((doc)=>{

                            if(doc.exists){
                                //Add the data to BidderHistory
                                bidderHistory.add({
                                    itemID: id,
                                    itemImage: doc.data().itemImage,
                                    itemName: doc.data().itemName,
                                    startingPrice: doc.data().itemStartingPrice,
                                    startDate: doc.data().startingDate,
                                    endDate: doc.data().endDate,
                                    bidPrice : bidPrice,
                                    bidTime : bid_time,
                                    created: firebase.firestore.Timestamp.fromDate(new Date())
                                }).then(()=>{
                                    res.redirect('/product-info?item=' + id);
                                });
                            }
                            else{
                                res.redirect('/product-info?item=' + id);
                            }

                        });
                        
                    });
                }
                else{
                    res.redirect('/product-info?item=' + id + "&unauthorized=" + 'true');
                }
                
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

exports.delete_item = function (req, res){

    if(req.session.userID){ 
        const fs = require('fs');
        const path = require('path');

        //Get item id
        const itemID = req.params.id;
        const auctionedItemRef = firestore.collection('auctionedItem');
        const itemRef = firestore.collection('items').doc(itemID);
        const bidListRef = firestore.collection('bidList').doc(itemID);

        if(itemID.trim().length !== 0){

            //Get the auction item reference first
            auctionedItemRef.where("itemID", "==", itemID).get().then((querySnapshot)=>{

                var auction_item_id = "";
                var image_name = "";

                querySnapshot.forEach((doc)=>{
                    auction_item_id = doc.id;
                    image_name = doc.data().itemImage;
                });

                if(auction_item_id.trim().length !== 0){

                    //Delete Auction Item ref
                    auctionedItemRef.doc(auction_item_id).delete().then(()=>{

                        //Delete item ref
                        itemRef.delete().then(()=>{

                            //Delete bidding list reference
                            bidListRef.delete().then(()=>{

                                // delete item's image
                                fs.unlink(path.join(__dirname, "..", "upload", image_name), function (err) {
                                    if (err) throw err;
                                    // if no error, file has been deleted successfully
                                    console.log('File deleted!');

                                    //Redirect back to the auctioneer profile
                                    res.redirect('/auctioneer-profile?item-deleted');
                                });
                            })
                        });
                    });
                }
                else{
                    res.redirect('/?invalid-delete');
                }
            });
            
        }

    }
    else{
        res.redirect('/');
    }
}

function updateAuctionWinner(itemId){
    const itemRef = firestore.collection('items').doc(itemId);
    const bidingListRef = firestore.collection("bidList").doc(itemId).collection(itemId);
    var itemObject = new Object();

    //Get the bidder with the highest bid
    bidingListRef.orderBy("BidPrice", "desc").limit(1).get().then((querySnapshot)=>{

        querySnapshot.forEach((doc) => {

            if (doc.exists) {
                //Get the users ID
                var bid_by = doc.data().BidBy;
    
                itemRef.get().then((item_doc) => {
    
                    if(item_doc.exists){
    
                        itemObject.itemImage = item_doc.data().itemImage;
                        itemObject.itemName = item_doc.data().itemName;
                        itemObject.itemDescription = item_doc.data().itemDescription;
                        itemObject.itemRetailPrice = item_doc.data().itemRetailPrice;
                        itemObject.itemStartingPrice = item_doc.data().itemStartingPrice;
                        itemObject.minimumPerBid = item_doc.data().minimumPerBid,
                        itemObject.shippingFees = item_doc.data().shippingFees;
                        itemObject.itemCondition = item_doc.data().itemCondition;
                        itemObject.startingDate = item_doc.data().startingDate;
                        itemObject.endDate = item_doc.data().endDate;
                        itemObject.postedBy = item_doc.data().postedBy;
                        itemObject.winner= bid_by;
    
                        //Set the winner of the auction
                        itemRef.set(
                            itemObject
                        ).then(()=>{
                            
                            //Add the item to the winner's shopping cart
                            const shoppingCartRef = firestore.collection('shoppingCart').doc(bid_by).collection(itemId);
    
                            shoppingCartRef.add(itemObject)
                        });
                    }
                    else{
                        // item_doc.data() will be undefined in this case
                        console.log("No such document in item!");
                    }
                });
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document in biding list!" + itemId);
            }
        });
    });
}

function itemKeywordsGenerator(item_name){
    var item_lowercase = item_name.toLowerCase();
    var words_array = item_lowercase.split(" ");

    //break down letters
    for(var i = 1; i <= item_name.length; i++){
        words_array.push(item_lowercase.substring(0, i) );
    }

    //Push empty string
    words_array.push("");

    return words_array;
}