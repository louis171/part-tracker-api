const multer = require('multer');
const logs = require("../config/morgan.config");

multerErrorHandler = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        logs.multerLogStandard.write(err)
        console.log(err)
    } else {
        next();
    }
}