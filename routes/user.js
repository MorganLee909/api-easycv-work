const user = require("../logic/user.js");

module.exports = (app)=>{
    app.put("/api/user", mid.user, (req, res)=>{
        user.update()
    });
}