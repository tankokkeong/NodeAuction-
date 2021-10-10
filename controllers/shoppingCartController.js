const admin = require('firebase-admin');
const firestore = admin.firestore();

exports.shopping_cart_page = function(req, res){
    
    if(req.session.userID){
        var account_type = req.session.userID.accountType;

        if(account_type == "bidder"){

            var user_id = req.session.userID.userID;
            const shoppingCartRef = firestore.collection('shoppingCart').doc(user_id).collection(user_id);
            var cart_item = [];

            shoppingCartRef.orderBy("created", "desc").get().then((querySnapshot)=>{
                querySnapshot.forEach((doc)=>{
                    cart_item.push(doc.data())
                })

                console.log(cart_item)
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