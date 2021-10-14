const admin = require('firebase-admin');
const firestore = admin.firestore();
const firebase = require('firebase-admin');
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