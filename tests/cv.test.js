const cvLogic = require("../logic/cv.js");

const User = require("../models/user.js");
const { Cv } = require("../models/cv.js");

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

let salt = bcrypt.genSaltSync(10);
let hash = bcrypt.hashSync("password123", salt);

describe("CV logic", ()=>{
    let testUser = {};
    let testCv = {};

    beforeAll(async ()=>{
        mongoose.connect("mongodb://127.0.0.1/testing", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        testUser = new User({
            email: "bob@mail.com",
            password: hash,
            firstName: "Bob",
            lastName: "Belcher",
            cvs: []
        });

        await testUser.save();
    });

    beforeEach(async ()=>{
        testCv = new Cv({
            user: testUser._id,
            jobTitle: "Resteraunteur",
            jobCategory: "Entrepreneur",
            overview: "Some overview text",
            experience: 5,
            skills: ["Burger flipping", "Cooking", "Espionage"],
            languages: [
                {
                    language: "English",
                    level: "native"
                },
                {
                    language: "Russian",
                    level: "fluent"
                },
                {
                    language: "Portuguese",
                    level: "beginner"
                }
            ],
            workHistory: []
        });

        await testCv.save();
    });

    afterAll(async ()=>{
        await mongoose.connection.db.dropDatabase();
        mongoose.disconnect();
    });

    describe("Get single CV", ()=>{
        test("return requested cv", async ()=>{
            let cv = await cvLogic.getOne(testCv._id.toString());

            expect(cv._id.toString()).toBe(testCv._id.toString());
            expect(cv.user.toString()).toBe(testUser._id.toString());
            expect(cv.jobTitle).toBe("Resteraunteur");
            expect(cv.jobCategory).toBe("Entrepreneur");
            expect(cv.languages.length).toBe(3);
        });

        test("throw error with bad ID", ()=>{
            expect(async ()=>{
                await cvLogic.getOne("646b8b60abf4f5726d29aae6");
            }).rejects.toEqual(new Error("No CV with this ID"));
        });
    });
})