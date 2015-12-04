var mainApp = angular.module('mainApp', ['ui.router']);
var CHALLENGE_URL = 'https://info343.xyz/api/challenges/all';

mainApp.config(function($stateProvider) {

	$stateProvider.state('default', {
		url: '',
		templateUrl: '../pages/home.html',
		controller: 'homeCtrl'
	})
	.state('home', {
		url: '/',
		templateUrl: '../pages/home.html',
		controller: 'homeCtrl'
	})
	.state('syllabus', {
		url: '/syllabus',
		templateUrl: '../pages/syllabus.html',
		controller: 'syllabusCtrl'
	})
	.state('calendar', {
		url: '/calendar',
		templateUrl: '../pages/calendar.html',
		controller: 'calendarCtrl'
	})
	.state('challenges', {
		url: '/challenges',
		templateUrl: '../pages/challenges.html',
		controller: 'challengesCtrl'
	})
	.state('message', {
		url: '/message',
		templateUrl: '../pages/message.html',
		controller: 'messageCtrl'
	}).state('error', {
		url: '*path',
		templateUrl: '../pages/error.html',
		controller: 'errorCtrl'
	})
});

mainApp.controller('homeCtrl', function($scope) {
	var weekView = calendarFeature();
	weekView.fullCalendar('changeView', 'basicWeek');
	weekView.fullCalendar('option', 'height', 222);
})

.controller('syllabusCtrl', function($scope) {

})

.controller('calendarCtrl', function($scope) {
	calendarFeature();
})

.controller('challengesCtrl', function($scope,  $http) {
	$http.get(CHALLENGE_URL).success(function(result){
		$scope.challengeList = result;
    })
})

.controller('messageCtrl', function($scope) {

});

function calendarFeature() {
	return $('.calendar').fullCalendar({
        // put your options and callbacks here
        events: [
	        {
	            title:  'Testing; presentations',
	            start:  '2015-12-03T08:30:00',
	            allDay: false
	        }
        	// other events here...
        	// will likely be reading from a json file or database to input values in here
        	// will require some function to reduce redundancy as well
    	],
    	timeFormat: 'h(:mm)'
    })
}