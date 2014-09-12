
var timelogApp = angular.module('timelogApp', []);

var categories, totalDur;

timelogApp.controller('EntryListCtrl', function ($scope, $http) {
	$http.get('data/week1simple.json').then(function(res){
    addEntries(res.data);  
    var dtm = new DOMTreeMap('#treemap');
	  dtm.createAreas(categories, totalDur);
	  dtm.sortAreas(categories, totalDur);
	  dtm.squarification();
  });
  // calculate total minutes and hours for some given entries
	// -----------------------
	function addEntries(entries) {
		categories = [];
		totalDur = 0;
		for (var i in entries) {
			var cur = entries[i];
		// convert minutes and seconds to decimal hours for simpler calculations
		var parts = cur.Duration.split(':');
		DecDuration = parts[0]/2.4+parts[1]/144;
		cur.DecDuration=DecDuration;
		// sum up decimal hours
		totalDur+=DecDuration;
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
	};
	$scope.entries = entries;
	$scope.totalDecimalTime  = totalDur;
	$scope.categories = categories;
	}
	// calculate entries opacity
	$scope.getEntryColor = function (entry) {
		var categorySearch =$.grep(categories, function (e, i) { return e.name == entry.Task });
		var shade = categories.indexOf(categorySearch[0])/categories.length;
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


