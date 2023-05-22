const User = require("../models/user.js");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const helper = require("../helper.js");

module.exports = {
    login: async function(email, password){
        email = email.toLowerCase();

        let user = await User.findOne({email: email});

        if(user === null) throw new Error("No user with that email");
        let passwordValid = await bcrypt.compare(password, user.password);
        if(!passwordValid) throw new Error("Invalid password");

        return jwt.sign({
            id: user._id,
            email: user.email,
            passHash: user.password
        }, process.env.JWT_SECRET);
    },

    getOne: async function(id){
        let user = await User.findOne({_id: id});

        if(user === null) throw new Error("No user with this ID");

        return user;
    },

    create: async function(data){
        if(data.password.length < 10) throw new Error("Password must contain at least 10 characters");
        if(!helper.validEmail(data.email)) throw new Error("Invalid email address");

        let user = new User(data);

        user.email = user.email.toLowerCase();

        let salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        return {
            user: await user.save(),
            jwt: jwt.sign({
                id: user._id,
                email: user.email,
                passHash: user.password
            }, process.env.JWT_SECRET)
        };
    },

    update: function(user, data){
        if(data.email){
            let email = data.email.toLowerCase();
            if(!helper.validEmail(email)) throw new SyntaxError("Invalid email");
            user.email = email;
        }

        if(data.firstName) user.firstName = data.firstName;
        if(data.lastName) user.lastName = data.lastName;
        if(data.languages) user.languages = data.languages;
        if(data.skills) user.skills = data.skills;
        if(data.socials) user.socials = data.socials;

        return user;
    }
}