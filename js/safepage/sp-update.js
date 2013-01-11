/* updateManager supports two levels of update mechanism.
 * 
 * Updater - an updater is a callback function that handles update itself,
 * meaning it handles retrieval and updating of view itself. Updater is
 * intended to support modules without delta-based update support.
 * 
 * UpdateListener - an update listener subscribes to update events of interest
 * and reacts accordingly. [TO BE IMPLEMENTED LATER]
 * 
 * Usage Examples:
 * 
 * // change update interval to 10 seconds
 * SP.updateManager.setUpdateInterval(10000);
 * 
 * // compute update interval dynamically, per update cycle
 * SP.updateManager.setUpdateInterval(function () {
 *   return calculateInterval();
 * });
 * 
 * // schedule bookmarkupdater to run 6 times
 * SP.updateManager.setUpdater(staticCountUpdater, 6);
 * 
 * // schedule news updater with dynamic run count
 * SP.updateManager.setUpdater(dynamicCountUpdater);
 * 
 * function staticCountUpdater () {
 *   // this function will run 6 times.
 * }
 * 
 * function dynamicCountUpdater () {
 *   if (continueRunning)
 * 		return true; // returning true keeps updater running
 *   else
 * 		return false; // return false kills it.
 * }
 */

SafePage.updateManager = (function() {
	// private variables
	
	var updaters = new Array();
	
	var updating = false;
	
	var updateTimer = null;
	
	var updateInterval = 5000;
	
	// private methods
	
	var indexOfUpdater = function (updater) {
		if (updater) {
			var n = updaters.length;
			for (var i = 0; i < n; i++) {
				if (updaters[i] === updater) {
					return i;
				}
			}
		}
		return -1;
	};
	
	var dispatchUpdates = function () {
		updating = true;
		var i = 0;
		while (i < updaters.length) {
			var updater = updaters[i];
			if (updater) {
				var keep = updater.updateCount != 0;
				if (keep) {
					keep = updater();
					if (updater.updateCount > 0) {
						keep = --updater.updateCount > 0;
					}
					if (keep)
						i++;
					else
						updaters.splice(i, 1);
				}
			}
		}
		rescheduleUpdates(true);
		updating = false;
	};
	
	var rescheduleUpdates = function (force) {
		// dispatchUpdates will reschedule
		if (!updating && updateTimer) {
			clearTimeout(updateTimer);
		}
		updateTimer = null;
		if (!updating || force) {
			if (updaters.length > 0) {
				var interval = updateInterval;
				if (typeof interval == 'function')
					interval = interval();
					
				updateTimer = setTimeout(dispatchUpdates, interval);
			}
		}
	};
	
	return {
		// public variables
		
		setUpdateInterval: function (interval) {
			if (interval)
				updateInterval = interval;
		},
	
		// public methods
		
		setUpdater: function (updater, count) {
			if (updater) {
				updater.updateCount = (count && count > 0) ? count : -1;
				var i = indexOfUpdater(updater);
				if (i < 0) {
					updaters.push(updater);
					rescheduleUpdates();
				}
			}
		},
		
		clearUpdater: function (updater) {
			var i = indexOfUpdater(updater);
			if (i >= 0) {
				updaters.splice(i, 1);
			}
		},
		
		clearAllUpdaters: function () {
			updaters = new Array();
		}
	};
})();
