const R = require('ramda');

const getUserId = R.prop('_id');

const isMongoDupeKeyErr = err => R.propEq('code', 11000, err);

const getFormattedDate = date => date && date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
})
    .replace(/,/g, ''); // remove commas for FCC test

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

const isValidDateString = R.test(/^\d{4}-\d{2}-\d{2}$/);

const getLogQuerySelection = (userId, from = '', to = '') => {
    const selection = { userId };

    return R.pipe(
        R.when(() => isValidDateString(from), R.assocPath(['date', '$gte'], from)),
        R.when(() => isValidDateString(to), R.assocPath(['date', '$lte'], to)),
    )(selection);
};

module.exports = {
    getUserId,
    isMongoDupeKeyErr,
    getFormattedDate,
    getUserWithExercise,
    getUserExerciseLog,
    getLogQuerySelection,
};
