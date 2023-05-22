const user = require("../logic/user.js");

const mid = require("../middleware.js");

module.exports = (app)=>{
    /*
    POST: login in a user
    req.body = {
        email: String
        password: String
    }
    response = {
        jwt: JSONWebToken
    }
    */
    app.post("/user/login", (req, res)=>{
        let token = user.login(req.body.email, req.body.password);
        res.json({jwt: token});
    }),

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