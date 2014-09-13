(function () {

	// private utility class area
	var Area = function (a, n, i) {
		this.area = a;
		this.name = n;
		this.index = i;
	};

	DOMTreeMap = function (id) {
		this.$el = $(id);
		console.log(this.$el[0]);
		this.width = this.$el.width();
		this.height = this.$el.height();
		this._size = this.width*this.height;

		// Initialize free subrectangle to cover the whole div
		this._free = [];
		this._free.width = this.width;
		this._free.height = this.height;
		this._free.top = 0;
		this._free.left = 0;
		console.log(this._free);

	};

	DOMTreeMap.prototype.createAreas = function (data, total) {
			
		var areas = [];
		for (var i = data.length - 1; i >= 0; i--) {
			var currArea = (data[i].dur / total) * this._size;
			areas[i] = new Area(currArea, data[i].name, i);
			console.log(currArea);
		};

		this._areas = areas;
	}

	DOMTreeMap.prototype.sortAreas = function () {
		this._areas.sort( function (a, b) {
			return b.area - a.area;
		});
	}

	DOMTreeMap.prototype.createTimeBlock = function (name, index, x, y, w, h) {
		var block = [];
		block.width = w;
		block.height = h;
		block.top = y;
		block.left = x;
		block.name = name;
		block.fontSize = Math.max(w/this.width * 10, 1);
		return block;
	};

	DOMTreeMap.prototype.addRow = function (row, tot) {

		var widthSmallest = (this._free.width <= this._free.height) ? true : false;
		var heightSmallest = !widthSmallest;

		var xStart = this._free.left;
		var yStart = this._free.top;
		var freeArea = this._free.width * this._free.height;

		var width, height;
		
		for (var i = 0; i < row.length; i++) {
			if (heightSmallest) {
				width = tot / freeArea * this._free.width;
				height = row[i].area / tot * this._free.height;
			}
			else {
				height = tot / freeArea * this._free.height;
				width = row[i].area / tot * this._free.width;
			}
			var block = this.createTimeBlock(row[i].name, row[i].index, xStart, yStart, width, height);
			xStart += (heightSmallest) ? 0 : width;
			yStart += (widthSmallest) ? 0 : height;

			// add block to the others
			this.blocks.push(block);
		};
		this._free.left = (heightSmallest) ? this._free.left + width : this._free.left;
		this._free.top = (widthSmallest) ? this._free.top + height : this._free.top;
		this._free.width = (heightSmallest) ? this.width - this._free.left : this._free.width;
		this._free.height = (widthSmallest) ? this.height - this._free.top : this._free.height;
		console.log('free space after addition: ' + this._free.width  + ' ' + this._free.height);
		console.log(' xStart: ' + xStart + ' yStart: ' + yStart);
	};

	// Implementation of subdivision algorithm explained in:
	// http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.36.6685&rep=rep1&type=pdf

	DOMTreeMap.prototype.squarification = function () {

		var map = this;

		// Clear or initiate the array that contain all the blocks
		this.blocks = [];
		
		var worstAspectRatio = function (tot, areas, w) {
			if(areas.length === 0) {
				console.log('outputting min aspect ratio: ' + Number.MAX_VALUE);
				return Number.MAX_VALUE;
			}
			var maxArea = (areas.length !== 0) ? areas[0].area : 0;
			var minArea = (areas.length > 1) ? areas[areas.length-1].area : maxArea;
			
			var aspect1 = (w*w*maxArea)/(tot*tot);
			var aspect2 = (tot*tot)/(w*w*minArea);
			var max = Math.max(aspect1, aspect2 );
			console.log('max: ' + maxArea + 'min: ' + minArea);
			console.log('aspect1: '+ aspect1 + ' aspect2: ' + aspect2);
			console.log('worst aspect: '+ max);
			return max;
		};

		var width = function () {
			var min = Math.min(map._free.width, map._free.height);
			return min;
		}

		squarify = function (areas, row, w) {

			var curr = areas[0];

			var newRow = row.slice(0);
			newRow.push(curr);

			var oldTotArea = 0;
			for (var i = 0; i < row.length; i++) {
				oldTotArea += row[i].area;
			};
			if (areas.length === 0 ) { 
				map.addRow(row, oldTotArea);
				return; 
			}

			var newTotArea = oldTotArea;
			newTotArea += curr.area;

			console.log('old row: '+ JSON.stringify(row) + 'area: ' + oldTotArea);
			console.log('new row: '+ JSON.stringify(newRow) + 'area: ' + newTotArea);
			console.log('w  '+ w);

			console.log('calculating old row worst aspect \n -----------');
			var oldRowWorst = worstAspectRatio(oldTotArea, row, w);
			console.log('calculating new row worst aspect \n  -----------');
			var newRowWorst = worstAspectRatio(newTotArea, newRow, w);

			if (  oldRowWorst <= newRowWorst  ) {
				console.log(' %c laying out row',  'color: red;');
				map.addRow(row, oldTotArea);
				squarify( areas, [], width());
			}
			else {
				console.log(' %c adding more on same row', 'color: blue;');
				areas.shift(); 
				squarify(areas, newRow, w);
			}
		};
		var areasCopy = this._areas.slice(0);
		console.log(areasCopy);
		squarify(areasCopy, [], width());
	};

}(jQuery));