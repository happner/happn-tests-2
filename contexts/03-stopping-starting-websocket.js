var happn = require('happn')
var happn_client = happn.client;

module.exports = {
  happnDependancy:require('happn'),
  description:"default server configuration",
  serviceConfig:{
    services: {
      data: {
        path: './services/data/service.js'
      }
    }
  },
  getClientConfig:function(service){
  	return {}
  }
}