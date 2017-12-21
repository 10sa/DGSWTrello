
var project = {};
project.achievementCount = 0;

project.onload = function () {
	account.getInfo(function (response) {
		document.getElementById("usernameLabel").innerText += response.nickname;
		});

	this.refreshProjectList();
}

project.refreshProjectList = function () {
	Utils.Post(null, "../apis/project/getProjects", function (response) {
		if (response.success && response.projects.length > 0) {
			var projectTables = document.getElementById("projectTables");
			while (projectTables.hasChildNodes()) {
				if (projectTables.lastChild.id == "addProjectButton")
					break;
				else
					projectTables.removeChild(projectTables.lastChild);
			}

			for (var i = 0; i < response.projects.length; i++)
			{
				var projectId = response.projects[i].projectId;

				Utils.Post(String.format("projectId={0}", projectId), "../apis/project/getProject", function (response) {
					var table = document.createElement("a");
					table.setAttribute("style", "font-size: 16px; text-align: center; cursor: pointer");
					table.setAttribute("class", "pull-center hidden-xs");
					table.setAttribute("onclick", String.format("project.loadProject({0}); return false;", response.projectId));
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
			delete response.success;

			project.currentProject = response;
			var json = JSON.parse(response.projectJson);
			var achievements = json.achievements;
			var projectInfo = document.getElementById("projectInfo");
			projectInfo.setAttribute("style", "visibility:visible");
			project.currentProject.projectJson = json;

			var completeAchieves = document.getElementById("completedAchieves");
			var uncompleteAchieves = document.getElementById("uncompletedAchieves");
			Utils.ClearChildNodes(completeAchieves);
			Utils.ClearChildNodes(uncompleteAchieves);
			
			document.getElementById("projectNameLabel").innerText = response.projectName;
			document.getElementById("projectDescLabel").innerText = response.projectDesc;
			document.getElementById("projectDeadlineLabel").innerText = json.deadline;

			var endAchievementCount = 0;
			for (var i = 0; i < achievements.length; i++) {
				var achievementsElement = project.createAchievementElement(achievements[i].end, achievements[i].achievement, i);
				
				if (achievements[i].end) {
					completeAchieves.appendChild(achievementsElement);
					endAchievementCount++;
				}
				else
					uncompleteAchieves.appendChild(achievementsElement);
			}

			var percent = (endAchievementCount / achievements.length) * 100;
			var progressBar = document.getElementById("projectProgressbar");
			progressBar.setAttribute("aria-valuenow", percent);
			progressBar.innerText = percent + "%";

		}
		else
			alert("프로젝트 불러오기 실패!")
	});
}

project.createAchievementElement = function (isEnd, text, id) {
	var achievementElement = document.createElement("li");
	achievementElement.className = "List";
	achievementElement.innerText = text;
	achievementElement.id = "achievementElement" + id;

	var spanButton = document.createElement("a");
	spanButton.style = "cursor: pointer";

	var spanLabel = document.createElement("span");

	spanLabel.className = "glyphicon glyphicon-minus";
	spanLabel.style = "margin-left: 1%; font-size: 10px;";

	if (isEnd) {
		var uncompleteLabel = document.createElement("span");
		var uncompleteButton = document.createElement("a");
		uncompleteLabel.className = "glyphicon glyphicon-ok";
		uncompleteLabel.style = "font-size: 10px;";

		uncompleteButton.setAttribute("onClick", "project.Achievements.moveToUncomplete(" + id + ")");
		spanButton.setAttribute("onClick", "project.Achievements.deleteAchievement(" + id + ")");

		uncompleteButton.appendChild(uncompleteLabel);
		achievementElement.appendChild(uncompleteButton);
	}
	else
		spanButton.setAttribute("onClick", "project.Achievements.moveToComplete(" + id + ")");

	spanButton.appendChild(spanLabel);
	achievementElement.appendChild(spanButton);
	return achievementElement;
}

project.Achievements = {};
project.Achievements.moveToComplete = function (id) {
	var achievementElement = document.getElementById("achievementElement" + id);
	var newAchievementElement = project.createAchievementElement(true, achievementElement.innerText, id);
	achievementElement.parentElement.removeChild(achievementElement);

	document.getElementById("completedAchieves").appendChild(newAchievementElement);
}

project.Achievements.moveToUncomplete = function (id) {

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

	if (!projectDeadline.match(/(\d{4})-(\d{1, 2})-(\d{1, 2})/)) {
		alert("잘못된 날자 형식입니다!");
		return;
	}

	var query = String.format("name={0}&desc={1}&json={2}", projectName, projectDesc, JSON.stringify({ deadline: projectDeadline, achievements: project.getAchevements() }));
	document.getElementById("closeModal").click();
	Utils.Post(query, "../apis/project/createProject", function (response) {
		if (!response.success)
			alert("프로젝트 생성에 실패하였습니다!");
		else {
			for (var i = 0; i < inputs.length - 1; i++)
				inputs[i].value = "";

			project.clearAchievements();
			project.refreshProjectList();
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

project.clearAchievements = function () {
	for (var i = 0; i < this.achievementCount; i++)
		document.getElementById("achievementLabel" + i).remove();

	this.achievementCount = 0;
}

project.createAchievement = function (parentName, achievementName) {
	var parentDiv = document.getElementById(parentName);
	var textValueDocument = document.getElementById(achievementName);
	var text = textValueDocument.value;

	if (text != "") {
		var textForm = document.createElement("ul");
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

project.deleteAchievement = function(identifier) {
	var textForm = document.getElementById("achievementLabel" + identifier);
	textForm.remove();
}

project.addAchievementToProject = function () {
	var achievements = this.getAchevements();
	this.clearAchievements();

	var projectData = this.currentProject;
	var projectAchievements = projectData.projectJson.achievements;
	projectData.projectJson.achievements = projectAchievements.concat(achievements);

	Utils.Post(String.format("project={0}", JSON.stringify(projectData)), "/apis/project/updateProject", function (response) {
		project.refreshProjectList();
		project.loadProject(project.currentProject.projectId);
	});
}