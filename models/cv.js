const mongoose = require("mongoose");

const EmploymentSchema = new mongoose.Schema({
    autoCreate: false,
    autoIndex: false,
    position: {
        type: String,
        required: true
    },
    employer: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: Date,
    description: {
        type: String,
        required: true
    }
});

const CvSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    jobTitle: String,
    jobCategory: String,
    experience: {
        type: Number,
        min: 0,
        required: true
    },
    skills: [String],
    workHistory: [EmploymentSchema]
});

module.exports = {
    Cv: mongoose.model("cv", CvSchema),
    Employment: mongoose.model("employment", EmploymentSchema)
};