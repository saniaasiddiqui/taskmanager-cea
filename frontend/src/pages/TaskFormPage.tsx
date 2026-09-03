import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client";
import type { Task, TaskInput } from "../types";

export default function TaskFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const [form, setForm] = useState<TaskInput>({ title: "", description: "", completed: false });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    api<Task>(`/tasks/${id}`)
      .then((task) => setForm({ title: task.title, description: task.description ?? "", completed: task.completed }))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load task"));
  }, [id]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api(editing ? `/tasks/${id}` : "/tasks", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(form),
      });
      navigate("/tasks");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save task");
    }
  }

  return (
    <main className="card form-card">
      <h1>{editing ? "Edit task" : "Create task"}</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <label>Title<input maxLength={200} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></label>
        <label>Description<textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <label className="check"><input type="checkbox" checked={form.completed} onChange={(e) => setForm({ ...form, completed: e.target.checked })} /> Completed</label>
        <div><button type="submit">Save</button> <Link to="/tasks">Cancel</Link></div>
      </form>
    </main>
  );
}
