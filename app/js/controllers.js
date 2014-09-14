
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

		// HSV to RGB function from http://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
		// --------------------
		function hsvToRgb(h, s, v) {

			var r, g, b, i, f, p, q, t;
			if (h && s === undefined && v === undefined) {
				s = h.s, v = h.v, h = h.h;
			}
			i = Math.floor(h * 6);
			f = h * 6 - i;
			p = v * (1 - s);
			q = v * (1 - f * s);
			t = v * (1 - (1 - f) * s);
			switch (i % 6) {
				case 0: r = v, g = t, b = p; break;
				case 1: r = q, g = v, b = p; break;
				case 2: r = p, g = v, b = t; break;
				case 3: r = p, g = q, b = v; break;
				case 4: r = t, g = p, b = v; break;
				case 5: r = v, g = p, b = q; break;
			}
			return {
				r: Math.floor(r * 255),
				g: Math.floor(g * 255),
				b: Math.floor(b * 255)
			};
		}

		for (var i in categories) {
			var v = 1.0;
			var s = 0.8;
			var h = i/(categories.length-1)*0.1;
			var c = hsvToRgb(h, s, v);
			categories[i].color = 'rgb('+c.r+','+c.g+','+c.b+')';
		}
		service.entries=entries;

		// notify users of this service
		$rootScope.$broadcast('Log.update');
	}
// function so that we don't have to store the categorycolor within each entry
service.getColor = function (categoryName) {
	var categorySearch =$.grep(this.categories, function (e) { return e.name == categoryName});
	return categorySearch[0].color;
};

	return service;
}]);


var timeline = ['$scope', 'Log', function ($scope, Log) {
	$scope.$on( 'Log.update', function () {
		$scope.log = Log;
		console.log('added entries to views scope');
		console.log($scope);
	});
}];

var treemap = ['$scope', '$window', 'Log', function ($scope, $window, Log) {
	
	var ctm = new DOMTreeMap('#treemap');
  var w = angular.element($window);

  function updateTreemap () {

  	ctm.updateSize();
	  ctm.createAreas(Log.categories, Log.totalDur);
	  ctm.sortAreas(Log.categories, Log.totalDur);
	  ctm.squarification();

	  console.log('updating treemap');
  	$scope.log = Log;
  	$scope.blocks = ctm.blocks;
  	$scope.$apply();
  }
  
	$scope.$on('Log.update', updateTreemap);
  w.bind('resize', updateTreemap);

}];

timelogApp.controller('entries.timeline', timeline);
timelogApp.controller('entries.treemap', treemap);


