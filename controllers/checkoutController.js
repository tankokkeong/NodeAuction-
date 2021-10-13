const admin = require('firebase-admin');
const firestore = admin.firestore();
const firebase = require('firebase-admin');

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

            // Delete items from the shopping cart
            shoppingCartRef.delete().then(()=>{
                paymentRecordsRef.add({
                    created: firebase.firestore.Timestamp.fromDate(new Date())
                });
            });

            res.render('thankyou');
        }
        else{
            res.redirect("/");
        }
        

    }else{
        res.redirect("/");
    }
}