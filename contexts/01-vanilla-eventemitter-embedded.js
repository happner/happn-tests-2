var happn = require('happn-3')

module.exports = {
  happnDependancy:require('happn-3'),
  description:"eventemitter embedded functional tests",
  serviceConfig:{},
  publisherClient:function(happnInstance, callback){

		happnInstance.services.session.localClient(callback);
  },
  listenerClient:function(happnInstance, callback){

		happnInstance.services.session.localClient(callback);
  }
}