var happn = require('happn-3')
var happn_client = happn.client;

module.exports = {
  happnDependancy:require('happn-3'),
  description:"eventemitter embedded functional tests with encrypted payloads",
  serviceConfig:{
	  secure:true,
	  encryptPayloads:true
  },
  publisherClient:function(happnInstance, callback){

    var config =  {
			username:'_ADMIN',
			password:'happn'
		};

		happnInstance.services.session.localClient(config, callback);

  },
  listenerClient:function(happnInstance, callback){

  	var config =  {
			username:'_ADMIN',
			password:'happn'
		};

		happnInstance.services.session.localClient(config, callback);

  }
};