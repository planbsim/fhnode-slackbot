'use-strict'

const request = require('superagent');

module.exports.process = function process(intentData, registry, log, cb) {
    
    if (intentData.intent[0].value !== 'temperature') {
        return cb(new Error('Expected temperature intent but got' + intentData.intent[0].value));
    }

    const location = intentData.location[0].value;

    const service = registry.get('temperature');

    if (!service) { return cb(false, 'No service available') };

    try {
       request.get(`http://${service.ip}:${service.port}/service/${location}`)
        .then((res) => {
            if (!res.body.result) return cb('Error with temperature service');

            return cb(null, `In ${location} the temp is now ${res.body.result}°`);
        },
        (error) => {
            return cb(null, 'Error with temperature service');
        }) 
    } catch (error) {
        return cb(null, 'Error with temperature service');
    }

    //return cb(null, `In ${location} is now NO IDEA`);
}