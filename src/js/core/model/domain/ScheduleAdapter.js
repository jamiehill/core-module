define(function() {
	return Marionette.Controller.extend({


		/**
		 * Initialize the adapter
		 */
		initialize: function() {
			this.service = ctx.get('streamingService');
			this.cache = ctx.get('eventCache');
			this.vent = ctx.get('vent');

			this.listenTo(this.service, 'streaming:scheduleAmendment', this.onScheduleChange);
		},


		/**
		 *
		 * @param data
		 */
		onScheduleChange: function(data) {
			var schdl = data.sport;
			if (!data) return;

			// update event cache with new inplay events
			var inplay = _.map(schdl.newInplay.event, function(e) {
				e.inplay = true;
				this.cache.updateEvent(e); return e.id;
			}, this);

			// update event cache with new prematch events
			var premat = _.map(schdl.newPrematch.event, function(e) {
				e.inplay = false;
				this.cache.updateEvent(e); return e.id;
			}, this);

			this.noLongerPrematch(schdl.noLongerPrematch, inplay);
			this.noLongerInplay(schdl.noLongerInplay);

			this.newPrematch(premat);
			this.newInplay(schdl.noLongerPrematch, inplay);
		},


		/**
		 * was prematch, but not now inplay - 'schedule:remove'
		 * @param oldPrematch
		 * @param inplay
		 */
		noLongerPrematch: function(oldPrematch, inplay) {
			var ids = _.difference(oldPrematch, inplay);
			if (!!ids.length)
				this.vent.trigger('schedule:remove:prematch', ids);
		},


		/**
		 * was inplay, but no longer - 'schedule:remove'
		 */
		noLongerInplay: function(oldInplay) {
			var ids = _.reduce(oldInplay, function(memo, e) {
				var event = this.cache.getEvent(e.id);
				if (event) {
					event.set({inplay: false});
					memo.push(event.id);
				}
				return memo;
			}, [], this);

			if (!!ids.length)
				this.vent.trigger('schedule:remove:inplay', ids);
		},


		/**
		 *
		 * @param oldInplay
		 */
		newPrematch: function(prematch) {
			if (!!prematch.length)
				this.vent.trigger('schedule:add:prematch', prematch);
		},


		/**
		 * was prematch, now inplay - 'schedule:add:inplay'. id
		 * should be present in 'noLongerPrematch' and 'newInplay'
		 */
		newInplay: function(oldPrematch, inplay) {
			if (!!inplay.length)
				this.vent.trigger('schedule:add:inplay', inplay);
		}
	});
});


