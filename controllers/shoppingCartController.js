exports.shopping_cart_page = function(req, res){
    
    if(req.session.userID){
        var account_type = req.session.userID.accountType;
        var user_record = req.session.userID;

        if(account_type == "bidder"){
            res.render('shopping-cart', {authenticated: true, accountType : account_type, userRecord: user_record});
        }
        else{
            res.redirect("/");
        }
        
    }
    else{
        res.redirect("/");
    }
}