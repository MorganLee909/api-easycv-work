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
}