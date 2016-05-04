// Ionic Starter App - v1.0 - 20160426

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform, $pouchDB) {


  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    document.addEventListener("resume", function() {
      console.log("The application is resuming from the background");
    }, false);

    $pouchDB.setDatabase("dbLocal");
    if(ionic.Platform.isAndroid()) {
        // $pouchDB.sync("http://192.168.57.1:4984/test-database");
    } else {
        // $pouchDB.sync("http://localhost:4984/test-database");
    }

  });





})


.service("$pouchDB", ["$rootScope", "$q", function($rootScope, $q) {

    var database;
    var changeListener;

    this.setDatabase = function(databaseName) {
        database = new PouchDB(databaseName);
    }

    this.startListening = function() {
        changeListener = database.changes({
            live: true,
            include_docs: true
        }).on("change", function(change) {
            if(!change.deleted) {
                $rootScope.$broadcast("$pouchDB:change", change);
            } else {
                $rootScope.$broadcast("$pouchDB:delete", change);
            }
        });
    }

    this.stopListening = function() {
        changeListener.cancel();
    }

    this.sync = function(remoteDatabase) {
        database.sync(remoteDatabase, {live: true, retry: true});
    }

    this.save = function(jsonDocument) {

        console.log("pouchDB save " +  JSON.stringify( jsonDocument, null, 2));

        var deferred = $q.defer();
        if(!jsonDocument._id) {
            database.post(jsonDocument).then(function(response) {
                deferred.resolve(response);
            }).catch(function(error) {
                deferred.reject(error);
            });
        } else {
            database.put(jsonDocument).then(function(response) {
                deferred.resolve(response);
            }).catch(function(error) {
                deferred.reject(error);
            });
        }
        return deferred.promise;
    }

    this.delete = function(documentId, documentRevision) {
        return database.remove(documentId, documentRevision);
    }

    this.get = function(documentId) {
        return database.get(documentId);
    }

    this.destroy = function() {
        database.destroy();
    }

}])

.factory("$fileFactory", function($q) {

    var File = function() { };

    File.prototype = {


        getParentDirectory: function(path) {
            var deferred = $q.defer();
            window.resolveLocalFileSystemURI(path, function(fileSystem) {
                fileSystem.getParent(function(result) {
                    deferred.resolve(result);
                }, function(error) {
                    deferred.reject(error);
                });
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },

        getEntriesAtRoot: function() {
            var deferred = $q.defer();

    console.log("fileFactory dataDir " + cordova.file.externalRootDirectory);

            //window.requestFileSystem(cordova.file.externalRootDirectory, 0, function(fileSystem) {

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {

                console.log("fileFactory getEntriesAtRoot fileSystem" +  JSON.stringify( fileSystem, null, 2));
                var directoryReader = fileSystem.root.createReader();

                console.log("fileFactory getEntriesAtRoot" +  JSON.stringify(directoryReader, null, 2));
                directoryReader.readEntries(function(entries) {

                    console.log("fileFactory getEntriesAtRoot entries" +  JSON.stringify(entries, null, 2));
                    deferred.resolve(entries);
                }, function(error) {
                    deferred.reject(error);
		    console.log(error);
                });
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        },

        getEntries: function(path) {
            var deferred = $q.defer();

	    console.log("getEntries " + path);
            window.resolveLocalFileSystemURI(path, function(fileSystem) {
                var directoryReader = fileSystem.createReader();
                directoryReader.readEntries(function(entries) {
                    deferred.resolve(entries);
                }, function(error) {
                    deferred.reject(error);
                });
            }, function(error) {
                deferred.reject(error);
            });
            return deferred.promise;
        }

    };

   console.log("fileFactory");

    return File;

})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.config', {
      url: '/config',
      views: {
        'menuContent': {
          templateUrl: 'templates/config.html',
          controller: 'ConfigCtrl'
        }
      }
    })

  .state('app.browse', {
      url: '/browse',
      views: {
        'menuContent': {
          templateUrl: 'templates/browse.html',
          controller: 'BrowseCtrl'
        }
      }
    })
  .state('app.filechoose', {
      url: '/filechoose',
      views: {
        'menuContent': {
          templateUrl: 'templates/filechoose.html',
          controller: 'FileCtrl'
        }
      }
    })
    .state('app.playlists', {
      url: '/playlists',
      views: {
        'menuContent': {
          templateUrl: 'templates/playlists.html',
          controller: 'PlaylistsCtrl'
        }
      }
    })

  .state("list", {
            "url": "/list",
            "templateUrl": "templates/list.html",
            "controller": "FileCtrl"
        })
        .state("item", {
            "url": "/item/:documentId/:documentRevision",
            "templateUrl": "templates/item.html",
            "controller": "FileCtrl"
   })

  .state('app.single', {
    url: '/playlists/:playlistId',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlist.html',
        controller: 'PlaylistCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/playlists');
  // $urlRouterProvider.otherwise('/list');


});
