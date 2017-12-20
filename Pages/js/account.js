﻿
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

	if (password == "" || id == "" || email == "") {
		alert("값은 공백일 수 없습니다!");
		return;
	}
	else if (!email.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
		alert("잘못된 이메일 형식입니다!");
		return;
	}

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