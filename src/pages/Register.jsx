import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

const UserRegister = () => {
  const [form,     setForm]    = useState({ name: "", email: "", password: "" })
  const [loading,  setLoading] = useState(false)
  const [error,    setError]   = useState("")
  const [showPass, setShowPass] = useState(false)
  const navigate = useNavigate()

  const register = async () => {
    if (!form.name || !form.email || !form.password) return setError("Please fill all fields")
    setLoading(true); setError("")
    try {
      const res = await axios.post("http://localhost:5000/userapi/register", form)
      if (res.data.regsts === 0) navigate("/login")
      else setError(res.data.msg || "Registration failed")
    } catch (e) { setError(e.response?.data?.message || "Registration failed") }
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2"
      style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* LEFT IMAGE */}
      <div className="relative hidden md:block">
        <img
          src="/images/register.jpg"
          alt="Register"
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
            <h1 className="text-4xl font-bold mb-4">Join ThemeMatrix</h1>
            <p className="text-indigo-100 mb-8">
              Sell and discover premium website templates,
              UI kits and digital assets.
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto mb-6">
              {[["🎨","1000+ Premium Templates"],["⚡","Instant Download"],["🌍","Global Community"],["💎","Lifetime Access"]].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-left"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)" }}>
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm font-medium text-white">{label}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)" }}>
              <p className="text-sm text-indigo-100">
                🌍 Trusted by designers &amp; developers worldwide
              </p>
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
            <h2 className="text-2xl font-bold text-gray-800">Create Account</h2>
            <p className="text-gray-400 text-sm mt-1">Join thousands of developers</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg text-sm font-semibold bg-red-50 text-red-600 border border-red-200">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4">

            {/* NAME */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                👤 Full Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                📧 Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                🔒 Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••"
                  onKeyDown={e => e.key === "Enter" && register()}
                  className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                />
                <button
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-violet-600 transition-colors text-lg"
                  style={{ background: "none", border: "none", cursor: "pointer" }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* BUTTON */}
            <button
              onClick={register}
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-lg transition font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ border: "none", cursor: "pointer" }}>
              {loading ? "⏳ Creating account..." : "🚀 Create Account"}
            </button>

            {/* LOGIN LINK */}
            <p className="text-sm text-center text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-violet-600 font-semibold no-underline hover:underline">
                Login
              </Link>
            </p>

            <p className="text-center text-xs text-gray-400">
              Want to sell templates?{" "}
              <Link to="/vendorregister" className="text-violet-600 font-semibold no-underline hover:underline">
                Register as Vendor
              </Link>
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}

export default UserRegister