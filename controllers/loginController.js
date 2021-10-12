const { query } = require('express');

exports.login_page = function(req, res){
    if(req.session.userID){
        res.redirect("/");
    }
    else{
        res.render('login', {authenticated : false});
    }
}

exports.logout = function(req, res){

    //Logout
    req.session.destroy();

    res.redirect("/");
}

exports.process_login = function(req, res){
    
    const admin = require('firebase-admin');
    const firestore = admin.firestore();

    var uid = req.body.uid;

    admin
    .auth()
    .getUser(uid)
    .then((userRecord) => {
        //Check if the account is suspended
        const removedCartRecordsRef = firestore.collection("removedCartRecords");

        removedCartRecordsRef.where("removedBy", "==", uid).get().then((querySnapshot)=>{

            //Remove product more than 3 times then the account is suspended
            if(querySnapshot.size >= 3){
                res.statusMessage = "account suspended";
                res.end();
            }
            else{
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

                    res.statusMessage = "normal";
                    res.end();
                    
                }).catch((error) => {
                    console.log("Error getting document:", error);
                    res.end();
                });
            }
        });

        
    })
    .catch((error) => {
        console.log('Error fetching user data:', error);
        res.end();
    });
}