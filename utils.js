const R = require('ramda');

const getUserId = R.prop('_id');

const isMongoDupeKeyErr = err => R.propEq('code', 11000, err);
const isNewUserRequest = req => R.propEq('url', '/api/exercise/new-user', req);

module.exports = {
    getUserId,
    isMongoDupeKeyErr,
    isNewUserRequest,
};
