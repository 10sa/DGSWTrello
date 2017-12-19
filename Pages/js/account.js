
var account = {};

account.Login = function() {
	var username = document.getElementById("ID").value;
	var password = document.getElementById("PW").value;

	Utils.Post(String.format("id={0}&password={1}", username, password), "../apis/account/login", function (response) {
		if (!response.success)
			alert("올바르지 않은 계정 또는 비밀번호입니다.");
		else
			window.location.href = "/Pages/projects";
	});
}

account.Logout = function() {
	Utils.Post(null, "../apis/account/logout");
	window.location.href = "/";
}

account.signup = function () {
	var id = document.getElementById("id").value;
	var password = document.getElementById("password").value;
	var rePassword = document.getElementById("rePassword").value;
	var email = document.getElementById("email").value;

	console.log(password + rePassword);
	var data = String.format("id={0}&password={1}&email={2}", id, password, email);
	if (password == rePassword) {
		Utils.Post(data, "../apis/account/signup", function (response) {
			if (!response.success)
				alert("계정 생성에 실패하였습니다!");
			else
				window.location.href = "/Pages/login";
		});
	}
	else
		alert("비밀번호가 같지 않습니다!");
}

account.getInfo = function (callback) {
	Utils.Post(null, "../apis/account/getAccountInfo", callback);
}