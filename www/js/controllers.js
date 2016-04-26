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
.controller('ConfigCtrl', function($scope, $timeout, $cordovaFileTransfer) {

   $scope.upload = function() {

    var url = "http://ionicframework.com/img/ionic-logo-blog.png";
    var targetPath = cordova.file.externalRootDirectory + "auguri.png";
    var trustHosts = true;
    var options = {};

    //if($cordovaDevice.getPlatform() == 'iOS'){
    if( ionic.Platform.isAndroid() ){
       targetPath = cordova.file.externalRootDirectory + "auguri.png";
    }else{
       targetPath = cordova.file.dataDirectory + "auguri.png";
    }

    $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
      .then(function(result) {
        // Success!
         console.log('Success' + targetPath);
      }, function(err) {
        // Error
         console.log('Error' + targetPath);
      }, function (progress) {
        $timeout(function () {
          $scope.downloadProgress = (progress.loaded / progress.total) * 100;
        });
      });
   alert("upload > " + targetPath); 
    }
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
});
