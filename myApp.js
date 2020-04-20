const mongoose = require("mongoose");
const shortId = require('shortid');
const R = require('ramda');
const utils = require('./utils');

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/exercise-track', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});


const Schema = mongoose.Schema;

const userSchema = new Schema({
    _id: {
        type: String,
        default: shortId.generate,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
});

// Et - Exercise tracker
const User = mongoose.model("EtUser", userSchema);

const exerciseSchema = new Schema({
    userId: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    date: { type: Date, default: Date.now },
});

const Exercise = mongoose.model("EtExercise", exerciseSchema);

const createUser = username => new User({ username });

const createExercise = ({ userId, description, duration, date }) => new Exercise({
    userId,
    description,
    duration,
    date: !!date ? date : undefined, // undefined will trigger schema default for date
});

const defaultDoneCallback = done => (err, data) => {
    if (err) return done(err);
    done(null, data);
};

const saveDocument = function (document, done) {
    document.save(defaultDoneCallback(done));
};

const findUserById = (userId, done) => {
    User.findById(userId, 'username _id', defaultDoneCallback(done));
};

/**
 * @param user - user object from User model via createDocument()
 * @param res - response object
 * @param next - server's next() handler
 */
const saveAndSendUser = function (user, res, next) {
    saveDocument(user, (err, userData) => {
        if (err) {
            const errMessage = utils.isMongoDupeKeyErr(err) ? 'User already exists, please select a different username.'
                : `Error when saving user:\n${err.errmsg}`;
            return next(errMessage);
        }
        findUserById(utils.getUserId(userData), (err, savedUserData) => {
            if (err) {
                return next(`Created user not found with error:\n${err}`);
            }
            res.json(savedUserData)
        })
    })
};


const getAllUsers = done => {
    User.find({}, 'username _id', defaultDoneCallback(done));
};

const removeUsers = (done, userSelect = {}) => {
    User.deleteMany(userSelect, defaultDoneCallback(done));
};

/**
 * save exercise if user exists and send back exercise and user data
 * @param exercise object from Exercise model via createDocument()
 * @param res - response object
 * @param next - server's next() handler
 */
const saveAndSendExercise = function (exercise, res, next) {
    findUserById(exercise.userId, (err, userData) => {
        if (err) {
            return next('User not found with error:\n', err);
        } else if (R.isNil(userData)) {
            return next('Unknown userId');
        }
        saveDocument(exercise, (err, exerciseData) => {
            if (err) {
                return next(`Failed to save exercise with err:\n${err}`);
            }
            res.json(utils.getUserWithExercise(userData, exerciseData))
        })
    })
}

const getAndSendUserExercises = (query, res, next) => {
    const { userId } = query;
    findUserById(userId, (err, userData) => {
        if (err) {
            return next('User not found with error:\n', err);
        } else if (R.isNil(userData)) {
            return next('Unknown userId');
        }
        Exercise.find({ userId }, 'description duration date -_id', (err, exerciseData) => {
            if (err) {
                return next(`Exercises for user ${userId} not found with err:\n${err}`);
            }
            res.json(utils.getUserExerciseLog(userData, exerciseData))
        });
    })

};

const removeExercises = (done, exerciseSelect = {}) => {
    Exercise.deleteMany(exerciseSelect, defaultDoneCallback(done));
};

module.exports = {
    createUser,
    saveAndSendUser,
    getAllUsers,
    removeUsers,
    createExercise,
    saveAndSendExercise,
    getAndSendUserExercises,
    removeExercises,
};
