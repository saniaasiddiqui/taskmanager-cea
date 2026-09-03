import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { clearToken } from "../auth";
import type { Task, TaskInput } from "../types";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function loadTasks() {
    try {
      setTasks(await api<Task[]>("/tasks"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load tasks");
      if (err instanceof ApiError && err.status === 401) navigate("/login");
    }
  }

  useEffect(() => { void loadTasks(); }, []);

  async function toggle(task: Task) {
    setError("");
    const input: TaskInput = {
      title: task.title,
      description: task.description ?? "",
      completed: !task.completed,
    };
    try {
      await api(`/tasks/${task.id}`, { method: "PUT", body: JSON.stringify(input) });
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update task");
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api(`/tasks/${id}`, { method: "DELETE" });
      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete task");
    }
  }

  function logout() {
    clearToken();
    navigate("/login");
  }

  return (
    <main className="container">
      <header><h1>My tasks</h1><div><Link className="button" to="/tasks/new">New task</Link><button className="secondary" onClick={logout}>Logout</button></div></header>
      {error && <p className="error">{error}</p>}
      {!error && tasks.length === 0 && <p className="empty">No tasks yet. Create your first one.</p>}
      <section className="task-list">
        {tasks.map((task) => (
          <article className={`card task ${task.completed ? "done" : ""}`} key={task.id}>
            <input aria-label={`Mark ${task.title} complete`} type="checkbox" checked={task.completed} onChange={() => void toggle(task)} />
            <div><h2>{task.title}</h2>{task.description && <p>{task.description}</p>}<small>{new Date(task.created_at).toLocaleString()}</small></div>
            <div className="actions"><Link to={`/tasks/${task.id}/edit`}>Edit</Link><button className="danger" onClick={() => void remove(task.id)}>Delete</button></div>
          </article>
        ))}
      </section>
    </main>
  );
}
