const admin = require('firebase-admin');
const firestore = admin.firestore();

exports.home_page = function(req, res){

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
                item_object.startingPrice = doc.data().startingPrice;
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
