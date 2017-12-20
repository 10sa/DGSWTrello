
var project = {};
project.achievementCount = 0;

project.onload = function () {
	account.getInfo(function (response) {
		document.getElementById("usernameLabel").innerText += response.nickname;
		});

	this.refreshProjectList();
}

project.refreshProjectList = function() {
	Utils.Post(null, "../apis/project/getProjects", function (response) {
		if (response.success && response.projects.length > 0) {
			var projectTables = document.getElementById("projectTables");

			console.log(response.projects);
			for (var i = 0; i < response.projects.length; i++)
			{
				var projectId = response.projects[i].projectId;

				Utils.Post(String.format("projectId={0}", projectId), "../apis/project/getProject", function (response) {
					var table = document.createElement("a");
					table.setAttribute("style", "font-size: 16px; text-align: center;");
					table.setAttribute("class", "pull-center hidden-xs");
					table.setAttribute("onclick", String.format("project.loadProject({0}); return false;", response.projectId));
					table.setAttribute("href", "dummy");
					table.innerText = response.projectName;

					projectTables.appendChild(table);
				});
			}
		};
	});
}

project.loadProject = function (projectId) {
	Utils.Post(String.format("projectId={0}", projectId), "../apis/project/getProject", function (response) {
		if (response.success) {
			var json = JSON.parse(response.projectJson);
			var achievements = json.achievements;
			var projectInfo = document.getElementById("projectInfo");
			projectInfo.setAttribute("style", "visibility:visible");

			document.getElementById("projectNameLabel").innerText = response.projectName;
			document.getElementById("projectDescLabel").innerText = response.projectDesc;
			document.getElementById("projectDeadlineLabel").innerText = json.deadline;

			for (var i = 0; i < achievements.length; i++) {
				var achievementsElement = project.createAchievementElement(achievements[i].end, achievements[i].achievement, i);
				if (achievements[i].end)
					document.getElementById("completedAchieves").appendChild(achievementsElement);
				else
					document.getElementById("uncompletedAchieves").appendChild(achievementsElement);
			}
		}
		else
			alert("프로젝트 불러오기 실패!")
	});
}

project.createAchievementElement = function (isEnd, text, id) {
	var achievementElement = document.createElement("li");
	achievementElement.className = "List";
	achievementElement.innerText = text;
	achievementElement.onclick = "project.moveAchievement(" + id + ")";
	achievementElement.id = "achievementElement" + id;

	var spanChild = document.createElement("span");
	achievementElement.appendChild(spanChild);

	spanChild.className = "glyphicon glyphicon-minus";
	spanChild.style = "margin-left: 1%; font-size: 10px;";
	spanChild.onclick = "";
	spanChild.setAttribute("href", "dummy");

	if (isEnd) {
		var endButton = document.createElement("span");
		endButton.className = "glyphicon glyphicon-ok";
		endButton.style = "font-size: 10px;";

		achievementElement.appendChild(endButton);
	}

	return achievementElement;
}

project.moveAchievement = function (id) {
	
}

project.createProject = function () {
	var inputs = [
		document.getElementById("projectName"),
		document.getElementById("projectDesc"),
		document.getElementById("projectDeadline"),
		document.getElementById("projectAchievements")
	]

	var projectName = inputs[0].value;
	var projectDesc = inputs[1].value;
	var projectDeadline = inputs[2].value;

	if (projectName == "" || projectDesc == "" || projectDeadline == "") {
		alert("값은 공백일 수 없습니다!");
		return;
	}

	if (!projectDeadline.match(/(\d{4})-(\d{2})-(\d{2})/)) {
		alert("잘못된 날자 형식입니다!");
		return;
	}

	var query = String.format("name={0}&desc={1}&json={2}", projectName, projectDesc, JSON.stringify({ deadline: projectDeadline, achievements: project.getAchevements() }));
	document.getElementById("closeModal").click();
	Utils.Post(query, "../apis/project/createProject", function (response) {
		if (!response.success)
			alert("프로젝트 생성에 실패하였습니다!");
		else {
			for (var i = 0; i < inputs.length; i++)
				inputs[i].value = "";
			project.clearAchevements();
		}
	});
}

project.getAchevements = function () {
	var array = [];
	for (var i = 0; i < this.achievementCount; i++) {
		array[i] = { achievement: document.getElementById("achievementLabel" + i + "text").innerText, end: false };
	}

	return array;
}

project.clearAchevements = function () {
	for (var i = 0; i < this.achievementCount; i++)
		document.getElementById("achievementLabel" + i).remove();

	this.achievementCount = 0;
}

project.createAchievement = function () {
	var parentDiv = document.getElementById("achievements");
	var textValueDocument = document.getElementById("projectAchievements");
	var text = textValueDocument.value;

	if (text != "") {
		textForm = document.createElement("ul");
		textForm.id = "achievementLabel" + this.achievementCount;
		textForm.appendChild(document.createElement("br"));

		var textFormText = document.createElement("li");
		textFormText.id = textForm.id + "text";
		textForm.appendChild(textFormText);

		textForm.appendChild(document.createElement("br"));
		parentDiv.appendChild(textForm);

		textValueDocument.value = "";
		textFormText.innerText = text;

		var textFormButton = document.createElement("button");
		textFormButton.setAttribute("type", "button");
		textFormButton.setAttribute("id", this.achievementCount);
		textFormButton.setAttribute("class", "btn btn-default");
		textFormButton.setAttribute("onClick", "project.deleteAchievement(" + this.achievementCount + ")");
		textFormButton.innerText = "Delete";

		textForm.appendChild(textFormButton);
		this.achievementCount++;
	}
}

project.deleteAchevement = function(identifier) {
	var textForm = document.getElementById("achievementLabel" + identifier);
	textForm.remove();
}