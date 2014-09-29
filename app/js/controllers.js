
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
			cur.decDuration=DecDuration;
			cur.selected = true; 

			 // set date to the midpoint of this entry
			var start = new Date(cur.Start).getTime();
			var end = new Date(cur.End).getTime();
			cur.date = new Date(start + (end-start)/2).toDateString();
			
			service.totalDur+=cur.DecDuration;

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
		service.totalDurSelected=service.totalDur;

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

 service.filterByCategory = function(category) {
		console.log(category);
		angular.forEach(this.entries, function (entry) {
			entry.selected = (entry.Task == category) ? true : false;
		});
		this.selectedCategory=category;
		this.selectedDate=null;
		$rootScope.$broadcast('Log.update');
	};

	service.filterByDate = function(date) {
		console.log(date);
		angular.forEach(this.entries, function (entry) {
			entry.selected = (entry.date == date) ? true : false;
		});
		this.selectedCategory=null;
		this.selectedDate=date;
		$rootScope.$broadcast('Log.update');
	};
	service.selectAll=function(){
		this.selectedCategory=null;
		this.selectedDate=null;
		angular.forEach(this.entries, function (entry) {
			entry.selected = true;
		});
		$rootScope.$broadcast('Log.update');
	};
	service.updateTotalDurations=function(){
		this.totalDur=0.0;
		// var categories = this.categories;
		this.totalDurSelected=0.0;
		for (var i in this.categories) {
			this.categories[i].dur=0.0;
		}
		angular.forEach(this.entries, function (entry) {
			if (entry.selected) { 
				var categorySearch =$.grep(this.categories, function (e) { return e.name == entry.Task});
				categorySearch[0].dur+=entry.decDuration;
				this.totalDurSelected+=entry.decDuration;
			}
			this.totalDur+=entry.decDuration;
		}, this);
	}

	return service;
}]);

// sections of the timeline
// ---------------

var timelineGuide= ['$scope', 'Log', function ($scope, Log) {
	$scope.$on('Log.update', function () {
		// create array of the dayps covered by the log
		// var days=['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		var sections = [];
		var logStart=new Date(Log.entries[0].Start);
		var logEnd=new Date(Log.entries[Log.entries.length-1].End);
		var totalDurMs=logEnd.getTime()-logStart.getTime();

		// first day ms to midnight
		var startToMidnight = new Date(logStart.getFullYear(), logStart.getMonth(), logStart.getDate(), 24,0,0).getTime();
		sections.push({
			durationMs: startToMidnight-logStart.getTime(),
			date: logStart.toDateString(),
			first: true
		});

		var curDate=logStart;
		while (curDate.setDate(curDate.getDate()+1) < logEnd) {
			sections.push({
				durationMs: 86400000, 
				date: curDate.toDateString(),
			})
		}

		// last day ms after midnight
		var endAfterMidnight = new Date(logEnd.getFullYear(), logEnd.getMonth(), logEnd.getDate(), 0,0,0).getTime();
		sections.push({
			durationMs: logEnd.getTime()-endAfterMidnight,
			date: logEnd.toDateString(),
			last: true
		});

		$scope.sections=sections;
		$scope.totalDurMs=totalDurMs;
		$scope.log=Log;
	})
	
	

}];

// timeline of log entries
// -------

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

  	Log.updateTotalDurations();

  	ctm.updateSize();
	  ctm.createAreas(Log.categories, Log.totalDurSelected);
	  ctm.sortAreas();
	  ctm.squarification();

	  console.log('updating treemap');
  	$scope.log = Log;
  	$scope.blocks = ctm.blocks;
  	$scope.$apply();
  }
  
	$scope.$on('Log.update', updateTreemap);
  w.bind('resize', updateTreemap);

 
}];



// timelogApp.filter('selectedEntries', filterEntries)
timelogApp.controller('entries.timeline', timeline);
timelogApp.controller('entries.treemap', treemap);
timelogApp.controller('entries.timelineGuide', timelineGuide);


