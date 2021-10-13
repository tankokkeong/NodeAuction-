const admin = require('firebase-admin');
const firestore = admin.firestore();
const firebase = require('firebase-admin');
const stripe = require('stripe')('sk_test_51JjisWHuoCBZWlMWAiqpXcCadF2lToBkxX270VzWEAeFRFNadQljdOiWYIYKH998yuGwO3ZRRQxwdOq3z0hmgTJf007tYHK1t6');

exports.create_checkout_session = async function(req, res){

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
                unit_amount: 2000,
            },
            quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: 'http://localhost:3000/thankyou',
        cancel_url: 'http://localhost:3000/thankyoul',
    });

    res.redirect(303, session.url);
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

            //Remove item from the cart
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
            
        }
        else{
            res.redirect("/");
        }
        
    }
    else{
        res.redirect("/");
    }
}