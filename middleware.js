const User = require("./models/user.js");

const jwt = require("jsonwebtoken");

module.exports = {
    user: function(req, res, next){
        let authData = {};
        try{
            authData = jwt.verify(req.headers["authorization"].split(" ")[1], process.env.JWT_SECRET);
        }catch(e){
            return res.json("Invalid or missing JSON Web token");
        }

        User.findOne({_id: authData.id})
            .then((user)=>{
                if(!user) throw "user";

                res.locals.user = user;
                next();
            })
            .catch((err)=>{
                switch(err){
                    case "user": return res.json("User does not exist");
                    default:
                        console.error(err);
                        return res.json("ERROR: unable to log in user");
                }
            });
    }
}