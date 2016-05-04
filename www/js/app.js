// Ionic Starter App - v1.0 - 20160426

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngCsvImport'])

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

    $pouchDB.setDatabase("nraboy-test");
    if(ionic.Platform.isAndroid()) {
         $pouchDB.sync("http://192.168.57.1:4984/test-database");
    } else {
         $pouchDB.sync("http://localhost:4984/test-database");
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
	    console.log("database change " +  JSON.stringify( change, null, 2));
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
	    console.log("database posting " +  JSON.stringify( jsonDocument, null, 2));

            database.post(jsonDocument).then(function(response) {
	        console.log("database response " +  JSON.stringify( response, null, 2));
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

.factory("$fileFactory", function($q, $http, $pouchDB) {

    var File = function() { };

    File.prototype = {


        getParentDirectory: function(path) {
            var deferred = $q.defer();
            //window.resolveLocalFileSystemURI(path, function(fileSystem) {
            window.resolveLocalFileSystemURL(path, function(fileSystem) {
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

            //console.log("fileFactory dataDir " + cordova.file.externalRootDirectory);

            //window.requestFileSystem(cordova.file.externalRootDirectory, 0, function(fileSystem) {

            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function(fileSystem) {

                //console.log("fileFactory getEntriesAtRoot fileSystem" +  JSON.stringify( fileSystem, null, 2));
                var directoryReader = fileSystem.root.createReader();

                //console.log("fileFactory getEntriesAtRoot" +  JSON.stringify(directoryReader, null, 2));
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

            //window.resolveLocalFileSystemURI(path, function(fileSystem) {
            window.resolveLocalFileSystemURL(path, function(fileSystem) {
		console.log("FileSystem checked ", JSON.stringify(fileSystem, null, 2));
		if (fileSystem.isDirectory)  {

                   var directoryReader = fileSystem.createReader();
                   directoryReader.readEntries(function(entries) {
                       deferred.resolve(entries);
                   }, function(error) {
                       deferred.reject(error);
                   });

		} else {
		   //console.log("Path ", JSON.stringify(fileSystem, null, 2));
		   console.log("Path ", fileSystem.nativeURL);

		   fileSystem.file(function(file) {
		       var reader = new FileReader();
			reader.onloadend = function(e) {
				
				//console.log("INPUT " , this.result);	
				var csv_array = processData(this.result);
				//console.log("INPUT " , csv_array);	
				var json = CSV2JSON(this.result);

				for (var key in json) {
				  if (json.hasOwnProperty(key)) {
				    var val = json[key];
				    console.log("record " + key + " = " + val);


				    
			        $pouchDB.save(val).then(function(response) {
            				//$state.go("app.todo");
			        }, function(error) {
			            console.log("ERROR -> " + error);
			        });


				  }
				}	
	 	   		//console.log("Reading contents ", JSON.stringify(json, null, 2));
				console.log("Uploading to DB ", json);
/*
			        $pouchDB.save(json).then(function(response) {
            				//$state.go("app.todo");
			        }, function(error) {
			            console.log("ERROR -> " + error);
			        });
*/


            			//document.querySelector("#textArea").innerHTML = this.result;
            		}
			reader.readAsText(file);
			//reader.readAsCSV(file);
		   });


		   // using http.get example
		   // $http.get(fileSystem.fullPath)
        // 		.success(function (data) {
          //   			// The json data will now be in scope.
            // 			$scope.myJsonData = data;
	// 	   		console.log("Reading contents ", JSON.stringify(data, null, 2));
        // 	   })
	// 	   .error(function (data) {
	// 	      console.log("error reading");
	// 	   });


		   //alert("Path ", JSON.stringify(fileSystem, null, 2));

		   function processData(csv) {
                       var allTextLines = csv.split(/\r\n|\n/);
                       var lines = [];
                       for (var i=0; i<allTextLines.length; i++) {
                           var data = allTextLines[i].split(';');
                               var tarr = [];
                               for (var j=0; j<data.length; j++) {
                                   tarr.push(data[j]);
                               }
                               lines.push(tarr);
                       }
                    // console.log(lines);
		       return (lines);
		     
                   };

		   function CSVToArray( strData, strDelimiter ){
                       // Check to see if the delimiter is defined. If not,
                       // then default to comma.
                       strDelimiter = (strDelimiter || ",");

                       // Create a regular expression to parse the CSV values.
                       var objPattern = new RegExp(
                           (
                               // Delimiters.
                               "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

                               // Quoted fields.
                               "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

                               // Standard fields.
                               "([^\"\\" + strDelimiter + "\\r\\n]*))"
                           ),
                           "gi"
                           );


                       // Create an array to hold our data. Give the array
                       // a default empty first row.
                       var arrData = [[]];

                       // Create an array to hold our individual pattern
                       // matching groups.
                       var arrMatches = null;


                       // Keep looping over the regular expression matches
                       // until we can no longer find a match.
                       while (arrMatches = objPattern.exec( strData )){

                           // Get the delimiter that was found.
                           var strMatchedDelimiter = arrMatches[ 1 ];

                           // Check to see if the given delimiter has a length
                           // (is not the start of string) and if it matches
                           // field delimiter. If id does not, then we know
                           // that this delimiter is a row delimiter.
                           if (
                               strMatchedDelimiter.length &&
                               strMatchedDelimiter !== strDelimiter
                               ){

                               // Since we have reached a new row of data,
                               // add an empty row to our data array.
                               arrData.push( [] );

                           }

                           var strMatchedValue;

                           // Now that we have our delimiter out of the way,
                           // let's check to see which kind of value we
                           // captured (quoted or unquoted).
                           if (arrMatches[ 2 ]){

                               // We found a quoted value. When we capture
                               // this value, unescape any double quotes.
                               strMatchedValue = arrMatches[ 2 ].replace(
                                   new RegExp( "\"\"", "g" ),
                                   "\""
                                   );
               
                           } else {

                               // We found a non-quoted value.
                               strMatchedValue = arrMatches[ 3 ];

                           }


                           // Now that we have our value string, let's add
                           // it to the data array.
                           arrData[ arrData.length - 1 ].push( strMatchedValue );
                       }

                       // Return the parsed data.
                       return( arrData );

                   } // processData


                   function CSV2JSON(csv) {
                       var array = CSVToArray(csv);
                       var objArray = [];
                       for (var i = 1; i < array.length; i++) {
                           objArray[i - 1] = {};
                           for (var k = 0; k < array[0].length && k < array[i].length; k++) {
                               var key = array[0][k];
                               objArray[i - 1][key] = array[i][k]
                           }
                       }

                       var json = JSON.stringify(objArray);
                       var str = json.replace(/},/g, "},\r\n");

                       //return str;
                       return objArray;
                   } // CSV2JSON


		}
			
            }, function(error) {
	        console.log("gtiveURLetEntries file? " + path);
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
          controller: 'ImportCtrl'
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
  .state('app.todo', {
      url: '/todo',
      views: {
        'menuContent': {
          templateUrl: 'templates/todo.html',
          controller: 'TodoCtrl'
        }
      }
    })
  .state('app.item', {
      url: '/item/:documentId/:documentRevision',
      views: {
        'menuContent': {
          templateUrl: 'templates/item.html',
          controller: 'TodoCtrl'
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
