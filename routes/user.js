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
        user: User
        jwt: JSONWebToken
    }
    */
    app.post("/user/login", async (req, res)=>{
        let token = await user.login(req.body.email, req.body.password);
        res.json({jwt: token});
    }),

    /*
    GET: get data for a single user
    req.params.id = String ID
    */
    app.get("/user/:id", mid.user, async (req, res)=>{
        res.json({user: await user.getOne(req.params.id)});
    })

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