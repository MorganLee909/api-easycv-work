const User = require("../models/user.js");
const {Cv} = require("../models/cv.js");

module.exports = {
    getOne: async function(id){
        let cv = await Cv.findOne({_id: id});

        if(cv === null) throw new Error("No CV with this ID");

        return cv;
    },

    getMany: async function(userObjectId){
        let cvs = Cv.find({user: userObjectId});
        return cvs;
    },

    create: async function(user, data){
        let cv = new Cv({
            user: user._id,
            jobTitle: data.jobTitle,
            jobCategory: data.jobCategory,
            overview: data.overview,
            experience: data.experience,
            skills: data.skills,
            languages: data.languages
        });

        user.cvs.push(cv._id);

        await Promise.all([user.save(), cv.save()]);
        return cv;
    },

    update: async function(user, cvId, data){
        
    }
}