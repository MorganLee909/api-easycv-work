const {Cv} = require("../models/cv.js");

module.exports = {
    getOne: async function(id){
        let cv = await Cv.findOne({_id: id});

        if(cv === null) throw new Error("No CV with this ID");

        return cv;
    }
}