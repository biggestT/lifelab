
var timelogApp = angular.module('timelogApp', []);

timelogApp.service('Log', ['$rootScope', '$http', function ($rootScope, $http) {
	
	var service = {
		// data provided by service
		// ---------------------
		entries: $http.get('data/week1simple.json').then(function (res) { addEntries(res.data) }),
		totalDur: 0,
		categories: []
	};

	// add entries to log and calculate metadata about this log
	// -----------------------
	function addEntries (entries) {
		var categories = service.categories;
		for (var i in entries) {
			var cur = entries[i];
			// convert minutes and seconds to decimal hours for simpler calculations
			var parts = cur.Duration.split(':');
			DecDuration = parts[0]/2.4+parts[1]/144;
			cur.DecDuration=DecDuration;
			// sum up decimal hours
			service.totalDur+=DecDuration;
			// add category of entry to know categorys if it is a new one
			var categorySearch =$.grep(categories, function (e) { return e.name == cur.Task});
			if (categorySearch.length === 0 ) {
				var newCategory = [];
				newCategory.name = cur.Task;
				newCategory.dur = DecDuration;
				categories.push(newCategory);
			} else {
				categorySearch[0].dur += DecDuration;
			}
		}
		for (var i in categories) {
			categories[i].opacity=i/(categories.length-1);
		}
		service.entries=entries;

		// notify users of this service
		$rootScope.$broadcast('Log.update');
	}

	return service;
}]);

var timeline = ['$scope', 'Log', function ($scope, Log) {
	$scope.$on( 'Log.update', function () {
		$scope.log = Log;
		$scope.getColor = function (category) {
			var categorySearch =$.grep(Log.categories, function (e) { return e.name == category});
			return categorySearch[0].opacity;
		};
		console.log('added entries to views scope');
		console.log($scope);
	});
}];

var treemap = ['$scope', 'Log', function ($scope, Log) {
	var ctm = new DOMTreeMap('#treemap');
	$scope.$on( 'Log.update', function () {
		$scope.log = Log;
	  ctm.createAreas(Log.categories, Log.totalDur);
	  ctm.sortAreas(Log.categories, Log.totalDur);
	  ctm.squarification();
		$scope.blocks = ctm.blocks;
	})
}];

timelogApp.controller('entries.timeline', timeline);
timelogApp.controller('entries.treemap', treemap);




