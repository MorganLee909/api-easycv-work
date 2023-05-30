const cvLogic = require("../logic/cv.js");

const User = require("../models/user.js");
const { Cv } = require("../models/cv.js");

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

let salt = bcrypt.genSaltSync(10);
let hash = bcrypt.hashSync("password123", salt);

describe("CV logic", ()=>{
    let testUser = {};

    beforeAll(async ()=>{
        mongoose.connect("mongodb://127.0.0.1/testingCv", {
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
        await mongoose.connection.db.dropCollection("cvs");
        testUser.cvs = [];

        let testCv = new Cv({
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

        let testCv2 = new Cv({
            user: testUser._id,
            jobTitle: "encodener",
            jobCategory: "IT",
            overview: "Some overview text",
            experience: 3,
            skills: ["typing", "drinking coffe"],
            languages: [{
                language: "English",
                level: "native"
            }],
            workHistory: []
        });

        testUser.cvs.push(testCv, testCv2);

        await Promise.all([testCv.save(), testCv2.save(), testUser.save()]);
    });

    afterAll(async ()=>{
        await mongoose.connection.db.dropDatabase();
        mongoose.disconnect();
    });

    describe("Get single CV", ()=>{
        test("return requested cv", async ()=>{
            let cv = await cvLogic.getOne(testUser.cvs[0]._id.toString());

            expect(cv._id.toString()).toBe(testUser.cvs[0]._id.toString());
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

    describe("Get all user CV's", ()=>{
        test("return number of CV's that match user", async ()=>{
            let cvs = await cvLogic.getMany(testUser._id);

            expect(cvs.length).toBe(2);
        });

        test("return correct CVs", async ()=>{
            let cvs = await cvLogic.getMany(testUser._id);

            expect(cvs[0]._id.toString()).toBe(testUser.cvs[0]._id.toString());
            expect(cvs[1]._id.toString()).toBe(testUser.cvs[1]._id.toString());
        });

        test("return empty array if no CVs exist", async ()=>{
            let cvs = await cvLogic.getMany(new mongoose.Types.ObjectId("646b8b60abf4f5726d29aae6"));

            expect(cvs.length).toBe(0);
        });
    });
})