import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

const UserLogin = () => {
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const navigate = useNavigate()

  const login = async () => {
    if (!email || !password) return setError("Please fill all fields")
    setLoading(true); setError("")
    try {
      const res = await axios.post("http://localhost:5000/userapi/login", { email, password })
      if (res.data.logsts === 0) {
        localStorage.setItem("userToken", res.data.token)
        localStorage.setItem("userId",    res.data.user.id)
        localStorage.setItem("userName",  res.data.user.name)
        navigate("/")
      } else setError(res.data.msg || "Login failed")
    } catch (e) { setError(e.response?.data?.message || "Login failed") }
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2"
      style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* LEFT IMAGE */}
      <div className="relative hidden md:block">
        <img
          src="/images/login.jpg"
          alt="Login"
          className="w-full h-full object-cover"
          onError={e => {
            e.target.style.display = "none"
            e.target.parentNode.style.background = "linear-gradient(135deg,#1e1b4b,#4c1d95,#7c3aed)"
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center"
          style={{ background: "rgba(76,29,149,0.65)", backdropFilter: "blur(2px)" }}>
          <div className="text-white text-center px-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl mx-auto mb-6"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff" }}>TM</div>
            <h1 className="text-4xl font-bold mb-4">Welcome to<br />ThemeMatrix</h1>
            <p className="text-indigo-100 mb-8">Premium templates &amp; UI kits marketplace</p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              {[
                ["🎨", "1000+ Premium Templates"],
                ["⚡", "Instant Download Access"],
                ["🌍", "Global Developer Community"],
                ["💎", "Exclusive Vendor Deals"],
              ].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-left"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm font-medium text-white">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">

          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2 no-underline mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs"
                style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff" }}>TM</div>
              <span className="font-black text-gray-900 text-lg">
                Theme<span className="text-violet-600">Matrix</span>
              </span>
            </Link>
            <h2 className="text-2xl font-black text-gray-900">Welcome back!</h2>
            <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg text-sm font-semibold bg-red-50 text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Password
              </label>

              {/* ✅ wrapper — position relative on outer div, not inner */}
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  onKeyDown={e => e.key === "Enter" && login()}
                  className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                />

                {/* ✅ show/hide button — correctly centered inside input only */}
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position:   "absolute",
                    right:      "12px",
                    top:        "50%",
                    transform:  "translateY(-50%)",
                    background: "none",
                    border:     "none",
                    cursor:     "pointer",
                    padding:    "0",
                    lineHeight: "1",
                    fontSize:   "16px",
                    color:      "#9ca3af",
                    display:    "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>

              {/* ✅ forgot password — outside the relative div so it doesn't affect button position */}
              <div className="flex justify-end mt-1.5">
                <Link
                  to="/forgot-password"
                  className="no-underline"
                  style={{ color: "#7c3aed", fontSize: "12px", fontWeight: "700" }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* LINKS ROW */}
            <div className="flex justify-between text-xs">
              <Link to="/register" className="text-violet-600 font-semibold no-underline hover:underline">
                Create account
              </Link>
              <Link to="/vendorlogin" className="text-gray-400 no-underline hover:text-gray-600 transition-colors">
                Vendor login →
              </Link>
            </div>

            {/* SIGN IN BUTTON */}
            <button
              onClick={login}
              disabled={loading}
              className="w-full text-white py-2.5 rounded-lg transition font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg,#a855f7,#7c3aed)",
                border:     "none",
                cursor:     "pointer",
              }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-sm text-gray-500">
              No account?{" "}
              <Link to="/register" className="text-violet-600 font-semibold no-underline hover:underline">
                Create one free
              </Link>
            </p>

            <p className="text-center text-xs text-gray-400">
              Admin?{" "}
              <Link to="/adminlogin" className="text-violet-600 font-semibold no-underline hover:underline">
                Admin Login
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}

export default UserLogin