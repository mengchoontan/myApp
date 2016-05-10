angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
    
  

      .state('tabsController.teamPage', {
    url: '/page2',
    views: {
      'tab1': {
        templateUrl: 'templates/teamPage.html',
        controller: 'teamPageCtrl'
      }
    }
  })

  .state('tabsController.assessPage', {
    url: '/page3',
    views: {
      'tab2': {
        templateUrl: 'templates/assessPage.html',
        controller: 'assessPageCtrl'
      }
    }
  })

  .state('tabsController.analysePage', {
    url: '/page4',
    views: {
      'tab3': {
        templateUrl: 'templates/analysePage.html',
        controller: 'analysePageCtrl'
      }
    }
  })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('tabsController.student', {
    url: '/page5',
    views: {
      'tab1': {
        templateUrl: 'templates/student.html',
        controller: 'studentCtrl'
      }
    }
  })

  .state('tabsController.sports', {
    url: '/page6',
    views: {
      'tab1': {
        templateUrl: 'templates/sports.html',
        controller: 'sportsCtrl'
      }
    }
  })

  .state('tabsController.team', {
    url: '/page7',
    views: {
      'tab1': {
        templateUrl: 'templates/team.html',
        controller: 'teamCtrl'
      }
    }
  })

  .state('import', {
    url: '/page8',
    templateUrl: 'templates/import.html',
    controller: 'importCtrl'
  })

$urlRouterProvider.otherwise('/page1/page4')

  

});
