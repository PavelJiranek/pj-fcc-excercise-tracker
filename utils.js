const R = require('ramda');

const getUserId = R.prop('_id');

const isMongoDupeKeyErr = err => R.propEq('code', 11000, err);
const isNewUserRequest = req => R.propEq('url', '/api/exercise/new-user', req);
const isNewExerciseRequest = req => R.propEq('url', '/api/exercise/add', req);

const getFormattedDate = date => date && date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
});

const getUserWithExercise = (user, exercise) => ({
    username: user.username,
    _id: user.id,
    description: exercise.description,
    duration: exercise.duration,
    date: getFormattedDate(exercise.date),
});

module.exports = {
    getUserId,
    isMongoDupeKeyErr,
    isNewUserRequest,
    isNewExerciseRequest,
    getFormattedDate,
    getUserWithExercise,
};
