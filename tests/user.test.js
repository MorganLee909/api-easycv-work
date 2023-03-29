const user = require("../logic/user.js");
const User = require("../models/user.js");

const newUser = {
    email: "bob@mail.com",
    password: "12345",
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
};

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
    describe("Update user", ()=>{
        test("update user data when proper info passed", ()=>{
            let updatedUser = user.update(newUser, updateData);

            expect(updatedUser).toMatchObject({
                ...newUser,
                ...updateData
            });
        });

        test("throw error with invalid email", ()=>{
            expect(()=>{
                user.update(newUser, {
                    ...updateData,
                    email: "bob.com",
                })
            }).toThrow(SyntaxError);
        });

        test("still update when some data is not included", ()=>{
            let updatedUser = user.update(newUser, {
                ...newUser,
                firstName: "Boob"
            });

            expect(updatedUser).toMatchObject({
                ...newUser,
                firstName: "Boob"
            });
        });
    })
})