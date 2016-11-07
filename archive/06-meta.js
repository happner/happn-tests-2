var test = new Test();

test.initialize('06-meta', function() {

  var happn;
  var service;
  var happn_client;

  var happnInstance;

  var publisherclient;
  var listenerclient;

  var disconnected = false;

  after(function (done) {
    this.test.Context.helper.tearDown(function(e){
      disconnected = true;
      done(e);
    });
  });

  before('should initialize the globals and service', function (callback) {

    var _this = this;
    
    happn = _this.test.Context.happnDependancy;
    happn_client = happn.client;
    service = happn.service;

    happnInstance = null;
    disconnected = false;

    try {

      service.create(_this.test.Context.serviceConfig,
        function (e, happnInst) {

          if (e)
            return callback(e);

          happnInstance = happnInst;
          _this.test.Context.helper.addHappnService(happnInst);

          console.log('initialized services:::');

          callback();
        });
    } catch (e) {
      callback(e);
    }
  });

  /*
   We are initializing 2 clients to test saving data against the database, one client will push data into the
   database whilst another listens for changes.
   */
  before('should initialize the clients', function (callback) {

    var _this = this;

    try {

      happn_client.create(_this.test.Context.getClientConfig(happnInstance),
        function (e, instance) {

          if (e) return callback(e);

          publisherclient = instance;

          _this.test.Context.helper.addHappnClient(publisherclient);

          happn_client.create(_this.test.Context.getClientConfig(happnInstance),

            function (e, instance) {

              if (e) return callback(e);

              listenerclient = instance;

              _this.test.Context.helper.addHappnClient(listenerclient);

              callback();
          });
      });

    } catch (e) {
      callback(e);
    }
  });


  var test_path = '/test/meta/' + require('shortid').generate();
  var test_path_remove = '/test/meta/remove' + require('shortid').generate();
  var test_path_all = '/test/meta/all' + require('shortid').generate();
  var test_path_created_modified = '/test/meta/created_modified' + require('shortid').generate();
  var test_path_created_modified_notmerge = '/test/meta/created_modified_notmerge' + require('shortid').generate();
  var test_path_timestamp = '/test/meta/test_path_timestamp' + require('shortid').generate();
  var test_path_created_modified_update = '/test/meta/test_path_created_modified_update' + require('shortid').generate();
  var test_path_created_modified_update_notmerge = '/test/meta/test_path_created_modified_update_notmerge' + require('shortid').generate();
  var test_path_not_enumerable = '/test/meta/test_path_not_enumerable' + require('shortid').generate();
  var test_path_not_enumerable_get = '/test/meta/test_path_not_enumerable_get' + require('shortid').generate();
//	We set the listener client to listen for a PUT event according to a path, then we set a value with the publisher client.

  it('tests the set meta data', function (callback) {

    try {
      //first listen for the change
      listenerclient.on(test_path, {event_type: 'set', count: 1}, function (data, meta) {

        expect(meta.path).to.be(test_path);
        callback();

      }, function (e) {

        if (!e) {

          expect(listenerclient.events['/SET@' + test_path].length).to.be(1);

          //then make the change
          publisherclient.set(test_path, {
            property1: 'property1',
            property2: 'property2',
            property3: 'property3'
          }, null, function (e, result) {

            if (e) return callback(e);
            expect(result._meta.path).to.be(test_path);
          });
        }
        else
          callback(e);
      });

    } catch (e) {
      callback(e);
    }
  });

  it('tests the update meta data', function (callback) {

    publisherclient.set(test_path, {
      property1: 'property1',
      property2: 'property2',
      property3: 'property3'
    }, {}, function (e, result) {

      if (e) return callback(e);

      expect(result._meta.path).to.be(test_path);

      callback();

    });

  });

  it('tests the delete meta data', function (callback) {

    publisherclient.set(test_path_remove, {
      property1: 'property1',
      property2: 'property2',
      property3: 'property3'
    }, {}, function (e, result) {

      if (e) return callback(e);


      expect(result._meta.path).to.be(test_path_remove);

      listenerclient.on(test_path_remove, {event_type: 'remove', count: 1}, function (data, meta) {
        expect(meta.path).to.be(test_path_remove);
        callback();
      }, function (e) {

        if (e) return callback(e);

        publisherclient.remove(test_path_remove,
          {},
          function (e, result) {

            if (e) return callback(e);
            expect(result._meta.path).to.be(test_path_remove);
          });
      });
    });
  });

  it('tests created and modified dates, merge', function (callback) {

    publisherclient.set(test_path_created_modified, {
      property1: 'property1',
      property2: 'property2',
      property3: 'property3'
    }, {}, function (e, result) {

      if (e) return callback(e);

      expect(result._meta.created).to.not.be(null);
      expect(result._meta.created).to.not.be(undefined);

      expect(result._meta.modified).to.not.be(null);
      expect(result._meta.modified).to.not.be(undefined);

      expect(result._meta.modified.toString()).to.be(result._meta.created.toString());

      setTimeout(function () {

        publisherclient.set(test_path_created_modified, {
          property4: 'property4'
        }, {merge: true}, function (e, result) {

          if (e) return callback(e);

          publisherclient.get(test_path_created_modified, function (e, result) {

            expect(result._meta.modified > result._meta.created).to.be(true);
            callback();

          });

        })

      }, 1000);

    });
  });

  it('tests created and modified dates, not merge', function (callback) {

    publisherclient.set(test_path_created_modified_notmerge, {
      property1: 'property1',
      property2: 'property2',
      property3: 'property3'
    }, {}, function (e, result) {

      if (e) return callback(e);

      expect(result._meta.created).to.not.be(null);
      expect(result._meta.created).to.not.be(undefined);

      expect(result._meta.modified).to.not.be(null);
      expect(result._meta.modified).to.not.be(undefined);

      expect(result._meta.modified.toString()).to.be(result._meta.created.toString());

      setTimeout(function () {

        publisherclient.set(test_path_created_modified_notmerge, {
          property4: 'property4'
        }, {}, function (e, result) {

          if (e) return callback(e);

          publisherclient.get(test_path_created_modified_notmerge, function (e, result) {

            expect(result._meta.modified > result._meta.created).to.be(true);
            callback();

          });

        })

      }, 1000);

    });
  });

  it('tests created and modified dates for an update, merge', function (callback) {

    publisherclient.set(test_path_created_modified_update, {
      property1: 'property1',
      property2: 'property2',
      property3: 'property3'
    }, {}, function (e, result) {

      if (e) return callback(e);

      expect(result._meta.created).to.not.be(null);
      expect(result._meta.created).to.not.be(undefined);

      expect(result._meta.modified).to.not.be(null);
      expect(result._meta.modified).to.not.be(undefined);

      expect(result._meta.path).to.not.be(null);
      expect(result._meta.path).to.not.be(undefined);

      expect(result._meta.modified.toString()).to.be(result._meta.created.toString());

      var firstCreated = result._meta.created;

      setTimeout(function () {

        publisherclient.set(test_path_created_modified_update, {
          property4: 'property4'
        }, {merge: true}, function (e, result) {

          if (e) return callback(e);

          expect(result._meta.created.toString()).to.be(firstCreated.toString());

          expect(result._meta.created).to.not.be(null);
          expect(result._meta.created).to.not.be(undefined);

          expect(result._meta.modified).to.not.be(null);
          expect(result._meta.modified).to.not.be(undefined);

          expect(result._meta.path).to.not.be(null);
          expect(result._meta.path).to.not.be(undefined);

          publisherclient.get(test_path_created_modified_update, function (e, result) {

            expect(result._meta.created).to.not.be(null);
            expect(result._meta.created).to.not.be(undefined);

            expect(result._meta.modified).to.not.be(null);
            expect(result._meta.modified).to.not.be(undefined);

            expect(result._meta.path).to.not.be(null);
            expect(result._meta.path).to.not.be(undefined);

            expect(result._meta.modified > result._meta.created).to.be(true);
            callback();

          });

        })

      }, 1000);

    });
  });

  it('tests created and modified dates for an update, not merge', function (callback) {

    publisherclient.set(test_path_created_modified_update_notmerge, {
      property1: 'property1',
      property2: 'property2',
      property3: 'property3'
    }, {}, function (e, result) {

      if (e) return callback(e);

      expect(result._meta.created).to.not.be(null);
      expect(result._meta.created).to.not.be(undefined);

      expect(result._meta.modified).to.not.be(null);
      expect(result._meta.modified).to.not.be(undefined);

      expect(result._meta.path).to.not.be(null);
      expect(result._meta.path).to.not.be(undefined);

      var firstCreated = result._meta.created;

      expect(result._meta.modified.toString()).to.be(result._meta.created.toString());

      setTimeout(function () {

        publisherclient.set(test_path_created_modified_update_notmerge, {
          property4: 'property4'
        }, {}, function (e, updateResult) {

          if (e) return callback(e);

          expect(updateResult._meta.created).to.not.be(null);
          expect(updateResult._meta.created).to.not.be(undefined);

          expect(updateResult._meta.modified).to.not.be(null);
          expect(updateResult._meta.modified).to.not.be(undefined);

          expect(updateResult._meta.path).to.not.be(null);
          expect(updateResult._meta.path).to.not.be(undefined);

          expect(updateResult._meta.created.toString()).to.be(firstCreated.toString());

          publisherclient.get(test_path_created_modified_update_notmerge, function (e, result) {

            expect(result._meta.created).to.not.be(null);
            expect(result._meta.created).to.not.be(undefined);

            expect(result._meta.modified).to.not.be(null);
            expect(result._meta.modified).to.not.be(undefined);

            expect(result._meta.path).to.not.be(null);
            expect(result._meta.path).to.not.be(undefined);

            expect(result._meta.modified > result._meta.created).to.be(true);
            callback();

          });

        })

      }, 1000);

    });
  });

  it('searches by timestamps', function (callback) {

    var itemIndexes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    var windowStart = Date.now();

    //we save 10 items, with timestamp path, then do a search with modified, then a search created - ensure the counts are right
    async.eachSeries(itemIndexes,
      function (index, eachCallback) {

        publisherclient.set(test_path_timestamp + index, {
          property4: 'property4',
          ind: index
        }, eachCallback);

      },
      function (e) {

        if (e) return callback(e);

        //now set an 11th after a second

        setTimeout(function () {

          var windowEnd = Date.now();

          publisherclient.set(test_path_timestamp + 10, {
            property4: 'property4',
            ind: 10
          }, function (e, eleventhItem) {

            var searchCriteria = {
              '_meta.created': {
                '$gte': windowStart,
                '$lt': windowEnd
              }
            }

            publisherclient.get('*', {criteria: searchCriteria}, function (e, items) {

              if (e) return callback(e);
              expect(items.length == 10).to.be(true);

              var searchCriteria = {
                '_meta.created': {
                  '$gte': windowEnd
                }
              }

              publisherclient.get('*', {criteria: searchCriteria}, function (e, items) {

                if (e) return callback(e);

                expect(items.length == 1).to.be(true);
                expect(items[0].ind).to.be(10);

                setTimeout(function () {

                  var lastModified = Date.now();

                  publisherclient.set(test_path_timestamp + '0', {
                    modifiedProperty: 'modified'
                  }, {merge: true}, function (e, modifiedItem) {

                    if (e) return callback(e);

                    var searchCriteria = {
                      '_meta.modified': {
                        '$gte': lastModified
                      }
                    }

                    publisherclient.get('*', {criteria: searchCriteria}, function (e, items) {

                      if (e) return callback(e);

                      expect(items.length == 1).to.be(true);
                      expect(items[0].ind).to.be(0);

                      callback();

                    });

                  });

                }, 1000);

              });

            });

          });


        }, 2000);

      });

  });
  
  it('tests the all meta data', function (callback) {

    try {
      //first listen for the change
      listenerclient.onAll(function (data, meta) {

        expect(meta.path).to.be(test_path_all);
        expect(meta.channel).to.be('/ALL@*');

        callback();

      }, function (e) {

        if (e) return callback(e);

        //then make the change
        publisherclient.set(test_path_all, {
          property1: 'property1',
          property2: 'property2',
          property3: 'property3'
        }, null, function (e, result) {

          if (e) return callback(e);

          expect(result._meta.path).to.be(test_path_all);

        });

      });

    } catch (e) {
      callback(e);
    }
  });

});