import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

const VendorLogin = () => {
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
      const res = await axios.post("http://localhost:5000/vendorapi/login", { email, password })
      if (res.data.token) {
        localStorage.setItem("vendorToken", res.data.token)
        localStorage.setItem("vendorId",    res.data.vendor.id)
        localStorage.setItem("vendorName",  res.data.vendor.name)
        navigate("/vendor/dashboard")
      } else setError(res.data.msg || "Login failed")
    } catch (e) { setError(e.response?.data?.message || "Login failed") }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* LEFT */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 relative overflow-hidden">
        <div className="absolute inset-0"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=1200&q=80')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(2px) brightness(0.3)" }} />
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(135deg,rgba(59,7,100,0.85),rgba(76,29,149,0.8))" }} />
        <div className="relative z-10 text-center px-12">
          <div className="text-6xl mb-6">🎨</div>
          <h1 className="text-4xl font-black text-white mb-3">
            Vendor<br /><span style={{ color: "#c084fc" }}>Dashboard</span>
          </h1>
          <p className="text-lg" style={{ color: "rgba(255,255,255,0.55)" }}>
            Upload, manage &amp; earn from your templates
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: "#faf5ff" }}>
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff" }}>🎨</div>
            <h2 className="text-2xl font-black text-gray-900">Vendor Login</h2>
            <p className="text-gray-400 text-sm mt-1">Access your vendor dashboard</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-200">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-violet-100 space-y-4">

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vendor@example.com"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all bg-violet-50 border-2 border-transparent focus:border-violet-400"
                style={{ fontFamily: "inherit" }}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  onKeyDown={e => e.key === "Enter" && login()}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all bg-violet-50 border-2 border-transparent focus:border-violet-400"
                  style={{ fontFamily: "inherit" }}
                />
                {/* ✅ show/hide button correctly centered */}
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  style={{
                    position:       "absolute",
                    right:          "12px",
                    top:            "50%",
                    transform:      "translateY(-50%)",
                    background:     "none",
                    border:         "none",
                    cursor:         "pointer",
                    padding:        "0",
                    lineHeight:     "1",
                    fontSize:       "16px",
                    color:          "#9ca3af",
                    display:        "flex",
                    alignItems:     "center",
                    justifyContent: "center",
                  }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>

              {/* ✅ Forgot password — outside relative div */}
              <div className="flex justify-end mt-1.5">
                <Link
                  to="/vendor/forgot-password"
                  className="no-underline"
                  style={{ color: "#7c3aed", fontSize: "12px", fontWeight: "700" }}>
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* SIGN IN BUTTON */}
            <button
              onClick={login}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(168,85,247,0.35)" }}>
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <p className="text-center text-sm text-gray-400">
              New vendor?{" "}
              <Link to="/vendorregister" className="font-bold text-violet-600 no-underline">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorLogin