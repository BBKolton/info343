var mainApp = angular.module('mainApp', ['ui.router']);
var ROOT_API = 'https://info343.xyz/api/'
var CHALLENGE_URL = ROOT_API + 'challenges/all';

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
		controller: 'challengesHomeCtrl'
	})
	.state('challengeView', {
		url: '/challenge/:id',
		templateUrl: '../pages/challengeview.html',
		controller: 'challengeViewCtrl'
	})
	.state('message', {
		url: '/message/:board',
		templateUrl: '../pages/message.html',
		controller: 'messageCtrl'
	}).state('error', {
		url: '*path',
		templateUrl: '../pages/error.html',
		controller: 'errorCtrl'
	})
});

mainApp.controller('homeCtrl', function($scope, $http) {
	$http.get(CHALLENGE_URL).success(function(result){
		var weekView = calendarFeature(result);
		weekView.fullCalendar('changeView', 'basicWeek');
		weekView.fullCalendar('option', 'height', 222);
    });
})

.controller('navCtrl', function($scope, $http) {
    //get a user's name and netId if they're logged in
    $http.get(ROOT_API + 'user').then(function(user) {
	    user = user.data;
    	if (user.status != 2) {
	    	$scope.userWelcome = "Hello, " + user.firstName + 
	    			" " + user.lastName;
	    	//console.log($scope.user);
    	} else {
    		$scope.userWelcome = "Login";
    	}
    });
})

.controller('syllabusCtrl', function($scope) {

})

.controller('calendarCtrl', function($scope, $http) {
	$http.get(CHALLENGE_URL).success(function(result){
		//$scope.challengeList = result;
		calendarFeature(result);
  });
})

.controller('challengesHomeCtrl', function($scope, $http) {
	$http.get(CHALLENGE_URL).success(function(result){
		$scope.challengeList = result;
  });
})

.controller('challengeViewCtrl', function($scope, $http, $stateParams) {
	$http.get('challenge/' + $stateParams.id).success(function(result) {
		console.log(result);
	})
})


.controller('messageCtrl', function($scope, $http, $stateParams) {

	function getMessages() {
		$http.get(ROOT_API + "posts/" + $stateParams.board).then(function(posts) {
			console.log(posts)
			
			var unsorted = [];
			posts = posts.data[0];
			for (post in posts) {
				unsorted[posts[post].id] = posts[post];
			}

			$scope.parents = [];

			for (post in unsorted) {
				if (unsorted[post].parent != 0) {
					if (unsorted[unsorted[post].parent].children === undefined) {
						unsorted[unsorted[post].parent].children = [];
					}
					unsorted[unsorted[post].parent].children.push(unsorted[post]);
				} else {
					$scope.parents.push(unsorted[post]);
				}
			}
		
		})

		$http.get(ROOT_API + 'votes/my').then(function(votes) {
			votes = votes.data;
			console.log(votes)
			$scope.voteButtonStatus = {};
			for (vote in votes) {
				console.log(votes[vote])
				$scope.voteButtonStatus[votes[vote].post] = true;
			}
			console.log($scope.voteButtonStatus);
		});
	}

	$scope.replyAt = null;
	$scope.replyTitle = '';
	$scope.replyText = '';
	$scope.loggedIn = false;
	$scope.userNetId = '';

	$http.get(ROOT_API + 'user').then(function(user) {
		console.log(user.data);
		if (user.data.status && user.data.status == 2) {
			$scope.loggedIn = false;
		} else {
			$scope.loggedIn = true;
			$scope.userNetId = user.data.netId;
			console.log($scope.userNetId)
		}
	});

	getMessages();

	$scope.postReply = function(id) {
		id = (id === 0 ? '' : id);
		var data = $('#form-' + id).serializeArray();
		$http.post(ROOT_API + 'posts/challenge/' + $stateParams.board, {
			title: data[0].value,
			text: data[1].value,
			parent: id
		}).then(function() {
			$scope.replyAt = null;
			getMessages();
		})
	}

	$scope.openReply = function(parent) {	
		$http.get(ROOT_API + 'user').then(function(user) {
			if (user.data.status && user.data.status == 2) {
				window.location = "https://info343.xyz/login";
				$scope.loggedIn = false;
			} else {
				$scope.loggedIn = true;
				$scope.userNetId = user.data.netId;
				parent = (parent === undefined ? 0 : parent);
				$scope.replyAt = parent;
			}
		})
	}

	$scope.upVote = function(id) {
		console.log(id)
		$http.get(ROOT_API + 'user').then(function(user) {
			if (user.data.status && user.data.status == 2) {
				window.location = "https://info343.xyz/login";
				$scope.loggedIn = false;
			} else {
				$scope.loggedIn = true;
				$http.post(ROOT_API + "votes/" + id).then(function() {
					getMessages();
				})
			}
		})
	}

})


// honestly don't know how to pull out an ajax request elegantly...
// used by challenge, calendar, and homepage.

// function requestChallenges(scope, http) {
// 	http.get(CHALLENGE_URL).success(function(result){
// 		scope = result;
//     });
// }

function calendarFeature(list) {
	var parentCalendar = $('.calendar').fullCalendar(
		{
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
    	}	
	);


    return populateEvent(list, parentCalendar);
}

function populateEvent(list, parentCalendar) {
	console.log(list);
	for(var i = 0; i < list.length; i++) {
		var curr = list[i];
		// var eventObj = {
		// 	id: '' + curr.id,
		// 	title: '' + curr.name,
		// 	start: '' + curr.dueDate.substring(0, 10)

		// }
		// console.log(eventObj);
		parentCalendar.fullCalendar('renderEvent',
			{
				id: '' + curr.id,
				title: '' + curr.name,
				start: '' + curr.dueDate.substring(0, 10),
				allDay: true
			},
			true
		);
	}
	return parentCalendar;
}
