const user = require(`${__dirname}/controllers/user.js`);
const cv = require(`${__dirname}/controllers/cv.js`);

const mid = require("./middleware.js");

module.exports = (app)=>{
    // app.get("/api", (req, res)=>{return res.sendFile(`${__dirname}/api.html`)});
    // app.get("/api/css", (req, res)=>{return res.sendFile(`${__dirname}/api.css`)});

    //USER
    app.post("/api/login", user.login);
    app.get("/api/user", mid.user, user.getOne);
    app.post("/api/user", user.create);
    app.put("/api/user", mid.user, user.update);
    app.delete("/api/user", mid.user, user.delete);

    //CV
    app.get("/api/cv/:cv", cv.retrieve);
    app.get("/api/cv", mid.user, cv.retrieveMany);
    app.post("/api/cv", mid.user, cv.create);
    app.put("/api/cv", mid.user, cv.update);
    app.delete("/api/cv/:cv", mid.user, cv.delete);
    app.post("/api/cv/:cv/employment", mid.user, cv.addEmployment);
    app.put("/api/cv/:cv/employment/:employment", mid.user, cv.updateEmployment);
    app.delete("/api/cv/:cv/employment/:employment", mid.user, cv.deleteEmployment);
    app.post("/api/cv/:cv/profile-image", mid.user, cv.addProfileImage);

    //OTHER
    app.get("/api/profile-images/:id", (req, res)=>{res.sendFile(`${__dirname}/profile-images/${req.params.id}`)});
}