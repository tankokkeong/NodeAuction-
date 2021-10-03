const express = require("express");
const admin = require('firebase-admin');
var bodyParser = require('body-parser')
var cors = require('cors')
var stripJs = require('strip-js');
var session = require('express-session');   
var helper = require('./helper.js');

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

// Controllers initializations
var homeController = require('./controllers/homeController');
var loginController = require('./controllers/loginController');
var signupController = require('./controllers/signupController');
var bidderController = require('./controllers/bidderController');
var auctioneerController = require('./controllers/auctioneerController');
var itemController = require('./controllers/itemController');
var uploadController = require('./controllers/uploadController');

app.get("/", homeController.home_page);

app.get("/home", homeController.home_page);

app.get("/login", loginController.login_page);

app.post("/login", loginController.process_login);

app.get("/signup", signupController.signup_page);

app.get("/bidder-profile", bidderController.bidder_profile_page);

app.post("/edit-bidder", bidderController.edit_bidder);

app.get("/auctioneer-profile", auctioneerController.auctionner_profile_page);

app.post("/edit-auctioneer", auctioneerController.edit_auctioneer);

app.post("/post-item", itemController.post_item);

app.get("/product-info", itemController.product_info_page);

app.post("/submitBid/:id", (req, res) => {

    //Get item id
    const id = req.params.id;
    const bidPrice = Number(stripJs(req.body.bid_price));

    if(id != ""){

        //Check number
        if(!isNaN(bidPrice)){
            const bidListRef = firestore.collection('bidList').doc(id).collection(id);

            if(req.session.userID){
                var account_type = req.session.userID.accountType;

                //Retrieve user input
                var username = req.session.userID.userName;

                //Bid Time
                // Get Current Timestamp
                var date = new Date();

                var months_array = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                // Get hour, minute, and second
                var time = helper.checkAMorPM(date.getHours(), helper.checkTimeDigit(date.getMinutes()), helper.checkTimeDigit(date.getSeconds()) );


                // Get date, month, and year
                var day = date.getDate(); 
                var month = months_array[date.getMonth()];
                var year = date.getFullYear();

                var bid_time = day + " " + month  + " " + year + ", " + time;

                bidListRef.add({
                    BidderName : username,
                    BidPrice : bidPrice,
                    BidTime : bid_time,
                }).then(()=>{
                    res.redirect('/product-info?item=' + id);
                });
                
            }
            else{
                res.redirect('/product-info?item=' + id + "&unauthorized=" + 'true');
            }
        }
        else{
            res.redirect('/');
        }
        

    }
    else{
        res.redirect('/');
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

app.get("/logout", loginController.logout);

app.get("/noscript", (req, res) => {
    res.render("noscript");

    res.end();
});

// 404 page
app.use((req, res) => {
    res.status(404).render('404', { title: '404' });
});