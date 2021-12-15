export function ActivityMonitor(on_activity, on_inactivity, activity_timeout, inactivity_timeout, events) {
	this.timer = null;
	this.timeout = inactivity_timeout || 10000;
	this.activity_timer = null; //for event throttling
	this.activity_timeout = activity_timeout || 1000;
	this.last_activity = null;

	this.resetTimer = function() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}

		var self = this;
		this.timer = setTimeout(function() {
			if (self.last_activity + self.timeout + self.activity_timeout
				>= new Date().getTime()) {
				if (on_inactivity) {
					on_inactivity();
				}
			}
		}, this.timeout);
	};

	this.logActivity = function() {
		this.last_activity = new Date().getTime();

		if (on_activity) {
			on_activity();
		}
	};

	this.onActivity = function() {
		if (!this.activity_timer) {
			var self = this;
			this.activity_timer = setTimeout(function(){
				self.logActivity();
				self.resetTimer();

				clearTimeout(self.activity_timer);
				self.activity_timer = null;
			}, this.activity_timeout);
		}
	};

	this.__init__ = function() {
		var self = this;

		if (!events) {
			events = ['click', 'mousemove', 'scroll'];
		} else {
			if (typeof events === 'string') {
				events = [events];
			}
		}

		for (var i = 0; i < events.length; i++) {
			document.addEventListener(events[i], function() {
				self.onActivity();
			});
		}
	};

	this.__init__();
}
