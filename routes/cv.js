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
    */
    app.get("/", mid.user, async (req, res)=>{
        let cvs = await cv.getAll(res.locals.user._id);
        res.json(cvs);
    });
}