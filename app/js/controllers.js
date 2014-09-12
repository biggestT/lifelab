
var timelogApp = angular.module('timelogApp', []);

var categories;

timelogApp.controller('EntryListCtrl', function ($scope, $http) {
	$http.get('data/week1.json').then(function(res){
    addEntries(res.data);  
  });
  // calculate total minutes and hours for some given entries
	// -----------------------
	function addEntries(entries) {
		categories = [];
		var total = 0;
		for (var i in entries) {
			var cur = entries[i];
		// convert minutes and seconds to decimal hours for simpler calculations
		var parts = cur.Duration.split(':');
		DecDuration = parts[0]/2.4+parts[1]/144;
		cur.DecDuration=DecDuration;
		// sum up decimal hours
		total+=DecDuration;
		// add category of entry to know categorys if it is a new one
		if (categories.indexOf(cur.Task) < 0) {
			categories.push(cur.Task);
		}
	};
	$scope.entries = entries;
	$scope.totalDecimalTime  = total;
	$scope.categories = categories;
	}
	// calculate entries opacity
	$scope.getEntryColor = function (entry) {
		var shade = categories.indexOf(entry.Task)/categories.length;
		return shade;
	}

});

// total time in old school base 60 format
function getTotalTime(entries) {
	var total =[];
	total.min = 0;
	total.hrs = 0;
	for(var i in entries){
		var parts = entries[i].Duration.split(':');
		total.hrs+=parts[0]*1.0;
		total.min+=parts[1]*1.0;
	}
	total.hrs+=total.min/60
	total.min=total.min%60
	return total;
}


