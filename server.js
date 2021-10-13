const express = require("express");
const admin = require('firebase-admin');
var bodyParser = require('body-parser')
var cors = require('cors')
var stripJs = require('strip-js');
var session = require('express-session');   
var helper = require('./helper.js');

const multer  = require('multer');
const { v4: uuidv4 } = require('uuid');
var file_name = "";

exports.getFileName = function() {
    return file_name;
};

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

// Controllers initializations
var homeController = require('./controllers/homeController');
var loginController = require('./controllers/loginController');
var signupController = require('./controllers/signupController');
var bidderController = require('./controllers/bidderController');
var auctioneerController = require('./controllers/auctioneerController');
var itemController = require('./controllers/itemController');
var checkoutController = require('./controllers/checkoutController');
var errorController = require('./controllers/errorController');
var shoppingCartController = require('./controllers/shoppingCartController');

app.get("/", homeController.home_page);

app.get("/home", homeController.home_page);

app.get("/login", loginController.login_page);

app.post("/login", loginController.process_login);

app.get("/signup", signupController.signup_page);

app.get("/bidder-profile", bidderController.bidder_profile_page);

app.post("/edit-bidder", bidderController.edit_bidder);

app.get("/auctioneer-profile", auctioneerController.auctionner_profile_page);

app.post("/edit-auctioneer", auctioneerController.edit_auctioneer);

app.post("/post-item", upload.single('file_upload'), itemController.post_item);

app.get("/delete-item/:id", itemController.delete_item);

app.get("/product-info", itemController.product_info_page);

app.post("/submitBid/:id", itemController.submit_bid);

app.get("/checkout", checkoutController.checkout_page);

app.get("/thankyou", checkoutController.thankyou_page);

app.get("/auctionResults", homeController.search_page);

app.get("/shopping-cart", shoppingCartController.shopping_cart_page);

app.post("/cart-remove", shoppingCartController.remove_cart_item);

app.post("/create-checkout-session", shoppingCartController.create_checkout_session);

app.get("/logout", loginController.logout);

app.get("/noscript", errorController.no_script_page);

// 404 page
app.use(errorController.error_404_page);