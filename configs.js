module.exports = (function () {
	return {
		dev: {
			host: 'localhost',
			port: '3306',
			user: 'root',
			password: '1234',
			database: 'dgswproject'
		} ,
		real: {
			host: 'localhost',
			port: '3306',
			user: 'root',
			password: '1234',
			database: 'dgswproject'
		},

		kakaotalk: {
			client_id: "3d6af9ff52d108cc3a3d260e0316e7a8",
			callbackURL: "http://localhost:3000/apis/account/login/kakao/callback"
		}
	}
})();