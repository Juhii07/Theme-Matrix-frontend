import { useState } from "react"
import axios from "axios"
import { Link } from "react-router-dom"

const ForgotPassword = () => {
  const [email,    setEmail]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [error,    setError]    = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    if (!email.trim()) return setError("Please enter your email address")
    setLoading(true)
    try {
      await axios.post("http://localhost:5000/userapi/forgot-password", { email })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.")
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f3f4f6",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "40px 36px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 8px 40px rgba(109,40,217,0.10)",
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "28px" }}>
          <div style={{
            width: "42px", height: "42px", borderRadius: "12px",
            background: "linear-gradient(135deg,#a855f7,#7c3aed)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontWeight: "900", fontSize: "15px",
          }}>TM</div>
          <span style={{ fontWeight: "900", fontSize: "20px" }}>
            Theme<span style={{ color: "#7c3aed" }}>Matrix</span>
          </span>
        </div>

        <h2 style={{ textAlign: "center", fontWeight: "900", fontSize: "22px", marginBottom: "6px", color: "#111" }}>
          Forgot Password?
        </h2>
        <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "14px", marginBottom: "28px" }}>
          Enter your email to get a password reset link
        </p>

        {!success ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "18px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError("") }}
                placeholder="john@example.com"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: error ? "2px solid #ef4444" : "2px solid #e5e7eb",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => { if (!error) e.target.style.borderColor = "#a855f7" }}
                onBlur={e  => { if (!error) e.target.style.borderColor = "#e5e7eb" }}
              />
              {error && (
                <p style={{ color: "#ef4444", fontSize: "12px", fontWeight: "600", marginTop: "6px" }}>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "12px",
                background: loading ? "#c4b5fd" : "linear-gradient(135deg,#a855f7,#7c3aed)",
                color: "#fff",
                fontWeight: "900",
                fontSize: "15px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                marginBottom: "20px",
              }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span style={{
                    width: "16px", height: "16px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid #fff",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    display: "inline-block",
                  }} />
                  Sending...
                </span>
              ) : "Get Reset Link"}
            </button>
          </form>
        ) : (
          // ── Success state ──────────────────────────────────────────
          <div>
            <div style={{
              background: "#f0fdf4",
              border: "1.5px solid #bbf7d0",
              borderRadius: "12px",
              padding: "20px 16px",
              marginBottom: "20px",
              textAlign: "center",
            }}>
              <div style={{ fontSize: "36px", marginBottom: "10px" }}>✅</div>
              <p style={{ color: "#15803d", fontWeight: "700", fontSize: "15px", marginBottom: "6px" }}>
                Reset link sent!
              </p>
              <p style={{ color: "#16a34a", fontSize: "13px", lineHeight: "1.5" }}>
                A password reset link has been sent to <strong>{email}</strong>. Please check your inbox and follow the instructions. The link expires in 30 minutes.
              </p>
            </div>

            <button
              onClick={() => { setSuccess(false); setEmail("") }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "12px",
                background: "#f3f4f6",
                color: "#6b7280",
                fontWeight: "700",
                fontSize: "14px",
                border: "none",
                cursor: "pointer",
              }}>
              Try another email
            </button>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af", marginTop: "16px" }}>
          Remember it?{" "}
          <Link to="/login" style={{ color: "#7c3aed", fontWeight: "700", textDecoration: "none" }}>
            Back to login
          </Link>
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default ForgotPassword