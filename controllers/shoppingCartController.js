const admin = require('firebase-admin');
const firestore = admin.firestore();
const firebase = require('firebase-admin');
var helper = require('../helper');
const stripe = require('stripe')('sk_test_51JjisWHuoCBZWlMWAiqpXcCadF2lToBkxX270VzWEAeFRFNadQljdOiWYIYKH998yuGwO3ZRRQxwdOq3z0hmgTJf007tYHK1t6');

exports.create_checkout_session = async function(req, res){

    var user_id = req.session.userID.userID;
    const shoppingCartRef = firestore.collection('shoppingCart').doc(user_id).collection(user_id);

    //Get the item from user's shopping cart
    var total_price = 0;

    shoppingCartRef.orderBy("created", "desc").get().then((querySnapshot)=>{
        querySnapshot.forEach((doc)=>{
            
            //Add up all the price
            total_price = total_price + parseFloat(doc.data().soldPrice); //Sold price
            total_price = total_price + parseFloat(doc.data().shippingFees); //shipping fees

        })

        //Call make payment method
        makePayment(total_price).then((url)=>{
            res.redirect(url);
        });

    })

}

exports.shopping_cart_page = function(req, res){
    
    //Update shopping cart
    updateShoppingCart(req).then(()=>{
        if(req.session.userID){
            var account_type = req.session.userID.accountType;

            if(account_type == "bidder"){

                var user_id = req.session.userID.userID;
                const shoppingCartRef = firestore.collection('shoppingCart').doc(user_id).collection(user_id);

                var cart_item = [];

                shoppingCartRef.orderBy("created", "desc").get().then((querySnapshot)=>{
                    querySnapshot.forEach((doc)=>{
                        var cart_object = new Object(doc.data());
                        cart_object.cartID = doc.id;
                        cart_item.push(cart_object)
                    })

                    res.render('shopping-cart', {authenticated: true, accountType : account_type, cartItem: cart_item});
                })
                
            }
            else{
                res.redirect("/");
            }
            
        }
        else{
            res.redirect("/");
        }
    });
}

exports.remove_cart_item = function (req, res){

    if(req.session.userID){
        var account_type = req.session.userID.accountType;

        if(account_type == "bidder"){

            var user_id = req.session.userID.userID;
            var cart_id = req.body.cart_id;
            const shoppingCartRef = firestore.collection('shoppingCart').doc(user_id).collection(user_id).doc(cart_id);
            const removedCartRecordsRef = firestore.collection("removedCartRecords");

            //Update auctioned item ref
            shoppingCartRef.get().then((doc)=>{

                //If exist
                if(doc.exists){

                    //Update the auctioned item ref
                    const auctionedItemRef = firestore.collection('auctionedItem');

                    auctionedItemRef.where("itemID", "==", doc.data().itemID).get().then((itemQuery)=>{
                        itemQuery.forEach((itemDoc)=>{
                            var itemObject = new Object();

                            itemObject.itemID = itemDoc.data().itemID,
                            itemObject.itemImage = itemDoc.data().itemImage,
                            itemObject.itemName = itemDoc.data().itemName,
                            itemObject.soldPrice = doc.data().soldPrice,
                            itemObject.paymentStatus = "Canceled by the buyer",
                            itemObject.paymentDate = "Not available",
                            itemObject.auctionStatus = "Ended",
                            itemObject.startingPrice = itemDoc.data().startingPrice,
                            itemObject.startingDate  = itemDoc.data().startingDate,
                            itemObject.endDate = itemDoc.data().endDate,
                            itemObject.postedBy = itemDoc.data().postedBy,
                            itemObject.created = itemDoc.data().created

                            //Update the auctioned item ref
                            auctionedItemRef.doc(itemDoc.id).set(itemObject);
                        });

                        //Delete item from the cart
                        shoppingCartRef.delete().then(()=>{

                            //Add the remove record
                            removedCartRecordsRef.add({
                                removedBy: user_id,
                                cartID: cart_id,
                                created: firebase.firestore.Timestamp.fromDate(new Date())
                            }).then(()=>{
                                res.redirect("/shopping-cart");
                            })
                        });
                    });
                }
            })
            
            
        }
        else{
            res.redirect("/");
        }
        
    }
    else{
        res.redirect("/");
    }
}

