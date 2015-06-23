define(['underscore', 'backbone'],
	function(_, Backbone) {
		return Backbone.Model.extend({

			methodMap: {
				'POST'      : 'create',
				'PUT'       : 'update',
				'DELETE'    : 'delete',
				'POSTJSON'  : 'create',
				'GETJSON'   : 'read',
				'GET'       : 'read'
			},

			headerMap: {
				'GETJSON'   : { 'Accept': 'text/x-json' },
				'POSTJSON'   : { 'Accept': 'application/json', 'Content-Type' : 'application/json'}
			},

			/**
			 * @param options
			 */
			initialize: function(options){
				this.targetsObjs = this.parseTargets(this.targets || {});
				_.bindAll(this, 'createMethod');
				_.each(this.targetsObjs, this.createMethod, this);
			},

			/**
			 * Crete a target object for each provided target method
			 */
			parseTargets: function(targets){
				return _.map(targets, function (options, request) {
					var target = { request: request, method: "get", args:[], secure: false };

					// if is string, the options should only be a method type such as 'POST'
					if (_.isString(options) && !_.isUndefined(options))
						target.method = options.toUpperCase();

					// if is an array, assumed to be an array of required arguments names
					if (_.isArray(options))
						target.args = options;

					// if is a json object, just extend the target object with new values
					if (_.isObject(options))
						_.extend(target, options);

					target.method = target.method.toUpperCase();
					return target;
				});
			},

			/**
			 * Create the actual targets' method on this service.
			 *
			 * Calling the method returns a JQuery Promise object.  This provides a subset
			 * of the callback methods of the Deferred object (then, done, fail, always,
			 * pipe, and state).  This enables multiple ways of responding to a promises
			 * response.
			 *
			 * For example:
			 *
			 *  var promise = this.api.login('jamie', 'password');
			 *
			 *  promise.done(function(resp){
         *      // do something with the success response
         *  });
			 *
			 *  promise.fail(function(resp){
         *      // do something with the failure response
         *  });
			 *
			 *  promise.always(function(resp){
         *      // always do something regardless of outcome
         *  });
			 *
			 * promise.progress(function(prog){
         *      // Get Progress updates if applicable - uploads - if supported by browser
         * };
			 *
			 * You can also use the 'ten' shorthand for adding the previous callbacks in one go:
			 *
			 *  promise.then(doneCallback, failCallback, alwaysCallback);
			 *
			 * @param target
			 */
			createMethod: function (target) {
				var scope = this;
				this[target.request] = function (opts) {
					var deferred     = $.Deferred(),
						options      = scope.createOptions(target, arguments, deferred, scope),
						method       = scope.methodMap[target.method];

					if (opts) _.extend(options, opts);
					Backbone.sync(method, scope, options);
					return deferred.promise(scope);
				}
			},


			/**
			 * @param target
			 * @param data
			 * @param deferred
			 * @returns {{url: string, data: *, success: success, error: error}}
			 */
			createOptions: function(target, data, deferred, scope){
				var secure = !!target.secure;
				var url = target.url || secure && !_.isEmpty(this.surl) ? this.surl() : this.url(),
					payload = data[0];
				if (!!target.rest) {
					if(typeof(target.edit) !== 'undefined'){
						target.request = data[0];
						payload = data[1];
					}else{
						target.request = data[1]+ "/numbers";
					}
				}
				var rest = target.rest || target.request;
				var options = this.addHeaders({
					url     : url.replace(/\/$/, "") + '/' + rest,
					data    : this.getParams(target, data),
					success : function (data, status, xhr) {
						var action = _.has(data, 'Error') ?
							'reject' : 'resolve';
						deferred[action](data, xhr);
					},
					error   : function (xhr, status, err) {
						deferred.reject(err, xhr);
					},
					beforeSend: function(xhr, settings) {
						settings.xhr = function() {
							var xhr = $.ajaxSettings.xhr();

							if (("onprogress" in xhr) && xhr.upload) {
								xhr.upload.addEventListener("progress",
									function (e) {
										deferred.notify(e);
									}, false);
							}

							return xhr;
						}
					}
				}, target.method, target.headers, scope);

				if (target.method == 'GETJSON' || target.method == 'POSTJSON' )
					_.extend(options, {dataType: 'json'});

				if(target.method == 'POSTJSON'){
					_.omit(options, 'data');
					_.extend(options, {data: JSON.stringify(data[0])});
				}
				if(!!target.rest){
					_.omit(options, 'data');
					_.extend(options, {data: JSON.stringify(payload)});
				}
				return options;
			},


			/**
			 * Returns a resolved params object, with all required parameters added
			 * @param args
			 * @param data
			 */
			getParams: function(target, data){
				var params = {}, that = this;

				// iterate through each argument
				_.each(target.args, function(arg, index){

					// if it's a string, it's an expected arg, so take it from the data array
					if (_.isString(arg)){
						params[arg] = data[index];
					}

					// if it's an object, it's either been set with a default
					// value, is optional if no default is specified, or an implicit
					// value.  Should set the default/implicit, before applying user value
					else if (_.isObject(arg)) {
						var keyValue = _.pairs(arg)[0];

						// implicit - as denoted by the 'attr' property

						// the argument value is an 'attr' type object, which denotes an implicit value.
						if (_.isObject(keyValue[1]) && _.has(keyValue[1], 'attr')){
							// get and set the implicit value
							params[keyValue[0]] = that.get(keyValue[1].attr);
						}


						else {

							// default - add default before overwriting with user value
							if (!_.isEmpty(keyValue[1])) {
								params[keyValue[0]] = keyValue[1];
							}

							// user - overwrite with user value
							if (data.length >= index) {
								var val = data[index];

								if (_.isString(val) && !!val.length) {
									params[keyValue[0]] = val;
								}

								else if (_.isNumber(val) && !_.isNaN(val)) {
									params[keyValue[0]] = val;
								}

								else if (_.isBoolean(val)) {
									params[keyValue[0]] = val;
								}
							}
						}
					}
				});

				return $.param(params);
			},

			/**
			 * Extends the target options to include any default headers for the request method type
			 * @param options
			 * @param method
			 * @returns {*}
			 */
			addHeaders: function(options, method, hdrs, that){
				var headers = this.headerMap[method];
				if (headers)
					_.extend(options, { headers: headers });

				// add custom headers
				if (hdrs) {
					if (!_.has(options, 'headers'))
						options.headers = {};

					if (_.isObject(hdrs) && _.has(hdrs, 'attr')){
						hdrs = that.get(hdrs.attr);
					}
					_.extend(options.headers, hdrs);
				}
				return options;
			},


			/**
			 * Extends the backbone 'get' method to return invoked function calls for model attributes:
			 *
			 * defaults: {
         *  robotSays: function(){
         *      return "Beep Beep"
         *  }
         * }
			 *
			 * this.get('robotSays') >  'Beep Beep'
			 *
			 * @param attr
			 * @returns {*}
			 */
			get: function(attr) {
				var value = Backbone.Model.prototype.get.call(this, attr);
				return _.isFunction(value) ? value.call(this) : value;
			}
		});
	});
