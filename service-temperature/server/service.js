'use-strict'

const express = require('express');
const service = express();
const request = require('superagent');
const moment = require('moment');

module.exports = (config) => {
    const log = config.log();

    service.get('/service/:location', (req, res, next) => {

        request.get('api.openweathermap.org/data/2.5/weather')
            .query({q: req.params.location})
            .query({units: 'metric'})
            .query({appid: config.openWeatherApiKey})
            .end((err, weatherResult) =>
                {
                    if (err) {
                        return next(err);
                    }

                    const temp = weatherResult.body.main.temp;
                    //console.log(weatherResult.body.main.temp);

                    return res.json({result: temp});
                });
    });

    return service;
};