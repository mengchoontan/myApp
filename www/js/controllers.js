angular.module('starter.controllers', ['ionic', 'ngCordova'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})
.controller('ConfigCtrl', function($scope, $timeout, $cordovaFileTransfer, $ionicPlatform, $fileFactory) {

   var fs = new $fileFactory();


   $ionicPlatform.ready(function() {

   fs.getEntriesAtRoot().then(function(result) {
            $scope.files = result;
            console.log("getRoot" +  JSON.stringify($scope.files, null, 2) );
        }, function(error) {
            console.error(error);
   })
   ;

   $scope.upload = function() {

    var url = "http://ionicframework.com/img/ionic-logo-blog.png";
    var targetPath = cordova.file.documentsDirectory + "auguri.png";
    var trustHosts = true;
    var options = {};

    //if($cordovaDevice.getPlatform() == 'iOS'){
    if( ionic.Platform.isAndroid() ){
       targetPath = cordova.file.documentsDirectory + "Aauguri.png";
    }else{
       //targetPath = cordova.file.dataDirectory + "auguri.png";
       targetPath = cordova.file.documentsDirectory + "Iauguri.png";
    }
   console.log("upload > " + targetPath); 

   $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
      .then(function(result) {
        // Success!
         console.log('Success' , targetPath);
      }, function(err) {
        // Error
         console.log('Error' , targetPath);
      }, function (progress) {
        $timeout(function () {
          $scope.downloadProgress = (progress.loaded / progress.total) * 100;
        });
      });
      alert("upload > " + targetPath);
    }

   $scope.getContents = function(path) {

	    alert("Path " + path);
            fs.getEntries(path).then(function(result) {
                $scope.files = result;
                $scope.files.unshift({name: "[parent]"});
                fs.getParentDirectory(path).then(function(result) {
                    result.name = "[parent]";
                    $scope.files[0] = result;
                });
            });


   }

 });

})

.controller('BrowseCtrl0', function($scope, $stateParams) {
   alert("BrowseCtrl");
})

.controller('FileCtrl', function($scope, $stateParams, $rootScope, $state, $ionicHistory, $pouchDB ) {

   console.log("FileCtrl");

   $scope.items = [
    { "firstname": "filename", "lastname": "lastname", "email": "email" },
    { "firstname": "filename", "lastname": "lastname", "email": "email" }

   ];
   
   $scope.filepathChooser = function() {
     window.plugins.mfilechooser.open([], function (uri) {
       //Here uri provides the selected file path.
      console.log('file path', uri);
      alert(uri);
      $scope.save(uri, 'lastname', 'email');
      }, function (error) {
        console.log('Error', error);
     alert(error);
    });
   };

   $scope.save = function(firstname, lastname, email) {
    console.log('Saving ', firstname);
    var jsonDocument = {
        "firstname": firstname,
        "lastname": lastname,
        "email": email
    };
    if($stateParams.documentId) {
        jsonDocument["_id"] = $stateParams.documentId;
        jsonDocument["_rev"] = $stateParams.documentRevision;
        console.log('documentId ',  jsonDocument["_id"]);
    }
    $pouchDB.save(jsonDocument).then(function(response) {
        //$state.go("app.filechoose");
        $state.go("list");
    }, function(error) {
        console.log("ERROR -> " + error);
    });
   };

})

.controller("BrowseCtrl", function($scope, $ionicPlatform, $fileFactory) {

    var fs = new $fileFactory();

   $scope.playlists = [
    { name: 'Reggae', id: 1 },
    { name: 'Chill', id: 2 },
    { name: 'Dubstep', id: 3 },
    { name: 'Cowbell', id: 6 }
   ];

    $ionicPlatform.ready(function() {
        fs.getEntriesAtRoot().then(function(result) {

            console.log("BrowseCtrl - fs.getEntriesAtRoot Filelist >>" + JSON.stringify(result, null, 4));
            $scope.files = result;
        }, function(error) {
            console.error(error);
            console.log(error);
        });


        $scope.getContents = function(path) {
	    console.log("Browse path " + path);
            fs.getEntries(path).then(function(result) {
                $scope.files = result;
                $scope.files.unshift({name: "[parent]"});
                fs.getParentDirectory(path).then(function(result) {
                    result.name = "[parent]";
                    $scope.files[0] = result;
                });
            });
        }
    });

})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
