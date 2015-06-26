import service from '../service/ApiService';

export default function(user, pass) {
	if (App.session.request('loggedIn')) return;
	service.login(user, pass).done(function(resp) {
		App.session.execute('storeSession', resp.Login);
		App.Globals.setLocale('en-'+resp.Login.countryCode.toLowerCase(), false);
	}).fail(function() {
		App.session.execute('clearSession', resp.Login);
	})
}

