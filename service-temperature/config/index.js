'use-strict'

require('dotenv').config();
const bunyan = require('bunyan');

const log = {
    development: () => {
        return bunyan.createLogger({
            name: 'service-temperature-dev',
            level: 'debug'
        });
    },
    production: () => {
        return bunyan.createLogger({
            name: 'service-temperature-prod',
            level: 'info'
        });
    },
    test: () => {
        return bunyan.createLogger({
            name: 'service-temperature-test',
            level: 'fatal'
        });
    }
};

module.exports = {
    openWeatherApiKey: process.env.OPENWEATHER_API_KEY,
    log: (env) => {
        if (env) return log[env]();

        return log[process.env.NODE_ENV || 'development']();
    }
}