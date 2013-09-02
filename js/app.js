var app = app || {};

(function ($) {
	'use strict';

	app.AppView = Backbone.View.extend({

		// Bind app to existing HTML div
		el: '#treemap',

		initalize: function() {
			
		}
		
		
	$.getJSON('week1Simple.json', function( log ) {

		DetailedCategory = function (name) {
			this.name = name;
			this.dur = 0;
			this.entries = new Array();
		};

		Entry = function (startStamp, stopStamp) {

			// Regular expression for extracting date component tokens from string.
			var regEx = /^\s*([0-9]+)\s*-\s*([0-9]+)\s*-\s*([0-9]+)\s*([0-9]+)\s*:\s*([0-9]+)$/;
			
			var r, t; // to store tokens from regular expression findings 
			r = startStamp.match(regEx);
			t = new Date(r[1], r[2], r[3], r[4], r[5]);
			this.start = t.getTime();
			r = stopStamp.match(regEx);
			t = new Date(r[1], r[2], r[3], r[4], r[5]);
			this.stop = t.getTime();
		};


		var categories = new Array();
		var totalDur = 0;
		// tm = new TreeMap('#lab1');

		dtm = new DOMTreeMap('#treemap');

		// TIMESPAN CONSTANTS SETUP

		var weekEntry = new Entry(log[0].Start, log[log.length-1].End);
		var tSpan = weekEntry.stop-weekEntry.start;


		console.log(tSpan);


	  $.each(log, function(key, entry) {

	  	// Set global start value to the start of the first entry

	  	// GET DURATION TO CALCULATE THE PART OF TOTAL DURATION FOR THE TREEMAP

	  	// convert duration from hh:mm to decimal hours float value
	  	var durS = entry.Duration;
	  	durS = durS.replace(":", "");
	  	var l = durS.length;
	  	var dur = parseFloat(durS.substr(0, l-2))/2.4 + parseFloat(durS.substr(l-2, l))/144;
	  	var name = entry.Task;
	  	

			var thisCategory = $.grep(categories, function (item) {
				return (item.name == name);
			})[0];
	  	if ( !thisCategory ) {
  			thisCategory = new DetailedCategory(name);
  			categories.push(thisCategory);
	  	};

	  	thisCategory.dur += dur;
	  	totalDur += dur;
	  	
	  	// Save the current entry in the category objects entry list
	  	thisCategory.entries.push(new Entry(entry.Start, entry.End));
	  
	  });

	  console.log(totalDur);
	  dtm.createEntries(categories);
	  dtm.createAreas(categories, totalDur);
	  dtm.sortAreas(categories, totalDur);
	  dtm.squarification();

	});

});	