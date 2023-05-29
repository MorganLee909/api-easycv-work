const userLogic = require("../logic/user.js");

const User = require("../models/user.js");

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

let salt = bcrypt.genSaltSync(10);
let hash = bcrypt.hashSync("password123", salt);

describe("User logic", ()=>{
    let testUser = {};

    beforeAll(()=>{
        mongoose.connect("mongodb://127.0.0.1/testing", {
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

    afterAll(async ()=>{
        await mongoose.connection.db.dropDatabase();
        mongoose.disconnect();
    });

    describe("User login", ()=>{
        test("respond with JWT", async ()=>{
            let token = await userLogic.login("bob@mail.com", "password123");

            expect(typeof(token)).toBe("string");
        });

        test("throw error with non-existant email", ()=>{
            expect(async ()=>{
                await userLogic.login("frank@mail.com", "password123");
            }).rejects.toEqual(new Error("No user with that email"));
        });

        test("throw error with bad email", async ()=>{
            expect(async ()=>{
                await userLogic.login("bob@mail.com", "password124");
            }).rejects.toEqual(new Error("Invalid password"));
        });
    });

    describe("Get single user", ()=>{
        test("return requested user", async ()=>{
            let user = await userLogic.getOne(testUser._id.toString());

            expect(user.email).toBe(testUser.email);
            expect(user.firstName).toBe(testUser.firstName);
            expect(user.lastName).toBe(testUser.lastName);
        });

        test("throw error with bad ID", ()=>{
            expect(async ()=>{
                await userLogic.getOne("646b8b60abf4f5726d29aae6");
            }).rejects.toEqual(new Error("No user with this ID"));
        });
    });

    describe("Create a user", ()=>{
        let testData = {
            firstName: "Bob",
            lastName: "Bobert",
            email: "BobBobert@mail.com",
            password: "password123"
        };

        test("respond with user", async ()=>{
            let {user} = await userLogic.create(testData);

            expect(user._id).toBeInstanceOf(mongoose.Types.ObjectId);
            expect(user.firstName).toBe("Bob");
            expect(user.lastName).toBe("Bobert");
            expect(user.email).toBe("bobbobert@mail.com");
        });

        test("password to be hashed", async ()=>{
            let {user} = await userLogic.create(testData);

            expect(user.password).not.toBe("password123");
        })

        test("respond with jwt", async ()=>{
            let {jwt} = await userLogic.create(testData);

            expect(typeof(jwt)).toBe("string");
        });

        test("create user in database", async ()=>{
            let {user} = await userLogic.create(testData);

            let dbUser = await User.findOne({_id: user.id});

            expect(dbUser._id.toString()).toBe(user._id.toString());
        });

        test("throw error if password too short", ()=>{
            expect(async ()=>{
                await userLogic.create({
                    ...testData,
                    password: "pass12"
                });
            }).rejects.toEqual(new Error("Password must contain at least 10 characters"));
        });

        test("throw error with invalid email", ()=>{
            expect(async ()=>{
                await userLogic.create({
                    ...testData,
                    email: "BobBobert@mail"
                });
            }).rejects.toEqual(new Error("Invalid email address"));
        });
    })

    describe("Update user", ()=>{
        let updateData = {
            email: "Bob2@gmail.com",
            firstName: "Boob",
            lastName: "blecher",
            languages: [{
                name: "spanish",
                level: "a1"
            }],
            socials: [],
            skills: ["grilling"]
        };

        test("respond with correct user data", async ()=>{
            let updatedUser = await userLogic.update(testUser._id.toString(), updateData);

            expect(updatedUser._id.toString()).toBe(testUser._id.toString());
            expect(updatedUser.email).toBe("bob2@gmail.com");
            expect(updatedUser.firstName).toBe("Boob");
            expect(updatedUser.lastName).toBe("blecher");
            expect(updatedUser.languages.length).toBe(1);
            expect(updatedUser.socials.length).toBe(0);
            expect(updatedUser.skills[0]).toBe("grilling");
        });

        test("update the database", async ()=>{
            let updatedUser = await userLogic.update(testUser._id.toString(), updateData);
            let dbUser = await User.findOne({_id: testUser._id});

            expect(dbUser._id.toString()).toBe(testUser._id.toString());
            expect(dbUser.email).toBe("bob2@gmail.com");
            expect(dbUser.firstName).toBe("Boob");
            expect(dbUser.lastName).toBe("blecher");
            expect(dbUser.languages.length).toBe(1);
            expect(dbUser.socials.length).toBe(0);
            expect(dbUser.skills[0]).toBe("grilling");
        })

        test("throw error with invalid email", ()=>{
            expect(async ()=>{
                await userLogic.update(testUser._id.toString(), {
                    ...updateData,
                    email: "blob@mail"
                });
            }).rejects.toThrow(new Error("Invalid email address"));
        });

        test("still update when some data is not included", async ()=>{
            let updatedUser = await userLogic.update(testUser._id.toString(), {firstName: "Stirling Archer"});

            expect(updatedUser.firstName).toBe("Stirling Archer");
        });
    });

    describe("Delete user", ()=>{
        test("respond with empty object", async ()=>{
            let response = await userLogic.remove(testUser._id.toString());

            expect(response).toMatchObject({});
        });

        test("remove user from database", async ()=>{
            await userLogic.remove(testUser._id.toString());
            let dbUser = await User.findOne({_id: testUser._id});

            expect(dbUser).toBeNull();
        });
    });
});

mongoose.disconnect();