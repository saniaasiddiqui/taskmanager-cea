import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await api("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  }

  return (
    <main className="card auth-card">
      <h1>Register</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit}>
        <label>Username<input minLength={3} value={username} onChange={(e) => setUsername(e.target.value)} required /></label>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
        <label>Password<input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
        <button type="submit">Register</button>
      </form>
      <p>Already registered? <Link to="/login">Log in</Link>.</p>
    </main>
  );
}
