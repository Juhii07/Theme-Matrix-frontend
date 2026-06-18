import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import axios from "axios"

const AdminLogin = () => {
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) return setError("Please fill all fields")
    setLoading(true); setError("")
    try {
      const res = await axios.post("http://localhost:5000/adminapi/login", { email, password })
      if (res.data.status === 0) {
        localStorage.setItem("token",     res.data.token)
        localStorage.setItem("adminId",   res.data.admin.id)
        localStorage.setItem("adminName", res.data.admin.name)
        navigate("/admin/dashboard")
      } else setError(res.data.message || "Invalid credentials")
    } catch (e) { setError(e.response?.data?.message || "Login failed") }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* LEFT */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(2px) brightness(0.4)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(59,7,100,0.85),rgba(76,29,149,0.75),rgba(30,27,75,0.85))" }} />
        <div className="relative z-10 text-center px-12">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center font-black text-2xl mx-auto mb-8"
            style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff", boxShadow: "0 20px 60px rgba(168,85,247,0.5)" }}>TM</div>
          <h1 className="text-4xl font-black text-white mb-3">Theme<span style={{ color: "#c084fc" }}>Matrix</span></h1>
          <p className="text-lg mb-12" style={{ color: "rgba(255,255,255,0.6)" }}>Admin Control Panel</p>
          <div className="flex flex-col gap-3 max-w-sm">
            {["🎨 Manage all templates","👥 Oversee vendors & users","🏷️ Control categories","📊 Platform analytics"].map(f => (
              <div key={f} className="flex items-center gap-3 px-5 py-3 rounded-2xl text-left"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
                <span className="text-sm font-semibold text-white">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: "#faf5ff" }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff" }}>🔐</div>
            <h2 className="text-2xl font-black text-gray-900">Admin Login</h2>
            <p className="text-gray-400 text-sm mt-1">Sign in to your admin account</p>
          </div>

          {error && <div className="mb-5 px-4 py-3 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-200">⚠️ {error}</div>}

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-violet-100 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">📧 Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@themematrix.com"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all bg-violet-50 border-2 border-transparent focus:border-violet-400"
                style={{ fontFamily: "inherit" }} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">🔒 Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" onKeyDown={e => e.key === "Enter" && handleLogin()}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all bg-violet-50 border-2 border-transparent focus:border-violet-400"
                  style={{ fontFamily: "inherit" }} />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>
            <button onClick={handleLogin} disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 disabled:scale-100"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(168,85,247,0.4)" }}>
              {loading ? "⏳ Signing in..." : "🚀 Sign In to Admin"}
            </button>

            {/* Forgot password link */}
            <p className="text-center text-sm text-gray-400 pt-1">
              Forgot your password?{" "}
              <Link to="/admin/forgot-password" style={{ color: "#7c3aed", fontWeight: "700", textDecoration: "none" }}>
                Reset it
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin