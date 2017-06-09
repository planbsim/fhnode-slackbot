'use strict'

const RtmClient = require('@slack/client').RtmClient;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

class SlackClient {
    constructor(token, nlp, botName, logLevel, log, serviceRegistry) {
        this._rtm = new RtmClient(token, {logLevel: logLevel});
        this._log = log;
        this._nlp = nlp;
        this._botName = botName;
        this._addAuthenticateHandler(this._handleOnAuthenticated);
        this._registry = serviceRegistry;
    }

    _handleOnMessage(message) {
        if (message.text && message.text.toLowerCase().includes(this._botName)) {
            //this._rtm.sendMessage('42', message.channel);
            //console.log("message received");
            this._nlp.ask(message.text, (err, res) => {

                if (err) {
                    this._log.fatal(err);
                    return;
                }

                try {
                    if (!res.intent || !res.intent[0] || !res.intent[0].value) {
                        throw new Error("Could not extract intent");
                    }

                    //const intent = res.intent[0].value;
                    const intent = require('./intents/' + res.intent[0].value + 'Intent');

                    intent.process(res, this._registry, this._log, (error, response) => {
                        if (error) {
                            this._log.fatal(error.message);
                            return;
                        } else {
                            return this._rtm.sendMessage(response, message.channel)
                        }
                    });

                    //return this._rtm.sendMessage(`Received question for intent ${res.intent[0].value}`, message.channel);
                } catch (err) {
                    this._log.info(err);
                    this._log.info(res);
                    return this._rtm.sendMessage("I do not know what are you talking about", message.channel);
                }
            });
        }
    }

    _handleOnAuthenticated(rtmStartData) {
        this._log.info(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}`);
    }

    _addAuthenticateHandler(handler) {
        /* this does assign the current function */
        this._rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, handler.bind(this));
    }

    start(handler) {
        this._addAuthenticateHandler(handler);
        this._rtm.on(RTM_EVENTS.MESSAGE, this._handleOnMessage.bind(this));
        this._rtm.start();
    }
}

module.exports = SlackClient;