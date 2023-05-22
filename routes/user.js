const user = require("../logic/user.js");

const mid = require("../middleware.js");

module.exports = (app)=>{
    /*
    PUT: update user data
    req.body = {
        email: String
        firstName: String
        lastName: String
        languages: [{
            name: String
            level: String
        }]
        skills: [String]
        socials: [{
            name: String
            link: String
        }]
    }
    */
    app.put("/user", mid.user, (req, res)=>{
        user.update(res.locals.user, req.body)
            .save()
            .then((user)=>{
                user.password = undefined;
                return res.json(user);
            })
            .catch((err)=>{
                console.error(err);
            });
    });
}