/**
 * Created by jamie on 4/20/15.
 */
define(['backbone.marionette', 'underscore'],
	function (Marionette, _) {
		return Marionette.Controller.extend({


			/**
			 * @param model
			 * @param options
			 */
			initialize: function(model, options){
				// consume options and set default persistence type
				this.options = _.extend(this.options, options || {});
				this.options = _.defaults(this.options, {persistence: 'cookie', name: 'session'});

				// set the type of persistence to use
				var persistence = this.options.persistence;
				this.store = this[persistence];

				// turn on automatic storage of JSON objects
				$.cookie.json = true;

				// cookie defaults
				$.cookie.defaults = {
					secure: false
				}
			},


			// proxy storage methods for convenience


			get: function(name) {
				name = name || this.options.name;
				return this.store.get(name);
			},
			set : function(model, name) {
				name = name || this.options.name;
				return this.store.set(name, model);
			},
			check : function(name) {
				name = name || this.options.name;
				return this.store.check(name);
			},
			clear: function(name) {
				name = name || this.options.name;
				return this.store.clear(name);
			},


			// Stores


			sessionStorage : {
				get: function(name) {
					var data = sessionStorage.getItem(name);
					//if (_.isEmpty(data)) return null;
					//if (_.isObject(data)) {
					//    return data && JSON.parse(data);
					//}
					return data;
				},
				set: function(name, model) {
					var data = _.clone(model.attributes);
					delete data.__proto__;
					delete data.vent;
					data = _.isObject(data) ? JSON.stringify(data) : data;
					return sessionStorage.setItem(name, data);
				},
				check: function(name) {
					return sessionStorage.getItem(name) != null;
				},
				clear: function(name) {
					return sessionStorage.removeItem(name);
				}
			},


			localStorage: {
				get: function(name) {
					var data = localStorage.getItem(name);
					//if (_.isEmpty(data)) return null;
					//if (_.isObject(data)) {
					//    return data && JSON.parse(data);
					//}
					return data;
				},
				set: function(name, model) {
					var data = _.clone(model.attributes);
					delete data.__proto__;
					delete data.vent;
					//delete data.accountBalance;
					data = _.isObject(data) ? JSON.stringify(data) : data;
					return localStorage.setItem(name, data);
				},
				check: function(name) {
					return localStorage.getItem(name) != null;
				},
				clear: function(name) {
					return localStorage.removeItem(name);
				}
			},


			cookie: {
				get: function(name) {
					return $.cookie(name);
				},
				set: function(name, model) {
					var data = _.clone(model.attributes);
					delete data.__proto__;
					delete data.vent;

					//console.log('Store :: '+JSON.stringify(data));
					return $.cookie(name, data);
				},
				check: function(name) {
					return $.cookie(name) != null;
				},
				clear: function(name) {
					return $.removeCookie(name);
				}
			}
		});
	});
