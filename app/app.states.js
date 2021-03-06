/**
 * Load states for application
 * more info on UI-Router states can be found at
 * https://github.com/angular-ui/ui-router/wiki
 */
angular.module('angularstrapApp')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){

    // any unknown URLS go to 404
    $urlRouterProvider.otherwise('/404');
    // no route goes to index
    $urlRouterProvider.when('', '/');
    // use a state provider for routing

    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: 'app/components/home/home.view.html',
            controller: "homeController",
            controllerAs: 'ctrl'
        })
		.state('report', {
            url: '/report/:headerID',
            templateUrl: 'app/components/report/report.view.html',
            controller: "reportController",
            controllerAs: 'ctrl'
        })
        .state('404', {
            url: '/404',
            templateUrl: 'app/shared/404.html'
        })
        .state('about', {
            // we'll add another state soon
            url: '/about/:surveyID',
            templateUrl: 'app/components/about/about.view.html',
            controller: 'aboutController',
            controllerAs: 'ctrl'
        })
		.state('aboutmain', {
            // we'll add another state soon
            url: '/about',
            templateUrl: 'app/components/about/about.view.html',
            controller: 'aboutController',
            controllerAs: 'ctrl'
        });
}]);