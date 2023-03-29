const helper = require("../helper.js");

module.exports = {
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