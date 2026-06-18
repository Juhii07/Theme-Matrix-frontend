import { useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import axios from "axios"

const VendorResetPassword = () => {
  const { token }                    = useParams()
  const navigate                     = useNavigate()
  const [newPassword,    setNew]     = useState("")
  const [confirmPassword,setConfirm] = useState("")
  const [showNew,        setShowNew] = useState(false)
  const [showConfirm,    setShowCon] = useState(false)
  const [loading,        setLoading] = useState(false)
  const [error,          setError]   = useState("")
  const [success,        setSuccess] = useState(false)

  const getStrength = () => {
    if (!newPassword) return 0
    if (newPassword.length >= 10) return 4
    if (newPassword.length >= 8)  return 3
    if (newPassword.length >= 6)  return 2
    return 1
  }

  const strengthColor = ["#e5e7eb","#ef4444","#f59e0b","#10b981","#10b981"]
  const strengthLabel = ["","Weak","Fair","Good","Strong"]
  const strength      = getStrength()

  // ✅ FIXED: proper async submit with e.preventDefault()
  const submit = async (e) => {
    if (e) e.preventDefault()
    setError("")

    if (!newPassword || !confirmPassword)
      return setError("Please fill all fields")
    if (newPassword.length < 6)
      return setError("Password must be at least 6 characters")
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match")

    setLoading(true)
    try {
      const res = await axios.post(
        `http://localhost:5000/vendorapi/reset-password/${token}`,
        { newPassword }
      )
      if (res.data.success) {
        setSuccess(true)
        setTimeout(() => navigate("/vendorlogin"), 2500)
      } else {
        setError(res.data.message || "Reset failed")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed. The link may have expired.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex"
      style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1200&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(2px) brightness(0.3)",
          }}
        />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(135deg,rgba(59,7,100,0.85),rgba(76,29,149,0.8))" }}
        />
        <div className="relative z-10 text-center px-12">
          <div className="text-6xl mb-6">🔑</div>
          <h1 className="text-4xl font-black text-white mb-3">
            Set New<br />
            <span style={{ color: "#c084fc" }}>Password</span>
          </h1>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.55)" }}>
            Create a strong password for your account
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: "#faf5ff" }}>
        <div className="w-full max-w-sm">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff" }}>
              🎨
            </div>
            <h2 className="text-2xl font-black text-gray-900">
              {success ? "Password Reset!" : "Reset Password"}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {success ? "Redirecting to login..." : "Enter your new vendor password"}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-violet-100">

            {success ? (
              // ── Success state ─────────────────────────────────────────────
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
                  style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                  ✓
                </div>
                <p className="text-gray-500 text-sm mb-4">
                  Your password has been updated. Redirecting to vendor login...
                </p>
                <div className="w-8 h-8 mx-auto rounded-full"
                  style={{
                    border: "3px solid #e9d5ff",
                    borderTop: "3px solid #7c3aed",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
              </div>
            ) : (
              // ── Form ──────────────────────────────────────────────────────
              <form onSubmit={submit} className="space-y-4">

                {/* Error */}
                {error && (
                  <div className="px-4 py-3 rounded-xl text-xs font-semibold"
                    style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}>
                    {error}
                  </div>
                )}

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={e => { setNew(e.target.value); setError("") }}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all border-2 border-transparent focus:border-violet-400"
                      style={{ background: "#faf5ff", fontFamily: "inherit" }}
                    />
                    <button type="button"
                      onClick={() => setShowNew(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                      {showNew ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{
                            flex: 1, height: "4px", borderRadius: "2px",
                            background: i <= strength ? strengthColor[strength] : "#e5e7eb",
                            transition: "background 0.3s",
                          }} />
                        ))}
                      </div>
                      <p className="text-xs font-semibold" style={{ color: strengthColor[strength] }}>
                        {strengthLabel[strength]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={e => { setConfirm(e.target.value); setError("") }}
                      placeholder="Re-enter new password"
                      className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all border-2 border-transparent focus:border-violet-400"
                      style={{ background: "#faf5ff", fontFamily: "inherit" }}
                    />
                    <button type="button"
                      onClick={() => setShowCon(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                      {showConfirm ? "🙈" : "👁️"}
                    </button>
                  </div>

                  {/* Match indicator */}
                  {confirmPassword && (
                    <p className="text-xs font-semibold mt-1"
                      style={{ color: confirmPassword === newPassword ? "#10b981" : "#ef4444" }}>
                      {confirmPassword === newPassword ? "Passwords match" : "Passwords do not match"}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg,#a855f7,#7c3aed)",
                    border: "none",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 20px rgba(168,85,247,0.35)",
                  }}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting...
                    </span>
                  ) : "Reset Password"}
                </button>

                <p className="text-center text-sm text-gray-400 pt-1">
                  <Link to="/vendor/forgot-password"
                    className="font-semibold text-violet-600 no-underline hover:underline">
                    Request new link
                  </Link>
                  {" · "}
                  <Link to="/vendorlogin"
                    className="font-semibold text-violet-600 no-underline hover:underline">
                    Back to login
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default VendorResetPassword