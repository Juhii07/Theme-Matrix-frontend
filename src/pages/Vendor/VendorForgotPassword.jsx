import { useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

const VendorForgotPassword = () => {
  const [email,   setEmail]   = useState("")
  const [loading, setLoading] = useState(false)
  const [msg,     setMsg]     = useState("")
  const [error,   setError]   = useState("")

  const submit = async () => {
    if (!email.trim()) return setError("Please enter your email")
    setLoading(true); setError(""); setMsg("")
    try {
      const res = await axios.post("http://localhost:5000/vendorapi/forgot-password", { email })
      if (res.data.success) {
        setMsg(res.data.message)
      } else {
        setError(res.data.message || "Something went wrong")
      }
    } catch (e) {
      setError(e.response?.data?.message || "Something went wrong")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "#faf5ff", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm border border-violet-100">

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff", fontSize: "24px" }}>
            🔒
          </div>
          <h2 className="text-2xl font-black text-gray-900">Forgot Password</h2>
          <p className="text-gray-400 text-sm mt-1">Enter your email to reset password</p>
        </div>

        {/* Success message */}
        {msg && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ✅ {msg}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {!msg && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submit()}
                placeholder="vendor@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all bg-violet-50 border-2 border-transparent focus:border-violet-400"
                style={{ fontFamily: "inherit" }}
              />
            </div>

            <button
              onClick={submit}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer" }}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </div>
        )}

        <div className="text-center mt-5">
          <Link to="/vendorlogin" className="text-sm font-bold text-violet-600 no-underline hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VendorForgotPassword