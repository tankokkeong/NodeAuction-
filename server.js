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
        res.render('home', {authenticated : true});
    }
    else{
        res.render('home', {authenticated : false});
    }

    res.end();
});

app.get("/home", (req, res) => {

    if(req.session.userID){
        res.render('home', {authenticated : true});
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
                userRecord.accountType = doc.data().AccountType
    
            }
    
            req.session.userID = userRecord;
            console.log(req.session)

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

        if(account_type == "bidder"){
            res.render('bidder-profile', {authenticated: true});
        }
        else{
            res.redirect("/");
        }
        
    }
    else{
        res.redirect("/");
    }
    
});

app.get("/auctioneer-profile", (req, res) => {

    if(req.session.userID){
        var account_type = req.session.userID.accountType;

        if(account_type == "seller"){
            res.render('auctioneer-profile', {authenticated: true});
        }
        else{
            res.redirect("/");
        }
        
    }
    else{
        res.redirect("/");
    }

});

app.get("/product-info", (req, res) => {

    if(req.session.userID){
        res.render('product-info', {authenticated: true});
    }
    else{
        res.render('product-info', {authenticated: false});
    }
    
});

app.get("/checkout", (req, res) => {

    if(req.session.userID){
        res.render('checkout', {authenticated: true});
    }else{
        res.render('checkout', {authenticated: false});
    }
    
});

app.get("/thankyou", (req, res) => {
    res.render('checkout');
});

app.get("/auctionResults", (req, res) => {
    if(req.session.userID){
        res.render('auctionResults', {authenticated: true});
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