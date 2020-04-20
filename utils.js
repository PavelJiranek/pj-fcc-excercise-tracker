const R = require('ramda');

const getUserId = R.prop('_id');

const isMongoDupeKeyErr = err => R.propEq('code', 11000, err);

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

const getUserExerciseLog = (user, exercises) => ({
    _id: user.id,
    username: user.username,
    count: R.length(exercises),
    log: exercises.map(({ description, duration, date }) => ({ description, duration, date: getFormattedDate(date) })),

})

module.exports = {
    getUserId,
    isMongoDupeKeyErr,
    getFormattedDate,
    getUserWithExercise,
    getUserExerciseLog,
};