async function updateShoppingCart(req){
    var user_id = req.session.userID.userID;
    const cartCheck = firestore.collection("cartChecked").doc(user_id).collection("isBidding");

    //Check cart item
    cartCheck.get().then((cartQuery)=>{
        cartQuery.forEach((cart)=>{

            const itemRef = firestore.collection('items').doc(cart.id);
            
            itemRef.get().then((item)=>{
                // Check if auction ended
                if(helper.isAuctionEnded(item.data().endDate)){

                    //Check if update winners before
                    if(item.data().winner.length === 0){
                        updateAuctionWinner(item.id).then(()=>{

                            //Delete the cart check
                            cartCheck.doc(cart.id).delete();
                        });
                    }
                }
            })
        });

        return true;
    });
}

async function updateAuctionWinner(itemId){
    const itemRef = firestore.collection('items').doc(itemId);
    const bidingListRef = firestore.collection("bidList").doc(itemId).collection(itemId);
    var itemObject = new Object();

    //Get the bidder with the highest bid
    bidingListRef.orderBy("BidPrice", "desc").limit(1).get().then((querySnapshot)=>{

        querySnapshot.forEach((doc) => {

            if (doc.exists) {
                //Get the users ID
                var bid_by = doc.data().BidBy;
                var sold_price = doc.data().BidPrice
    
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
                        itemObject.soldPrice = sold_price;
                        itemObject.keywords = item_doc.data().keywords;
                        itemObject.created = firebase.firestore.Timestamp.fromDate(new Date());
    
                        //Set the winner of the auction
                        itemRef.set(
                            itemObject
                        ).then(()=>{
                            
                            //Add the item to the winner's shopping cart
                            const shoppingCartRef = firestore.collection('shoppingCart').doc(bid_by).collection(bid_by).doc(itemId);

                            itemObject.itemID = itemId;
    
                            shoppingCartRef.set(itemObject)

                            const auctionedItemRef = firestore.collection('auctionedItem');

                            //Update the auctioned item ref
                            auctionedItemRef.where("itemID", "==", itemId).get().then((auctionItemSnapshot)=>{
                                auctionItemSnapshot.forEach((auctionItem)=>{
                                    var auctionItemObject = new Object();

                                    auctionItemObject.itemID = itemId;
                                    auctionItemObject.itemImage = auctionItem.data().itemImage;
                                    auctionItemObject.itemName = auctionItem.data().itemName;
                                    auctionItemObject.soldPrice = sold_price;
                                    auctionItemObject.paymentStatus = "Unpaid";
                                    auctionItemObject.paymentDate = "-";
                                    auctionItemObject.auctionStatus = "Ended";
                                    auctionItemObject.startingPrice = auctionItem.data().startingPrice;
                                    auctionItemObject.startingDate = auctionItem.data().startingDate;
                                    auctionItemObject.endDate = auctionItem.data().endDate;
                                    auctionItemObject.postedBy = auctionItem.data().postedBy;
                                    auctionItemObject.created = auctionItem.data().created;

                                    auctionedItemRef.doc(auctionItem.id).set(auctionItemObject);
                                });
                            });
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

async function makePayment(payment_amount){
    const session = await stripe.checkout.sessions.create({
        payment_method_types: [
            'card',
            'fpx',
            'grabpay',
        ],
        line_items: [
            {
            price_data: {
                currency: 'myr',
                product_data: {
                name: 'Bidding Deal',
                },
                unit_amount: payment_amount * 100,
            },
            quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: 'http://localhost:3000/thankyou',
        cancel_url: 'http://localhost:3000/bidder-profile?payment-cancelled',
    });

    return session.url;
}