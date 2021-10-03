exports.signup_page = function(req, res){
    if(req.session.userID){
        res.redirect("/");
    }else{
        res.render('signup', {authenticated: false});
    }
}