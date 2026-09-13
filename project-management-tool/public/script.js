let currentProjectId = null;

document.addEventListener("DOMContentLoaded", () => {
  fetchProjects();

  document.getElementById("project-form").addEventListener("submit", createProject);
  document.getElementById("task-form").addEventListener("submit", createTask);
});

async function fetchProjects() {
  const res = await fetch("/api/projects");
  const projects = await res.json();
  const list = document.getElementById("project-list");
  list.innerHTML = "";
  projects.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p.title;
    li.onclick = () => selectProject(p);
    list.appendChild(li);
  });
}

async function createProject(e) {
  e.preventDefault();
  const title = document.getElementById("project-title").value;
  await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title })
  });
  document.getElementById("project-title").value = "";
  fetchProjects();
}

function selectProject(project) {
  currentProjectId = project._id;
  document.getElementById("selected-project-title").textContent = project.title;
  document.getElementById("task-create-section").style.display = "block";
  document.getElementById("board").style.display = "flex";
  fetchTasks();
}

async function fetchTasks() {
  if (!currentProjectId) return;
  const res = await fetch(`/api/tasks/${currentProjectId}`);
  const tasks = await res.json();

  document.getElementById("tasks-Todo").innerHTML = "";
  document.getElementById("tasks-In Progress").innerHTML = "";
  document.getElementById("tasks-Done").innerHTML = "";

  tasks.forEach(task => {
    const card = document.createElement("div");
    card.className = "task-card";
    card.innerHTML = `
      <h4>${task.title}</h4>
      <p>Assigned to: <strong>${task.assignedTo}</strong></p>
      <select class="status-select" onchange="updateStatus('${task._id}', this.value)">
        <option value="Todo" ${task.status === "Todo" ? "selected" : ""}>Todo</option>
        <option value="In Progress" ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
        <option value="Done" ${task.status === "Done" ? "selected" : ""}>Done</option>
      </select>
      <div class="comments-section">
        <strong>Comments:</strong>
        <div>${task.comments.map(c => `<p>• ${c.text}</p>`).join("")}</div>
        <input type="text" placeholder="Add comment" id="comment-input-${task._id}">
        <button onclick="addComment('${task._id}')">Send</button>
      </div>
    `;
    document.getElementById(`tasks-${task.status}`).appendChild(card);
  });
}

async function createTask(e) {
  e.preventDefault();
  const title = document.getElementById("task-title").value;
  const assignedTo = document.getElementById("task-assignee").value;

  await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ projectId: currentProjectId, title, assignedTo })
  });

  document.getElementById("task-title").value = "";
  document.getElementById("task-assignee").value = "";
  fetchTasks();
}

async function updateStatus(taskId, status) {
  await fetch(`/api/tasks/${taskId}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  fetchTasks();
}

async function addComment(taskId) {
  const input = document.getElementById(`comment-input-${taskId}`);
  if (!input.value) return;

  await fetch(`/api/tasks/${taskId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input.value })
  });

  fetchTasks();
}