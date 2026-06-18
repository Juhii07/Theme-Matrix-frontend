import { useState } from "react"
import axios from "axios"
import { useParams, useNavigate, Link } from "react-router-dom"

const ResetPassword = () => {
  const { token }  = useParams()
  const navigate   = useNavigate()

  const [newPassword,     setNewPassword]     = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNew,         setShowNew]         = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState("")
  const [success,         setSuccess]         = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!newPassword)                          return setError("Please enter a new password")
    if (newPassword.length < 6)               return setError("Password must be at least 6 characters")
    if (newPassword !== confirmPassword)       return setError("Passwords do not match")

    setLoading(true)
    try {
      await axios.post(
        "http://localhost:5000/userapi/reset-password/" + token,
        { newPassword }
      )
      setSuccess(true)
      setTimeout(() => navigate("/login"), 2500)
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. The link may have expired.")
    }
    setLoading(false)
  }

  const inputStyle = (hasError) => ({
    width: "100%",
    padding: "12px 44px 12px 16px",
    borderRadius: "12px",
    border: hasError ? "2px solid #ef4444" : "2px solid #e5e7eb",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  })

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
          }}>
            TM
          </div>
          <span style={{ fontWeight: "900", fontSize: "20px" }}>
            Theme<span style={{ color: "#7c3aed" }}>Matrix</span>
          </span>
        </div>

        {success ? (
          // ── Success state ─────────────────────────────────────────────────
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>
              ✅
            </div>
            <h2 style={{ fontWeight: "900", fontSize: "22px", color: "#111", marginBottom: "8px" }}>
              Password Reset!
            </h2>
            <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "24px" }}>
              Your password has been updated successfully. Redirecting to login...
            </p>
            <div style={{
              width: "40px", height: "40px",
              border: "3px solid #e9d5ff",
              borderTop: "3px solid #7c3aed",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto",
            }} />
          </div>
        ) : (
          // ── Form state ────────────────────────────────────────────────────
          <>
            <h2 style={{ textAlign: "center", fontWeight: "900", fontSize: "22px", marginBottom: "6px", color: "#111" }}>
              Reset Password
            </h2>
            <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "14px", marginBottom: "28px" }}>
              Enter your new password below
            </p>

            <form onSubmit={handleSubmit}>

              {/* New Password */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  New Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setError("") }}
                    placeholder="Enter new password"
                    style={inputStyle(!!error && !newPassword)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(v => !v)}
                    style={{
                      position: "absolute", right: "14px", top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none",
                      cursor: "pointer", color: "#9ca3af", fontSize: "16px",
                    }}>
                    {showNew ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                  Confirm Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError("") }}
                    placeholder="Re-enter new password"
                    style={inputStyle(!!error && confirmPassword !== newPassword)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    style={{
                      position: "absolute", right: "14px", top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none",
                      cursor: "pointer", color: "#9ca3af", fontSize: "16px",
                    }}>
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Password strength hint */}
              {newPassword && (
                <div style={{
                  display: "flex",
                  gap: "4px",
                  marginBottom: "16px",
                }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: "4px", borderRadius: "2px",
                      background: newPassword.length >= i * 3
                        ? (newPassword.length >= 10 ? "#10b981" : newPassword.length >= 7 ? "#f59e0b" : "#ef4444")
                        : "#e5e7eb",
                      transition: "background 0.3s",
                    }} />
                  ))}
                </div>
              )}

              {error && (
                <div style={{
                  background: "#fee2e2", border: "1px solid #fecaca",
                  borderRadius: "10px", padding: "10px 14px",
                  color: "#dc2626", fontSize: "12px", fontWeight: "600",
                  marginBottom: "16px",
                }}>
                  {error}
                </div>
              )}

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
                  marginBottom: "16px",
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
                    Resetting...
                  </span>
                ) : "Reset Password"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af" }}>
              <Link to="/forgot-password" style={{ color: "#7c3aed", fontWeight: "700", textDecoration: "none" }}>
                Request a new link
              </Link>
              {" · "}
              <Link to="/login" style={{ color: "#7c3aed", fontWeight: "700", textDecoration: "none" }}>
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default ResetPassword