exports.checkout_page = function (req, res){
    if(req.session.userID){
        var account_type = req.session.userID.accountType;
        res.render('checkout', {authenticated: true}, {accountType: account_type});

    }else{
        res.render('checkout', {authenticated: false});
    }
}

exports.thankyou_page = function (req, res){
    res.render('checkout');
}