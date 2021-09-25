const express = require("express");
const admin = require('firebase-admin');
const multer  = require('multer');
const { v4: uuidv4 } = require('uuid');
var bodyParser = require('body-parser')
var cors = require('cors')
var stripJs = require('strip-js');
var session = require('express-session');   
var helper = require('./helper.js');
var file_name = "";

//Store the image
const storage = multer.diskStorage({
    destination:(req, file, cb)=>{
        cb(null, 'upload');
    },
    filename: (req, file, cb) => {
        const { originalname } = file;
        file_name = uuidv4() + "-" + originalname;
        cb(null, file_name);
    }
});

const upload = multer({ storage: storage }); // or simply { dest: 'uploads/' }


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

    const itemRef = firestore.collection('items');
    var item_array = [];

    itemRef.get().then((querySnapshot) => {
        querySnapshot.forEach((item) => {
            var itemObject = {
                itemID : item.id,
                startingDate: item.data().startingDate,
                itemImage: item.data().itemImage,
                itemRetailPrice: item.data().itemRetailPrice,
                itemDescription: item.data().itemDescription,
                minimumPerBid: item.data().minimumPerBid,
                itemName: item.data().itemName,
                shippingFees: item.data().shippingFees,
                itemCondition: item.data().itemCondition,
                itemStartingPrice: item.data().itemStartingPrice,
                endDate: item.data().endDate
            };

            item_array.push(itemObject);
        });


        if(req.session.userID){
            var account_type = req.session.userID.accountType;
            res.render('home', {authenticated : true, accountType: account_type, itemArray: item_array});
        }
        else{
            res.render('home', {authenticated : false, itemArray: item_array});
        }
    
        res.end();

    }, err => {
        console.log(`Encountered error: ${err}`);

        if(req.session.userID){
            var account_type = req.session.userID.accountType;
            res.render('home', {authenticated : true, accountType: account_type, itemArray: item_array});
        }
        else{
            res.render('home', {authenticated : false, itemArray: item_array});
        }
    
        res.end();
    });
});

app.get("/home", (req, res) => {

    const itemRef = firestore.collection('items');
    var item_array = [];

    itemRef.get().then((querySnapshot) => {
        querySnapshot.forEach((item) => {
            var itemObject = {
                itemID : item.id,
                startingDate: item.data().startingDate,
                itemImage: item.data().itemImage,
                itemRetailPrice: item.data().itemRetailPrice,
                itemDescription: item.data().itemDescription,
                minimumPerBid: item.data().minimumPerBid,
                itemName: item.data().itemName,
                shippingFees: item.data().shippingFees,
                itemCondition: item.data().itemCondition,
                itemStartingPrice: item.data().itemStartingPrice,
                endDate: item.data().endDate
            };

            item_array.push(itemObject);
        });


        if(req.session.userID){
            var account_type = req.session.userID.accountType;
            res.render('home', {authenticated : true, accountType: account_type, itemArray: item_array});
        }
        else{
            res.render('home', {authenticated : false, itemArray: item_array});
        }
    
        res.end();

    }, err => {
        console.log(`Encountered error: ${err}`);

        if(req.session.userID){
            var account_type = req.session.userID.accountType;
            res.render('home', {authenticated : true, accountType: account_type, itemArray: item_array});
        }
        else{
            res.render('home', {authenticated : false, itemArray: item_array});
        }
    
        res.end();
    });

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

app.post("/post-item", upload.single('file_upload'), (req, res) => {

    if(req.session.userID){

        console.log(req.file)

        //Get unique id for uploaded images
        var item_image = file_name;

        //Get user's input
        var item_name = stripJs(req.body.item_name);
        var item_description = stripJs(req.body.item_description);
        var item_retail_price = stripJs(req.body.item_retail_price);
        var item_starting_price = stripJs(req.body.item_starting_price);
        var minimum_per_bid = stripJs(req.body.minimum_price_per_bid);
        var shipping_fees = stripJs(req.body.shipping_fee);
        var condition = stripJs(req.body.condition);
        var start_date = stripJs(req.body.start_date).split("T");
        var end_date = stripJs(req.body.end_date).split("T");

        //Format the time
        start_date = start_date[0] + ", " + start_date[1];
        end_date = end_date[0] + ", " + end_date[1];


        firestore.collection('items').add({
            itemImage: item_image,
            itemName : item_name,
            itemDescription: item_description,
            itemRetailPrice: item_retail_price,
            itemStartingPrice: item_starting_price,
            minimumPerBid: minimum_per_bid,
            shippingFees : shipping_fees,
            itemCondition : condition,
            startingDate : start_date,
            endDate : end_date
        }).then(()=>{
            res.redirect("/auctioneer-profile");
        });
    }
    else{
        res.render('/', {authenticated: false});
    }
    
});

app.get("/product-info", (req, res) => {

    //Get item id
    var id = req.query.item ? req.query.item : ""; 

    if(id != ""){

        const itemRef = firestore.collection('items').doc(id);
        const bidListRef = firestore.collection('bidList').doc(id).collection(id);

        var item_record = new Object();
        var bidding_list = [];

        itemRef.get().then((doc) => {
            if (doc.exists) {
                item_record.itemID = id;
                item_record.itemName = doc.data().itemName;
                item_record.itemImage = doc.data().itemImage;
                item_record.itemDescription = doc.data().itemDescription;
                item_record.itemStartingPrice =  doc.data().itemStartingPrice;
                item_record.minimumPerBid = doc.data().minimumPerBid;
                item_record.startDate = doc.data().startingDate;
                item_record.endDate = doc.data().endDate;
                item_record.startingPrice = doc.data().itemStartingPrice;
                item_record.condition = doc.data().itemCondition;
                item_record.shippingFees = doc.data().shippingFees;

                // Get bidding list
                bidListRef.orderBy("BidPrice", "desc").get().then((bidListSnap) => {
                    bidListSnap.forEach(bidListDoc => {
                        bidding_list.push(bidListDoc.data());
                    });

                    if(req.session.userID){
                        var account_type = req.session.userID.accountType;
                        res.render('product-info', {authenticated: true, accountType: account_type, itemRecord: item_record, biddingList : bidding_list});
                    }
                    else{
                        res.render('product-info', {authenticated: false, itemRecord: item_record, biddingList : bidding_list});
                    }
                }).catch((error)=>{
                    console.log("Error getting document:", error);
                    res.redirect("/");
                });

            }
            
        }).catch((error) => {
            console.log("Error getting document:", error);
            res.redirect("/");
        });

    }
    else{
        res.redirect('/');
    }
    
});

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