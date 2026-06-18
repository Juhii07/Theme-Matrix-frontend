import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import axios from "axios"

const AdminResetPassword = () => {
  const { token }                       = useParams()
  const navigate                        = useNavigate()
  const [newPassword,    setNewPassword]    = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNew,        setShowNew]        = useState(false)
  const [showConfirm,    setShowConfirm]    = useState(false)
  const [loading,        setLoading]        = useState(false)
  const [success,        setSuccess]        = useState(false)
  const [error,          setError]          = useState("")

  const handleReset = async (e) => {
    e.preventDefault()
    setError("")
    if (!newPassword || !confirmPassword) return setError("Please fill all fields")
    if (newPassword.length < 6) return setError("Password must be at least 6 characters")
    if (newPassword !== confirmPassword) return setError("Passwords do not match")
    setLoading(true)
    try {
      const res = await axios.post(`http://localhost:5000/adminapi/reset-password/${token}`, { newPassword })
      if (res.data.success) {
        setSuccess(true)
        setTimeout(() => navigate("/AdminLogin"), 3000)
      } else {
        setError(res.data.message || "Reset failed. Please try again.")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Reset link is invalid or has expired.")
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: "100vh", background: "#faf5ff", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); @keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{ background: "#fff", borderRadius: "20px", padding: "40px 36px", width: "100%", maxWidth: "420px", boxShadow: "0 8px 40px rgba(109,40,217,0.10)" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "28px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "linear-gradient(135deg,#a855f7,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "900", fontSize: "15px" }}>TM</div>
          <span style={{ fontWeight: "900", fontSize: "20px" }}>Theme<span style={{ color: "#7c3aed" }}>Matrix</span></span>
        </div>

        <h2 style={{ textAlign: "center", fontWeight: "900", fontSize: "22px", marginBottom: "6px", color: "#111" }}>Reset Password</h2>
        <p style={{ textAlign: "center", color: "#9ca3af", fontSize: "14px", marginBottom: "28px" }}>Enter your new admin password below</p>

        {error && <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: "12px", padding: "12px 16px", marginBottom: "18px", color: "#dc2626", fontSize: "13px", fontWeight: "600" }}>⚠️ {error}</div>}

        {!success ? (
          <form onSubmit={handleReset}>
            {/* New Password */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>New Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setError("") }}
                  placeholder="Min. 6 characters"
                  style={{ width: "100%", padding: "12px 44px 12px 16px", borderRadius: "12px", border: "2px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  onFocus={e => e.target.style.borderColor = "#a855f7"}
                  onBlur={e  => e.target.style.borderColor = "#e5e7eb"}
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#9ca3af" }}>
                  {showNew ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={e => { setConfirmPassword(e.target.value); setError("") }}
                  placeholder="Re-enter new password"
                  style={{ width: "100%", padding: "12px 44px 12px 16px", borderRadius: "12px", border: "2px solid #e5e7eb", fontSize: "14px", outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                  onFocus={e => e.target.style.borderColor = "#a855f7"}
                  onBlur={e  => e.target.style.borderColor = "#e5e7eb"}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#9ca3af" }}>
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "13px", borderRadius: "12px", background: loading ? "#c4b5fd" : "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff", fontWeight: "900", fontSize: "15px", border: "none", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" }} />
                  Resetting...
                </span>
              ) : "Reset Password"}
            </button>
          </form>
        ) : (
          <div style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "12px", padding: "24px 16px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>🎉</div>
            <p style={{ color: "#15803d", fontWeight: "700", fontSize: "15px", marginBottom: "6px" }}>Password reset successful!</p>
            <p style={{ color: "#16a34a", fontSize: "13px" }}>Redirecting you to login in 3 seconds...</p>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: "13px", color: "#9ca3af", marginTop: "16px" }}>
          <Link to="/AdminLogin" style={{ color: "#7c3aed", fontWeight: "700", textDecoration: "none" }}>Back to login</Link>
        </p>
      </div>
    </div>
  )
}

export default AdminResetPassword