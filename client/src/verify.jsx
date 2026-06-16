import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function Verify() {
  const q = new URLSearchParams(useLocation().search);
  const tokenQuery = q.get("token") || "";
  const [token, setToken] = useState(tokenQuery);
  const [email, setEmail] = useState(q.get("email") || "");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/verify-email", { token, email });
      setMsg("Email verified. Redirecting to sign in...");
      setTimeout(() => navigate("/signin"), 1200);
    } catch (err) {
      setMsg(err.response?.data || err.message);
    }
  };

  const resend = async () => {
    try {
      await axios.post("/api/auth/resend-verification", { email });
      setMsg("Verification email resent.");
    } catch (err) {
      setMsg(err.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (tokenQuery) {
      // attempt auto-verify if token present in URL
      (async () => {
        try {
          await axios.post("/api/auth/verify-email", {
            token: tokenQuery,
            email,
          });
          navigate("/signin");
        } catch (e) {
          console.warn("Auto verify failed:", e);
        }
      })();
    }
  }, []); // eslint-disable-line

  return (
    <div>
      <h3>Verify your email</h3>
      <form onSubmit={submit}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email (optional)"
        />
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Verification token"
        />
        <button type="submit">Verify</button>
      </form>
      <button onClick={resend}>Resend verification email</button>
      <p>{msg}</p>
    </div>
  );
}
