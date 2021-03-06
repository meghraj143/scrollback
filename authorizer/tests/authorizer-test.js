/*
 This unit test tests the authorizer app. Invalid actions/queries will get a ERR_NOT_ALLOWED error and valid queries will get error as null. 
 These values are asserted for. 
*/

/* jshint mocha: true */
var core = new (require('ebus'))();
var config = require("./../../server-config-defaults.js");
var auth = require('../authorizer.js');
auth(core, config.authorizer);
//var join = {id: 'asfsaf', type: 'join', to:'testroom', user: {role: "registered"}, room: {guides: { authorizer: {openFollow: true}}}};
//var admit = {id: 'osdfkj', type: 'admit', to: 'testroom', role: 'follower', victim:{transitionRole: 'follower', transitionType: 'invite'} };

describe("Authorizer app ", function () {
	// TODO: Make test cases for other actions
	require('./joinPart.js')(core, config.authorizer);
	require('./admitExpel.js')(core, config.authorizer);
});