const mongoose = require("mongoose");
const shortId = require('shortid');

const utils = require('./utils');

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/exercise-track', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});


const Schema = mongoose.Schema;

// et - Exercise tracker
const etUserSchema = new Schema({
    _id: {
        'type': String,
        'default': shortId.generate,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
});

const EtUser = mongoose.model("EtUser", etUserSchema);

const createUser = username => new EtUser({username});

const defaultDoneCallback = done => (err, data) => {
    if (err) return done(err);
    done(null, data);
};

const saveUser = function (user, done) {
    user.save(defaultDoneCallback(done));
};

const findUserById = (userId, done) => {
    EtUser.findById(userId, 'username __id', defaultDoneCallback(done));
};

/**
 * @param user - user object from User model via createUser()
 * @param res - response object
 * @param next - server's next() handler
 */
const saveAndSendUser = function (user, res, next) {
    saveUser(user, (err, userData) => {
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

module.exports = {
    createUser,
    saveAndSendUser,
};
