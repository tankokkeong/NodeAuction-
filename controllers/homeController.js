const admin = require('firebase-admin');
const firestore = admin.firestore();

exports.home_page = function(req, res){

    const itemRef = firestore.collection('items');
    var item_array = [];
    var ending_soon = [];

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

            if(ending_soon.length != 4){
                ending_soon.push(itemObject);
            }
        });


        if(req.session.userID){
            var account_type = req.session.userID.accountType;
            res.render('home', {authenticated : true, accountType: account_type, itemArray: item_array, endingSoon: ending_soon});
        }
        else{
            res.render('home', {authenticated : false, itemArray: item_array, endingSoon: ending_soon});
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
}

exports.search_page = function(req, res){

    //Get the search query
    var search_query = req.query.item ? req.query.item : ""; 
    const itemRef = firestore.collection('items');
    var search_data = [];

    if(req.session.userID){
        var account_type = req.session.userID.accountType;

        //Search the match item
        itemRef.where("keywords", "array-contains", search_query.toLowerCase()).get().then((querySnapshot)=>{
            querySnapshot.forEach((doc) => {
                var item_object = new Object();

                item_object.itemID = doc.id;
                item_object.itemName = doc.data().itemName;
                item_object.startingPrice = doc.data().itemStartingPrice;
                item_object.startingDate = doc.data().startingDate;
                item_object.endDate = doc.data().endDate;
                item_object.itemImage = doc.data().itemImage;
                search_data.push(item_object);
            });

            res.render('auctionResults', {authenticated: true, accountType: account_type, searchQuery: search_query, searchData: search_data});
        });

        
    }
    else{

        //Search the match item
        itemRef.where("keywords", "array-contains", search_query.toLowerCase()).get().then((querySnapshot)=>{
            querySnapshot.forEach((doc) => {
                var item_object = new Object();

                item_object.itemID = doc.id;
                item_object.itemName = doc.data().itemName;
                item_object.itemStartingPrice = doc.data().itemStartingPrice;
                item_object.startingDate = doc.data().startingDate;
                item_object.endDate = doc.data().endDate;
                item_object.itemImage = doc.data().itemImage;
                search_data.push(item_object);
            });

            res.render('auctionResults', {authenticated: false, searchQuery: search_query, searchData: search_data});
        });
    }
}

exports.about_us_page = function(req, res){

    if(req.session.userID){
        var account_type = req.session.userID.accountType;

        res.render('about-us', {authenticated: true, accountType: account_type});
    }
    else{
        res.render('about-us', {authenticated: false});
    }
}

exports.contact_us_page = function(req, res){

    if(req.session.userID){
        var account_type = req.session.userID.accountType;

        res.render('contact-us', {authenticated: true, accountType: account_type});
    }
    else{
        res.render('contact-us', {authenticated: false});
    }
}

exports.privacy_policy_page = function(req, res){

    if(req.session.userID){
        var account_type = req.session.userID.accountType;

        res.render('privacy', {authenticated: true, accountType: account_type});
    }
    else{
        res.render('privacy', {authenticated: false});
    }
}

exports.terms_conditions_page = function(req, res){

    if(req.session.userID){
        var account_type = req.session.userID.accountType;

        res.render('terms', {authenticated: true, accountType: account_type});
    }
    else{
        res.render('terms', {authenticated: false});
    }
}

exports.help_centre_page = function(req, res){

    if(req.session.userID){
        var account_type = req.session.userID.accountType;

        res.render('help', {authenticated: true, accountType: account_type});
    }
    else{
        res.render('help', {authenticated: false});
    }
}