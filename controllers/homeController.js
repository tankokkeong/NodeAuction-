exports.home_page = function(req, res){
    const admin = require('firebase-admin');
    const firestore = admin.firestore();

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
