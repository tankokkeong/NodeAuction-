const admin = require('firebase-admin');
const firestore = admin.firestore();
const firebase = require('firebase-admin');
var helper = require('../helper');

exports.checkout_page = function (req, res){
    if(req.session.userID){
        var account_type = req.session.userID.accountType;
        res.render('checkout', {authenticated: true}, {accountType: account_type});

    }else{
        res.render('checkout', {authenticated: false});
    }
}

exports.thankyou_page = function (req, res){
    if(req.session.userID){
        var account_type = req.session.userID.accountType;

        if(account_type === "bidder"){

            var user_id = req.session.userID.userID;
            const shoppingCartRef = firestore.collection('shoppingCart').doc(user_id).collection(user_id);
            const paymentRecordsRef = firestore.collection('paymentRecord').doc(user_id).collection(user_id);

            // Add the item from shopping cart to payment records
            shoppingCartRef.get().then((querySnapshot)=>{

                querySnapshot.forEach((doc)=>{
                    paymentRecordsRef.add({
                        itemImage: doc.data().itemImage,
                        itemName: doc.data().itemName,
                        itemStartingPrice: doc.data().itemStartingPrice,
                        soldPrice: doc.data().soldPrice,
                        startingDate: doc.data().startingDate,
                        endDate: doc.data().endDate,
                        paymentStatus: "Successful",
                        paymentDate: getCurrentDate(),
                        created: firebase.firestore.Timestamp.fromDate(new Date())
                    });

                    var itemID = doc.id
                    const auctionedItemRef = firestore.collection('auctionedItem');

                    auctionedItemRef.where("itemID", "==", itemID).get().then((itemQuery)=>{
                        itemQuery.forEach((itemDoc)=>{
                            var itemObject = new Object();

                            itemObject.itemID = itemDoc.data().itemID,
                            itemObject.itemImage = itemDoc.data().itemImage,
                            itemObject.itemName = itemDoc.data().itemName,
                            itemObject.soldPrice = doc.data().soldPrice,
                            itemObject.paymentStatus = "Successful",
                            itemObject.paymentDate = getCurrentDate(),
                            itemObject.auctionStatus = "Ended",
                            itemObject.startingPrice = itemDoc.data().startingPrice,
                            itemObject.startingDate  = itemDoc.data().startingDate,
                            itemObject.endDate = itemDoc.data().endDate,
                            itemObject.postedBy = itemDoc.data().postedBy,
                            itemObject.created = itemDoc.data().created

                            //Update the auctioned item ref
                            auctionedItemRef.doc(itemDoc.id).set(itemObject);
                        });
                    });

                    const deleteShoppingCartRef = firestore.collection('shoppingCart').doc(user_id).collection(user_id).doc(itemID);

                    // Delete items from the shopping cart
                    deleteShoppingCartRef.delete();
                });
                res.render('thankyou');

            });
            
        }
        else{
            res.redirect("/");
        }
        

    }else{
        res.redirect("/");
    }
}

function getCurrentDate(){
    var date = new Date();

    var months_array = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Get hour, minute, and second
    var time = helper.checkAMorPM(date.getHours(), helper.checkTimeDigit(date.getMinutes()), helper.checkTimeDigit(date.getSeconds()) );


    // Get date, month, and year
    var day = date.getDate(); 
    var month = months_array[date.getMonth()];
    var year = date.getFullYear();

    return day + " " + month  + " " + year + ", " + time;
}