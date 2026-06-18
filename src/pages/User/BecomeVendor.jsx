import { Link } from "react-router-dom"

const BecomeVendor = () => {

  const steps = [
    { icon: "📝", step: "01", title: "Create Account", desc: "Register as a vendor with your basic details. Takes less than 2 minutes." },
    { icon: "✅", step: "02", title: "Get Approved",   desc: "Our team reviews your profile and approves your vendor account quickly." },
    { icon: "🎨", step: "03", title: "Upload Templates", desc: "Upload your premium templates with images, descriptions and pricing." },
    { icon: "💰", step: "04", title: "Start Earning",  desc: "Earn money every time a user purchases your template. Instant payouts." },
  ]

  const perks = [
    { icon: "💰", title: "Earn on Every Sale",     desc: "Get paid for every template purchase. No hidden fees or deductions." },
    { icon: "🌍", title: "Global Reach",            desc: "Reach thousands of developers and designers across the world." },
    { icon: "📊", title: "Real-time Dashboard",     desc: "Track your sales, revenue and performance in real-time." },
    { icon: "🚀", title: "Unlimited Uploads",       desc: "Upload as many templates as you want with no restrictions." },
    { icon: "🛡️", title: "Secure Payments",         desc: "All transactions are encrypted and secure. Get paid reliably." },
    { icon: "🎯", title: "Marketing Support",       desc: "We promote your templates to our growing user base for free." },
  ]

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* ─── HERO ─── */}
      <div className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#3b0764 0%,#4c1d95 50%,#6b21a8 100%)",
          minHeight: "500px"
        }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,#e879f9,transparent)", transform: "translate(30%,-30%)" }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,#a78bfa,transparent)", transform: "translate(-30%,30%)" }} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6"
            style={{ background: "rgba(255,255,255,0.1)", color: "#e9d5ff", border: "1px solid rgba(255,255,255,0.15)" }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            🏪 Vendor Program
          </div>

          <h1 className="font-black text-white mb-5 leading-tight"
            style={{ fontSize: "clamp(2rem,5vw,3.5rem)" }}>
            Turn Your Designs Into<br />
            <span style={{
              background: "linear-gradient(90deg,#f0abfc,#c084fc,#a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Passive Income
            </span>
          </h1>

          <p className="text-lg mb-10 max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.65)" }}>
            Join 500+ vendors on ThemeMatrix. Upload your templates, reach thousands of buyers, and earn money every day.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            {/* ✅ Main CTA → Vendor Register */}
            <Link to="/vendorregister"
              className="px-8 py-4 rounded-2xl font-black text-violet-700 no-underline transition-all hover:scale-105 text-base"
              style={{ background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
              🚀 Start Selling Now — It's Free
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 justify-center mt-12">
            {[
              ["500+", "Active Vendors"],
              ["10K+", "Happy Customers"],
              ["₹50K+", "Avg. Monthly Earning"],
              ["4.9⭐", "Vendor Rating"],
            ].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-white">{val}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── HOW IT WORKS ─── */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-3">
            Simple Process
          </p>
          <h2 className="text-3xl font-black text-gray-900">How It Works</h2>
          <p className="text-gray-400 mt-3 max-w-md mx-auto">
            Getting started as a vendor takes just 4 simple steps
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="relative bg-white rounded-2xl p-6 border border-violet-100 text-center"
              style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
              {/* Step number */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white"
                style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
                {s.step}
              </div>
              <div className="text-4xl mb-4">{s.icon}</div>
              <h3 className="font-black text-gray-800 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── PERKS ─── */}
      <div style={{ background: "#faf5ff", padding: "80px 24px" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-violet-500 mb-3">
              Vendor Benefits
            </p>
            <h2 className="text-3xl font-black text-gray-900">Why Sell on ThemeMatrix?</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perks.map((p, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-violet-100"
                style={{ boxShadow: "0 2px 12px rgba(109,40,217,0.05)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
                  {p.icon}
                </div>
                <h3 className="font-black text-gray-800 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── BOTTOM CTA ─── */}
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-black text-gray-900 mb-4">
          Ready to Start Earning? 💰
        </h2>
        <p className="text-gray-400 mb-8 text-lg">
          Join thousands of vendors already making money on ThemeMatrix
        </p>

        {/* ✅ Become a Vendor button → links to register */}
        <Link to="/vendorregister"
          className="inline-block px-10 py-4 rounded-2xl font-black text-white no-underline transition-all hover:scale-105 text-base"
          style={{
            background: "linear-gradient(135deg,#a855f7,#7c3aed)",
            boxShadow: "0 8px 32px rgba(168,85,247,0.4)"
          }}>
          🚀 Become a Vendor — Register Now
        </Link>

        <p className="text-gray-400 text-sm mt-4">
          Already a vendor?{" "}
          <Link to="/vendorlogin" className="font-bold text-violet-600 no-underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default BecomeVendor