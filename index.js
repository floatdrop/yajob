module.exports = function () {
    return {
        put: function () {
            return new Promise(function (resolve) {
                resolve();
            });
        }
    };
};
