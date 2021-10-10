const admin = require('firebase-admin');
const firestore = admin.firestore();

exports.bidder_profile_page = function(req, res){

    if(req.session.userID){

        var account_type = req.session.userID.accountType;
        var user_record = req.session.userID;
        const user_id = req.session.userID.userID;

        if(account_type == "bidder"){
            const bidderHistory = firestore.collection('bidderHistory').doc(user_id).collection(user_id);
            var bid_history = [];

            bidderHistory.orderBy("created", "desc").get().then((querySnapshot)=>{
                querySnapshot.forEach((doc)=>{

                    //Push the data object into array
                    bid_history.push(doc.data());
                });

                res.render('bidder-profile', {authenticated: true, accountType : account_type, userRecord: user_record, bidHistory: bid_history});
            });
            
        }
        else{
            res.redirect("/");
        }
        
    }
    else{
        res.redirect("/");
    }
}

exports.edit_bidder = function(req, res){

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
}