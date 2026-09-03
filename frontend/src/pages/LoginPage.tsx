import { FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { setToken } from "../auth";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    const body = new URLSearchParams({ username, password });
    try {
      const result = await api<{ access_token: string }>("/auth/token", {
        method: "POST",
        body,
      });
      setToken(result.access_token);
      const destination = (location.state as { from?: string } | null)?.from ?? "/tasks";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <main className="card auth-card">
      <h1>Log in</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <label>Username<input value={username} onChange={(e) => setUsername(e.target.value)} required /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button type="submit">Log in</button>
      </form>
      <p>New here? <Link to="/register">Create an account</Link>.</p>
    </main>
  );
}
