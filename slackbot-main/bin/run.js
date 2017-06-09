'use strict';

const config = require('../config');
const log = config.log();

const service = require('../server/service')(config);

const serviceRegistry = service.get('serviceRegistry');

const SlackClient = require('../server/slackClient');

const WitClient = require('../server/witClient');

const http = require('http'); 

const server = http.createServer(service);

const witClient = new WitClient(config.witToken);
const slackClient = new SlackClient(config.slackToken, witClient, config.botName, 'info', log, serviceRegistry);

/** server only run after connection to slack is established */
slackClient.start(() => {
    server.listen(process.env.PORT || 3000);
});

server.on('listening', function() {
    log.info(`Slackbot is listening on ${server.address().port} in ${service.get('env')} mode`);
});