var happn = require('happn')

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
  	return {
      plugin: happn.client_plugins.intra_process,
      context: service
    }
  }
}