const {Cv, Employment} = require("../models/cv.js");
const Employer = require("../models/employer.js");

module.exports = {
    /*
    GET: retrieve all CV's for the logged in user
    response = [CV]
    */
    retrieveMany: function(req, res){
        res.locals.user.populate("cvs")
            .then((user)=>{
                return user.populate("cvs.workHistory.employer");
            })
            .then((user)=>{
                return res.json(user);
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
            .populate("workHistory.employer")
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
        experience: Number
        skills: [String]
        workHistory: [{
            position: String
            employer: Employer || String
            newEmployer: Boolean
            startDate: Date
            endDate: Date (optional)
            description: String
        }]
    }
    */
    create: function(req, res){
        let cv = new Cv({
            user: res.locals.user._id,
            jobTitle: req.body.jobTitle,
            jobCategory: req.body.jobCategory,
            experience: req.body.experience,
            skills: req.body.skills,
            workHistory: []
        });

        for(let i = 0; i < req.body.workHistory.length; i++){
            let wh = req.body.workHistory[i];
            let employer = wh.employer;

            if(wh.newEmployer){
                let e = new Employer({name: wh.employer});
                e.save().catch((err)=>{console.error(err)});
                employer = e._id;
            }

            cv.workHistory.push({
                position: wh.position,
                employer: employer,
                startDate: new Date(wh.startDate),
                endDate: wh.endDate ? new Date(wh.endDate) : undefined,
                description: wh.description
            });
        }

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
            newEmployment: [{
                position: String
                employer: Employer id || String,
                newEmployer: Boolean
                startDate: Date
                endDate: Date
                description: String
            }],
            removeEmployment: [workHistory id]
        }
    */
    update: function(req, res){
        Cv.findOne({_id: req.body.cv})
            .then((cv)=>{
                if(!cv) throw "cv";
                if(cv.user.toString() !== res.locals.user._id.toString()) throw "user";

                if(req.body.jobTitle) cv.jobTitle = req.body.jobTitle;
                if(req.body.jobCategory) cv.jobCategory = req.body.jobCategory;
                if(req.body.experience) cv.experience = req.body.experience;
                if(req.body.skills) cv.skills = req.body.skills;

                if(req.body.newEmployment){
                    for(let i = 0; i < req.body.newEmployment.length; i++){
                        let wh = req.body.newEmployment[i];
                        let employer = wh.employer;
                        
                        if(wh.newEmployer){
                            let e = new Employer({name: wh.employer});
                            e.save().catch((err)=>{console.error(err)});
                            employer = e._id;
                        }
                        
                        cv.workHistory.push({
                            position: wh.position,
                            employer: employer,
                            startDate: new Date(wh.startDate),
                            endDate: wh.endDate ? new Date(wh.endDate) : undefined,
                            description: wh.description
                        });
                    }
                }

                if(req.body.removeEmployment){
                    for(let i = 0; i < req.body.removeEmployment.length; i++){
                        for(let j = 0; j < cv.workHistory.length; j++){
                            if(req.body.removeEmployment[i] === cv.workHistory[j]._id.toString()){
                                cv.workHistory.splice(j, 1);
                                break;
                            }
                        }
                    }
                }

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
    addWorkHistory: function(req, res){
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
    DELETE: remove a single job history from the cv
    req.params = {
        cv: CV
        employment: Employment
    }
    response = {}
    */
    deleteWorkHistory: function(req, res){
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