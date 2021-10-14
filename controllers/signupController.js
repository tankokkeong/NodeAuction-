const admin = require('firebase-admin');
const firestore = admin.firestore();
var stripJs = require('strip-js');

exports.signup_page = function(req, res){
    if(req.session.userID){
        res.redirect("/");
    }else{
        res.render('signup', {authenticated: false});
    }
}

exports.process_signup = function(req, res){

    var userID = stripJs(req.body.userID);
    var username = stripJs(req.body.username);
    var email = stripJs(req.body.email);
    var fullName = stripJs(req.body.fullName);
    var addressLine1 = stripJs(req.body.addressLine1);
    var addressLine2 = stripJs(req.body.addressLine2);
    var city = stripJs(req.body.city);
    var country = stripJs(req.body.country);
    var phoneNumber = stripJs(req.body.phoneNumber);
    var accountType = stripJs(req.body.accountType);

    admin
    .auth()
    .getUser(userID)
    .then((userRecord) => {

        // If user exists
        firestore.collection("users").doc(userID).set({
            Username: username,
            Email: email,
            FullName: fullName,
            AddressLine1: addressLine1,
            AddressLine2: addressLine2,
            City: city,
            Country: country,
            PhoneNumber : phoneNumber,
            AccountType: accountType
        }).then(()=>{
            res.redirect("login?loginNow");
        })
    })
    .catch((error) => {
        console.log('Error fetching user data:', error);
        res.end();
    });

   
}