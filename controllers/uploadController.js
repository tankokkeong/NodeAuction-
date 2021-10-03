var file_name = "";

const multer  = require('multer');
const { v4: uuidv4 } = require('uuid');

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

exports.upload_one_file = function(req, res){
    upload.single('file_upload');

    res.end();
}