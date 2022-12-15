const User = require("./models/user.js");

module.exports = {
    user: function(req, res, next){
        let authData = {};
        let token = req.headers["authorization"].split(" ")[1];
        if(!token) return res.json("JSON Web Token not provided");

        try{
            authData = jwt.verify(req.headers["authorization"].split(" ")[1], process.env.JWT_SECRET);
        }catch(e){
            return res.json("Invalid JSON Web token");
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