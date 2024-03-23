const fs = require('fs');

exports.removeFile = (fileName) => {
    setTimeout(() => {
        try {
            fs.readFile(fileName, function (err, data) {
                if (!err) {
                    fs.unlinkSync(fileName);
                }
            });
        } catch (err) {
            return err
        }
    }, 5000);
}