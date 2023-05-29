const express = require("express");
const compression = require("compression");
const mongoose = require("mongoose");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const fileUpload = require("express-fileupload");

let app = express();

global.appRoot = __dirname;

let mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

let corsOrigin = "http://localhost:8080";

let httpsServer = {};
if(process.env.NODE_ENV === "production"){
    httpsServer = https.createServer({
        key: fs.readFileSync("/etc/letsencrypt/live/easycv.work/privkey.pem", "utf8"),
        cert: fs.readFileSync("/etc/letsencrypt/live/easycv.work/fullchain.pem", "uft8")
    }, app);

    app.use((req, res, next)=>{
        if(req.secure === true){
            next();
        }else{
            res.redirect(`https://${req.headers.host}${req.url}`);
        }
    });

    mongooseOptions.auth = {authSource: "admin"};
    mongooseOptions.user = "easycv-work";
    mongooseOptions.pass = process.env.MONGODB_PASS;

    corsOrigin = "https://easycv.work";
}

app.use(compression());
app.use(express.json());
app.use(cors({origin: corsOrigin}));
app.use(express.static(`${__dirname}/views/index.html`));
app.use(fileUpload({
    limits: {fileSize: 15 * 1024 * 1024},
}));

mongoose.connect("mongodb://127.0.0.1/easycv", mongooseOptions);

app.get("/documentation", (req, res)=>{return res.sendFile(`${__dirname}/api.html`)});
app.get("/documentation.css", (req, res)=>{return res.sendFile(`${__dirname}/api.css`)});

require(`${__dirname}/routes.js`)(app);
require(`${__dirname}/routes/user.js`)(app);
require(`${__dirname}/routes/cv.js`)(app); 

if(process.env.NODE_ENV === "production"){
    app.get("/", (req, res)=>{res.sendFile(`${__dirname}/views/index.html`)});
    httpsServer.listen(process.env.HTTPS_PORT);
}
app.listen(process.env.PORT);