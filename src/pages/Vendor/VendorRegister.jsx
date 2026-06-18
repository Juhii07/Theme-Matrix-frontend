import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

const VendorRegister = () => {
  const [form,    setForm]    = useState({ name: "", email: "", password: "", mobile: "", address: "" })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")
  const navigate = useNavigate()

  const register = async () => {
    if (!form.name || !form.email || !form.password) return setError("Please fill required fields")
    setLoading(true); setError("")
    try {
      const res = await axios.post("http://localhost:5000/vendorapi/register", form)
      if (res.data.regsts === 0) navigate("/vendorlogin")
      else setError(res.data.msg || "Registration failed")
    } catch (e) { setError(e.response?.data?.message || "Registration failed") }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* LEFT panel with blurred background */}
      <div className="hidden lg:flex flex-col justify-center items-center flex-1 relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=1200&q=80')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(3px) brightness(0.35)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg,rgba(59,7,100,0.8),rgba(109,40,217,0.75))" }} />
        <div className="relative z-10 text-center px-12">
          <div className="text-6xl mb-6">🏪</div>
          <h1 className="text-4xl font-black text-white mb-3">Become a<br /><span style={{ color: "#c084fc" }}>Vendor</span></h1>
          <p className="text-lg mb-10" style={{ color: "rgba(255,255,255,0.55)" }}>Sell your templates on ThemeMatrix</p>
          <div className="flex flex-col gap-3 max-w-xs">
            {["🚀 Upload unlimited templates","💰 Earn from every sale","📊 Real-time analytics","🌍 Global marketplace","🛡️ Secure payments"].map(f => (
              <div key={f} className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-left"
                style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(10px)" }}>
                <span className="text-sm font-medium text-white">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT form */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto" style={{ background: "#faf5ff" }}>
        <div className="w-full max-w-sm py-8">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff" }}>🎨</div>
            <h2 className="text-2xl font-black text-gray-900">Create Vendor Account</h2>
            <p className="text-gray-400 text-sm mt-1">Start selling templates today</p>
          </div>

          {error && <div className="mb-4 px-4 py-3 rounded-xl text-sm font-semibold bg-red-50 text-red-600 border border-red-200">⚠️ {error}</div>}

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-violet-100 space-y-3">
            {[["👤 Full Name *","name","text","John Developer"],["📧 Email *","email","email","vendor@example.com"],["🔒 Password *","password","password","••••••"],["📞 Mobile","mobile","text","+91 98765 43210"],["📍 Address","address","text","Mumbai, Maharashtra"]].map(([label,key,type,ph]) => (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm({ ...form,[key]:e.target.value })} placeholder={ph}
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all bg-violet-50 border-2 border-transparent focus:border-violet-400"
                  style={{ fontFamily: "inherit" }} />
              </div>
            ))}
            <button onClick={register} disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] hover:shadow-lg disabled:opacity-60 mt-2"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(168,85,247,0.35)" }}>
              {loading ? "⏳ Creating..." : "🚀 Create Vendor Account"}
            </button>
            <p className="text-center text-sm text-gray-400 pt-1">Already a vendor? <Link to="/vendorlogin" className="font-bold text-violet-600 no-underline">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorRegister