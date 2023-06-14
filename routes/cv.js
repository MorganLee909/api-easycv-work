const cv = require("../logic/cv.js");

const mid = require("../middleware.js");

module.exports = (app)=>{
    /*
    GET: retrieve a single CV
    req.params.id = Cv ID
    response = CV
    */
    app.get("/cv/:id", async (req, res)=>{
        let cv = await cv.getOne(req.params.id);
        res.json(cv);
    });

    /*
    GET: retrieve all CV's belonging to current user
    response = [CV]
    */
    app.get("/cv", mid.user, async (req, res)=>{
        let cvs = await cv.getAll(res.locals.user._id);
        res.json(cvs);
    });

    /*
    POST: create a new CV and add it to the user
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
    response = CV
    */
    app.post("/cv", mid.user, async (req, res)=>{
        let cv = await cv.create(user, req.body);
        res.json(cv);
    });

    /*
    PUT: update CV data
    req.params.cv = CV ID
    req.body = {
        jobTitle: String
        jobCategory: String
        experience: Number
        skills: [String],
        languages: [{
            language: String
            level: String
        }]
    }
    */
    app.put("/cv/:cv", mid.user, async (req, res)=>{
        let cv = await cv.update(res.locals.user, req.params.cv, req.body);
        res.json(cv);
    });
}