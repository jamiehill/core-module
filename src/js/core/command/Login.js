import service from '../service/ApiService';

export default function(user, pass) {
	return new Promise(function(resolve, reject) {
		// if already logged in just resolve
		if (App.session.request('loggedIn')) {
			resolve();
			return; // needed? does resolving the promise interupt the call stack?
		};

		// do the service call
		service.login(user, pass)
			.done(function(resp) {
				App.session.execute('storeSession', resp.Login);
				App.Globals.setLocale('en-'+resp.Login.countryCode.toLowerCase(), false);
				resolve(arguments);
			})
			.fail(function() {
				App.session.execute('clearSession');
				reject(arguments);
			})
	})
}

