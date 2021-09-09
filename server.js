const express = require("express");
const admin = require('firebase-admin');
var bodyParser = require('body-parser')
var cors = require('cors')
var stripJs = require('strip-js');
var session = require('express-session');   
var value = 0;


//Initialize firebase firestore
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const firestore = admin.firestore();

const app = express();
const PORT = process.env.PORT || 3000;

// Register view engine
app.set("view engine", "ejs");

app.use(cors());
app.listen(PORT);
console.log("Connected to Firebase")

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
})); 
app.use( bodyParser.json()); 

//Load static files
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true}));

//Session
app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge: 1000*60*60*2
    }
})) 

app.get("/", (req, res) => {

    if(req.session.userID){
        var account_type = req.session.userID.accountType;
        res.render('home', {authenticated : true, accountType: account_type});
    }
    else{
        res.render('home', {authenticated : false});
    }

    res.end();
});

app.get("/home", (req, res) => {

    if(req.session.userID){
        var account_type = req.session.userID.accountType;
        res.render('home', {authenticated : true, accountType: account_type});
    }
    else{
        res.render('home', {authenticated : false});
    }

    res.end();
});

app.get("/login", (req, res) => {

    if(req.session.userID){
        res.redirect("/");
    }
    else{
        res.render('login', {authenticated : false});
    }
    
});

app.post("/login", (req, res)=> {

    var uid = req.body.uid;

    admin
    .auth()
    .getUser(uid)
    .then((userRecord) => {
        //Set login session
        var UserRef = firestore.collection("users").doc(uid);

        var userRecord = new Object();

        //Get user details
        UserRef.get().then((doc) => {
            if (doc.exists) {
                //Assign user info to the global variables
                userRecord.userID = uid;
                userRecord.userName = doc.data().Username;
                userRecord.userEmail = doc.data().Email;
                userRecord.accountType = doc.data().AccountType;
                userRecord.addressLine1 =  doc.data().AddressLine1;
                userRecord.addressLine2 = doc.data().AddressLine2;
                userRecord.city = doc.data().City;
                userRecord.country = doc.data().Country;
                userRecord.fullName = doc.data().FullName;
                userRecord.phone = doc.data().PhoneNumber;
            }
    
            req.session.userID = userRecord;

            res.end();
            
        }).catch((error) => {
            console.log("Error getting document:", error);
            res.end();
        });
    })
    .catch((error) => {
        console.log('Error fetching user data:', error);
        res.end();
    });

});

app.get("/signup", (req, res) => {

    if(req.session.userID){
        res.redirect("/");
    }else{
        res.render('signup', {authenticated: false});
    }
    
});

app.get("/bidder-profile", (req, res) => {

    if(req.session.userID){
        var account_type = req.session.userID.accountType;
        var user_record = req.session.userID;

        if(account_type == "bidder"){
            res.render('bidder-profile', {authenticated: true, accountType : account_type, userRecord: user_record});
        }
        else{
            res.redirect("/");
        }
        
    }
    else{
        res.redirect("/");
    }
    
});

app.post("/edit-bidder", (req, res) => {

    if(req.session.userID){

        var account_type = req.session.userID.accountType;

        if(account_type == "bidder"){
            const userRef = firestore.collection('users').doc(req.session.userID.userID);

            //Retrieve user input
            var username = req.body.username;
            var full_name = req.body.full_name;
            var address_line_1 = req.body.address_line_1;
            var address_line_2 = req.body.address_line_2; 
            var city = req.body.city; 
            var country = req.body.country; 
            var phone_number = req.body.phone_number; 

            async function updateAuctioneer(){
                // update the user information
                const updateRespond = await userRef.update({
                    Username: username,
                    FullName : full_name,
                    AddressLine1 : address_line_1,
                    AddressLine2: address_line_2,
                    City : city,
                    Country : country,
                    PhoneNumber: phone_number
                }).then(()=>{
                    req.session.userID.userName = username;
                    req.session.userID.fullName = full_name;
                    req.session.userID.addressLine1 = address_line_1;
                    req.session.userID.addressLine2 = address_line_2;
                    req.session.userID.city = city;
                    req.session.userID.country = country;
                    req.session.userID.phone = phone_number;
                });

            }

            updateAuctioneer().then(()=>{
                res.redirect("/bidder-profile?edited");
            });
        }
        else{
            res.redirect("/bidder-profile");
        }

    }
    else{
        res.redirect("/");
    }

});

app.get("/auctioneer-profile", (req, res) => {

    if(req.session.userID){
        var account_type = req.session.userID.accountType;
        var user_record = req.session.userID;

        if(account_type == "seller"){
            res.render('auctioneer-profile', {authenticated: true, accountType : account_type, userRecord: user_record});
        }
        else{
            res.redirect("/");
        }
        
    }
    else{
        res.redirect("/");
    }

});

app.post("/edit-auctioneer", (req, res) => {

    if(req.session.userID){

        var account_type = req.session.userID.accountType;

        if(account_type == "seller"){
            const userRef = firestore.collection('users').doc(req.session.userID.userID);

            //Retrieve user input
            var username = req.body.username;
            var full_name = req.body.full_name;
            var address_line_1 = req.body.address_line_1;
            var address_line_2 = req.body.address_line_2; 
            var city = req.body.city; 
            var country = req.body.country; 
            var phone_number = req.body.phone_number; 

            async function updateAuctioneer(){
                // update the user information
                const updateRespond = await userRef.update({
                    Username: username,
                    FullName : full_name,
                    AddressLine1 : address_line_1,
                    AddressLine2: address_line_2,
                    City : city,
                    Country : country,
                    PhoneNumber: phone_number
                }).then(()=>{
                    req.session.userID.userName = username;
                    req.session.userID.fullName = full_name;
                    req.session.userID.addressLine1 = address_line_1;
                    req.session.userID.addressLine2 = address_line_2;
                    req.session.userID.city = city;
                    req.session.userID.country = country;
                    req.session.userID.phone = phone_number;
                });

            }

            updateAuctioneer().then(()=>{
                res.redirect("/auctioneer-profile?edited");
            });
        }else{
            res.redirect("/auctioneer-profile");
        }
        

    }
    else{
        res.redirect("/");
    }

});

app.get("/product-info/:id", (req, res) => {

    if(req.session.userID){
        var account_type = req.session.userID.accountType;
        res.render('product-info', {authenticated: true, accountType: account_type});
    }
    else{
        res.render('product-info', {authenticated: false});
    }
    
});

app.get("/checkout", (req, res) => {

    if(req.session.userID){
        var account_type = req.session.userID.accountType;
        res.render('checkout', {authenticated: true}, {accountType: account_type});

    }else{
        res.render('checkout', {authenticated: false});
    }
    
});

app.get("/thankyou", (req, res) => {
    res.render('checkout');
});

app.get("/auctionResults", (req, res) => {
    if(req.session.userID){
        var account_type = req.session.userID.accountType;

        res.render('auctionResults', {authenticated: true, accountType: account_type});
    }
    else{
        res.render('auctionResults', {authenticated: false});
    }
    
});

app.get("/logout", (req, res) => {

    req.session.destroy(function(err) {
        // cannot access session here
        console.log(err)
    });

    res.redirect("/");
});

app.get("/noscript", (req, res) => {
    res.render("noscript");

    res.end();
});

// 404 page
app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});