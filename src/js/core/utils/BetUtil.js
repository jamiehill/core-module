define(function () {
	
	var sortSelectionByPos = function(a, b) {
		if (a.pos == null && b.pos != null) {
			return -1;
		}
		if (a.pos != null && b.pos == null) {
			return 1;
		}
		if (a.pos == null || b.pos == null) {
			return 0;
		}
		var retValue = a.pos.row - b.pos.row;
		if (retValue == 0) {
			retValue = a.pos.col - b.pos.col;
		}
		return retValue;
	};
	
	//some times pos.row and pos.col start with 1 and some times with 0
	//need sanitisation
	var sanitisePositions = function(selections) {
		
		var rowSanitisationRequired = selections[0].pos && selections[0].pos.row == 0;
		var colSanitisationRequired = selections[0].pos && selections[0].pos.col == 0;
		
		for (var i = 0; i < selections.length; i++) {
			if (rowSanitisationRequired) {
				selections[i].pos.row = selections[i].pos.row + 1;
			}
			if (colSanitisationRequired) {
				selections[i].pos.col = selections[i].pos.col + 1;
			}
		}
		
	};
	
	var selectionPositionsAreNull = function(selections) {
		for (var i = 0; i < selections.length; i++) {
			var sel = selections[i];
			if (sel.pos == null) {
				return true;
			}
		}
		return false;
	};
	
	var selectionPositionsRepeated = function(selections) {
		var positionStrings = new Array();
		
		for (var i = 0; i < selections.length; i++) {
			var sel = selections[i];
			var position = sel.pos.row + '|' + sel.pos.col;
			if (positionStrings.indexOf(position) >= 0) {
				return true;
			}
			positionStrings.push(position);
		}
		return false;
	};
	
	var explicitlyUpdatedPositions = function(selections, columnCount) {
		
		var numRows = selections.length / columnCount + 1;
		if (selections.length % columnCount == 0) {
			numRows = numRows - 1;
		}
		
		var currentRowNum = 1;
		var currentColNum = 1;
		
		var _2DArray = new Array();
		for (var i = 1; i <= selections.length; i++) {
			
			var rowName = 'row-' + currentRowNum;
			if (_2DArray[rowName] == null) {
				_2DArray[rowName] = new Array();
			}
			
			var sel = selections[i - 1];
			sel.pos = {row : currentRowNum, col : currentColNum};
			_2DArray[rowName].push(sel);

			currentColNum++;
			if (currentColNum > columnCount) {
				currentColNum = 1;
				currentRowNum++;
			}
			
		}
		
		return _2DArray;
	};

	
	var fillEmptyPositions = function(sortedSelections, columnCount) {

		var _2DArray = new Array();
		
		var expectedRowNum = 1;
		var expectedColNum = 1;
		
		for (var i = 0; i < sortedSelections.length; ) {
			var sel = sortedSelections[i];
			
			var rowName = 'row-' + expectedRowNum;
			if (_2DArray[rowName] == null) {
				_2DArray[rowName] = new Array();
			}
			
			if (sel.pos.row == expectedRowNum && sel.pos.col == expectedColNum) {
				_2DArray[rowName].push(sel);
				i++;
			} else {
				_2DArray[rowName].push({name : '', pos : {row : expectedRowNum, col : expectedColNum}});
			};
			
			if (expectedColNum % columnCount == 0) {
				expectedColNum = 1;
				expectedRowNum++;
			}
			else {
				expectedColNum++;
			}
			
		}
		
		return _2DArray;
	};
	
	var to2DArray = function(selections, columnCount) {
		
		if (!columnCount) {
			columnCount = 3;
		}
		
		if (selectionPositionsAreNull(selections)) {
			return explicitlyUpdatedPositions(selections, columnCount);
		}
		
		var sortedSelections = selections.sort(sortSelectionByPos);
		
		if (selectionPositionsRepeated(sortedSelections)) {
			return explicitlyUpdatedPositions(sortedSelections, columnCount);
		}
		
		//if positions starting with 0, increment all position rows and cols
		sanitisePositions(sortedSelections);
		
		return fillEmptyPositions(sortedSelections, columnCount);
	};

	//public methods go in the following return block
	return {
		to2DArray : to2DArray
	};
});