'use-strict'

const express = require('express');
const service = express();
const request = require('superagent');
const moment = require('moment');

module.exports = (config) => {
    const log = config.log();

    service.get('/service/:location', (req, res, next) => {

        request.get(`https://maps.googleapis.com/maps/api/geocode/json`)
            .query({address: req.params.location})
            .query({key: config.googleGeoApiKey})
            .end((err, geoResult) => {
                if (err) {
                    return next(err);
                }

                console.log(geoResult.body);

                const location = geoResult.body.results[0].geometry.location;
                console.log(location);

                const timestamp = +moment().format('X');

                request.get('https://maps.googleapis.com/maps/api/timezone/json')
                    .query({location: `${location.lat}, ${location.lng}`})
                    .query({timestamp: timestamp})
                    .query({key: config.googleTimeApiKey})
                    .end((err, timeResult) => {
                        if (err) {
                            return next(err);
                        }

                        const result = timeResult.body;

                        //console.log(result);

                        const timeString = moment.unix(timestamp + result.dstOffset + result.rawOffset)
                            .utc().format('dddd, MMMM Do, YYYY, h:mm:ss a');
                            

                        return res.json({ result : timeString });
                    });
                //log.info(`New request for ${req.params.location}`);
                //return res.json({ result : req.params.location });
            });
    });

    return service;
};