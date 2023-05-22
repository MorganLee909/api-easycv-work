const user = require("../logic/user.js");

const User = require("../models/user.js");

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

let salt = bcrypt.genSaltSync(10);
let hash = bcrypt.hashSync("password123", salt);

const updateData = {
    email: "bob2@gmail.com",
    firstName: "Boob",
    lastName: "blecher",
    languages: [{
        name: "spanish",
        level: "a1"
    }],
    socials: [],
    skills: ["grilling"]
}

describe("User logic", ()=>{
    let testUser = {};

    beforeAll(()=>{
        mongoose.connect("mongodb://127.0.0.1/test", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });


    beforeEach(async ()=>{
        testUser = new User({
            email: "bob@mail.com",
            password: hash,
            firstName: "Bob",
            lastName: "Belcher",
            languages: [
                {
                    name: "english",
                    level: "native"
                },
                {
                    name: "russian",
                    level: "c1"
                }
            ],
            socials: [
                {
                    name: "github",
                    link: "https://github.com"
                },
                {
                    name: "facebook",
                    link: "https://twitter.com"
                }
            ],
            skills: ["cooking", "baking", "espionage"],
            cvs: []
        });

        await testUser.save();
    });

    afterAll(()=>{
        mongoose.disconnect();
    });

    describe("Login", ()=>{
        test("respond with JWT", async ()=>{
            let token = await user.login("bob@mail.com", "password123");

            expect(typeof(token)).toBe("string");
        });

        test("throw error with non-existant email", ()=>{
            expect(async ()=>{
                await user.login("frank@mail.com", "password123");
            }).rejects.toEqual(new Error("No user with that email"));
        });

        test("throw error with bad email", async ()=>{
            expect(async ()=>{
                await user.login("bob@mail.com", "password124");
            }).rejects.toEqual(new Error("Invalid password"));
        });
    });

    // describe("Update user", ()=>{
    //     test("update user data when proper info passed", ()=>{
    //         let updatedUser = user.update(newUser, updateData);

    //         expect(updatedUser).toMatchObject({
    //             ...newUser,
    //             ...updateData
    //         });
    //     });

    //     test("throw error with invalid email", ()=>{
    //         expect(()=>{
    //             user.update(newUser, {
    //                 ...updateData,
    //                 email: "bob.com",
    //             })
    //         }).toThrow(SyntaxError);
    //     });

    //     test("still update when some data is not included", ()=>{
    //         let updatedUser = user.update(newUser, {
    //             ...newUser,
    //             firstName: "Boob"
    //         });

    //         expect(updatedUser).toMatchObject({
    //             ...newUser,
    //             firstName: "Boob"
    //         });
    //     });
    // })
});

mongoose.disconnect();