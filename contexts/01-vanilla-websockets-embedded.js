var happn = require('happn-3')
var happn_client = happn.client;

module.exports = {
  happnDependancy:require('happn-3'),
  description:"websockets embedded functional tests",
  serviceConfig:{},
  publisherClient:function(happnInstance, callback){

	  happn_client.create(undefined, callback);

  },
  listenerClient:function(happnInstance, callback){

	  happn_client.create(undefined, callback);
  }
};