var logger = require('../lib/logger.js');
var notify = require('./notify.js');

/*
	devices : [{deviceName: device.name, registrationId: registrationId, enabled: true}]
*/

module.exports = function(core) {
	core.on('text', function (text, next) {
		// send push notification when user is mentioned in a text message.
		logger.i("Got text object with mentions, need to send push notification", text);
		var mentions = text.mentions ? text.mentions : [];
		var userObj, devices, payload = {
			title: text.from + " has mentioned you on " + text.to,
			message: text.text
		};
		mentions.forEach(function(user) {
			core.emit("getUsers", {ref: user}, function(err, data) {
				if (data.results.length === 0) return;
				userObj = data.results[0];
				// send pushNotification to user.params.devices
				if (userObj.params.pushNotifications && userObj.params.pushNotifications.devices) {
					devices = userObj.params.pushNotifications.devices;
					devices.forEach(function (device) {
						if (device.hasOwnProperty('registrationId') && device.enabled === true) {
							// send notification
							notify(payload, [device.registrationId]);
						}
					});
				}
			});
		});
		next();
	}, "gateway");
};