
var timelogApp = angular.module('timelogApp', []);

timelogApp.controller('EntryListCtrl', function ($scope, $http) {
	$http.get('data/week1.json')
       .then(function(res){
          $scope.entries = res.data;  
          var totalTime = getTotalTime($scope.entries);
          $scope.totalHrs=totalTime.hrs;
          $scope.totalMin=totalTime.min;
        });

});

// calculate total minutes and hours for some given entries
// -----------------------

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
	return total
}

