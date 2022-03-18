const express = require('express')
const app = express()

var prettyFileIcons = require('pretty-file-icons');
const fs = require('fs');

var multer = require('multer')
var upload = multer({ dest: 'uploads/' })

var ipfsAPI = require('ipfs-api')
var ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' })

app.get("/gui", function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

app.post("/upload", upload.single("fileName"), function (req, res, next) {

    var data = new Buffer.from(fs.readFileSync(req.file.path));
    ipfs.add(data, function (err, file) {
        if (err) {
            console.log(err);
        }
      console.log(file);
        var type = prettyFileIcons.getIcon(req.file.originalname)
        if (type != "unknown") {
            var json = {
                fileName: req.file.originalname,
                url: "https://ipfs.io/ipfs/" + file[0].hash,
                mimetype: req.file.mimetype,
                filehash:file[0].hash,
                filesize:formatBytes(file[0].size,2),
                timestamp: new Date().getTime(),
                icon: `https://raw.githubusercontent.com/kravets-levko/pretty-file-icons/45b206cbad4c743a818d2275f71c507ebb18d25e/svg/${type}.svg`
            }
        }
        else {
            var json = {
                fileName: req.file.originalname,
                url: "https://ipfs.io/ipfs/" + file[0].hash,
                filehash:file[0].hash,
                mimetype: req.file.mimetype,
                filesize:formatBytes(file[0].size,2),
                timestamp: new Date().getTime()
            }
        }
            // convert JSON object to String
            var jsonStr = JSON.stringify(json);

            // read json string to Buffer
            const buf = Buffer.from(jsonStr);
            ipfs.add(buf, function (err, file) {
                if (err) {
                    console.log(err);
                }
                console.log(file);
                res.send(json);
            });

        
    });
});

app.get("/download/:ID", function (req, res) {
    res.redirect("https://ipfs.io/ipfs/" + req.params.ID);
});
process.on("uncaughtException", function (err) {
    console.error(err);
    console.log("Node NOT Exiting...");
});

app.listen(8080);

function formatBytes(a,b=2,k=1024){with(Math){let d=floor(log(a)/log(k));return 0==a?"0 Bytes":parseFloat((a/pow(k,d)).toFixed(max(0,b)))+" "+["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]}}
