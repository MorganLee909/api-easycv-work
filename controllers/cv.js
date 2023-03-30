const {Cv, Employment} = require("../models/cv.js");

module.exports = {
    /*
    GET: retrieve all CV's for the logged in user
    response = [CV]
    */
    retrieveMany: function(req, res){
        res.locals.user.populate("cvs")
            .then((user)=>{
                return res.json(user.cvs);
            })
            .catch((err)=>{
                console.error(err);
                return res.json("ERROR: unable to retrieve CV's");
            });
    },

    /*
    GET: retrieve a single CV
    req.params.cv = CV id
    response = CV
    */
    retrieve: function(req, res){
        Cv.findOne({_id: req.params.cv})
            .populate("user")
            .then((cv)=>{
                cv.user.password = undefined;
                cv.user.cvs = undefined;

                return res.json(cv);
            })
            .catch((err)=>{
                console.error(err);
                return res.json("Error: unable to retrieve CV data");
            });
    },

    /*
    POST: create new cv for the logged in user
    req.body = {
        jobTitle: String
        jobCategory: String
        overview: String
        experience: Number
        skills: [String]
        languages: [{
            language: String
            level: String
        }]
    }
    */
    create: function(req, res){
        let cv = new Cv({
            user: res.locals.user._id,
            jobTitle: req.body.jobTitle,
            jobCategory: req.body.jobCategory,
            overview: req.body.overview,
            experience: req.body.experience,
            skills: req.body.skills,
            languages: req.body.languages ? req.body.languages : [],
            workHistory: []
        });

        res.locals.user.cvs.push(cv._id);

        Promise.all([cv.save(), res.locals.user.save()])
            .then((response)=>{
                return res.json(response[0]);
            })
            .catch((err)=>{
                console.error(err);
                return res.json("ERROR: unable to create new CV");
            });
    },

    /*
        PUT: update a Cv
        req.body = {
            cv: String id
            jobTitle: String
            jobCategory: String
            experience: Number
            skills: [String]
            languages: [{
                language: String
                level: String
            }]
        }
    */
    update: function(req, res){
        Cv.findOne({_id: req.body.cv})
            .then((cv)=>{
                if(!cv) throw "cv";
                if(cv.user.toString() !== res.locals.user._id.toString()) throw "user";

                if(req.body.jobTitle) cv.jobTitle = req.body.jobTitle;
                if(req.body.jobCategory) cv.jobCategory = req.body.jobCategory;
                if(req.body.overview) cv.overview = req.body.overview;
                if(req.body.experience) cv.experience = req.body.experience;
                if(req.body.skills) cv.skills = req.body.skills;
                if(req.body.languages) cv.languages = req.body.languages;

                return cv.save();
            })
            .then((cv)=>{
                return res.json(cv);
            })
            .catch((err)=>{
                switch(err){
                    case "cv": return res.json("CV does not exist");
                    case "user": return res.json("User does not own that CV");
                    default:
                        console.error(err);
                        return res.json("ERROR: unable to update CV");
                }
            });
    },

    /*
    DELETE: delete a single cv
    req.params = {
        cv: CV id
    }
    response = {}
    */
    delete: function(req, res){
        for(let i = 0; i < res.locals.user.cvs.length; i++){
            let cv = res.locals.user.cvs[i];

            if(cv.toString() === req.params.cv){
                res.locals.user.cvs.splice(i, 1);

                let cvDelete = Cv.deleteOne({_id: req.params.cv});

                return Promise.all([cvDelete, res.locals.user.save()])
                    .then((response)=>{
                        return res.json({});
                    })
                    .catch((err)=>{
                        console.error(err);
                        return res.json("ERROR: unable to delete CV");
                    });
            }
        }

        return res.json("You do not have permission to delete that CV");
    },

    /*
    POST: create and add a new job history to the CV
    req.body = {
        position: String
        employer: String
        startDate: Date
        endDate: Date
        description: String
    }
    req.params.cv = CV
    response = Employment
    */
    addEmployment: function(req, res){
        let newJob = {};
        Cv.findOne({_id: req.params.cv})
            .then((cv)=>{
                if(cv.user.toString() !== res.locals.user.id.toString()) throw "owner";

                newJob = new Employment({
                    position: req.body.position,
                    employer: req.body.employer,
                    startDate: new Date(req.body.startDate),
                    endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
                    description: req.body.description
                });

                cv.workHistory.push(newJob);

                return cv.save();
            })
            .then((cv)=>{
                return res.json(newJob);
            })
            .catch((err)=>{
                switch(err){
                    case "owner": return res.json("User does not own this CV");
                    default:
                        console.error(err);
                        return res.json("ERROR: Unable to update user's CV");
                }
            });
    },

    /*
    PUT: update an employment on user cv
    req.params = {
        cv: Cv
        employment: Employment
    }
    req.body = {
        position: String
        employer: String
        startDate: Date
        endDate: Date
        description: String
    }
    response = Employment
    */
    updateEmployment: function(req, res){
        let employment = {};
        Cv.findOne({_id: req.params.cv})
            .then((cv)=>{
                if(res.locals.user._id.toString() !== cv.user.toString()) throw "owner";

                employment = cv.workHistory.id(req.params.employment);

                if(req.body.position) employment.position = req.body.position;
                if(req.body.employer) employment.employer = req.body.employer;
                if(req.body.startDate) employment.startDate = new Date(req.body.startDate);
                if(req.body.endDate) employment.endDate = new Date(req.body.endDate);
                if(req.body.description) employment.description = req.body.description;

                return cv.save();
            })
            .then((cv)=>{
                return res.json(employment);
            })
            .catch((err)=>{
                switch(err){
                    case "owner": return res.json("User does not own this CV");
                    default:
                        console.error(err);
                        return res.json("ERROR: unable to update employmnent history");
                }
            });
    },

    /*
    DELETE: remove a single job history from the cv
    req.params = {
        cv: CV
        employment: Employment
    }
    response = {}
    */
    deleteEmployment: function(req, res){
        Cv.findOne({_id: req.params.cv})
            .then((cv)=>{
                if(res.locals.user._id.toString() !== cv.user.toString()) throw "owner";

                cv.workHistory.id(req.params.employment).remove();
                
                return cv.save();
            })
            .then((cv)=>{
                return res.json({});
            })
            .catch((err)=>{
                switch(err){
                    case "owner": return res.json("User does not own this CV");
                    default: 
                        console.error(err);
                        return res.json("ERROR: unable remove work history from CV");
                }
            });
    }
}