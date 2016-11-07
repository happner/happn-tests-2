var happn = require('happn-3');

module.exports = {
  happnDependancy:require('happn-3'),
  description:"eventemitter embedded functional tests, with security switched on",
  serviceConfig:{
	  secure:true
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
}