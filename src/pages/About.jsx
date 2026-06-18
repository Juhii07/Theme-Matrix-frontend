import { Link } from "react-router-dom"

const About = () => {
  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-r from-gray-950 to-purple-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">About ThemeMatrix</h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
            ThemeMatrix is a premium marketplace for UI kits, dashboards,
            and website templates built to help developers and designers
            create modern digital products faster.
          </p>
        </div>
      </section>

      {/* ABOUT CONTENT */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* IMAGE */}
          <div>
            <img
              src="/images/about.avif"
              alt="ThemeMatrix marketplace"
              className="rounded-2xl shadow-lg w-full object-cover"
              onError={e => {
                e.target.style.display = "none"
                e.target.parentNode.innerHTML = `
                  <div style="width:100%;height:320px;border-radius:1rem;background:linear-gradient(135deg,#4c1d95,#7c3aed,#a855f7);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;box-shadow:0 20px 60px rgba(124,58,237,0.25)">
                    <span style="font-size:4rem">🎨</span>
                    <p style="color:#e9d5ff;font-weight:700;font-size:1.2rem">ThemeMatrix</p>
                    <p style="color:rgba(255,255,255,0.5);font-size:0.875rem">Premium Template Marketplace</p>
                  </div>`
              }}
            />
          </div>

          {/* TEXT */}
          <div>
            <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-3">
              🚀 Our Story
            </p>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Empowering Developers &amp; Designers
            </h2>

            <p className="text-gray-600 mb-4 leading-relaxed">
              ThemeMatrix provides high-quality UI templates and design
              assets that enable developers to build websites and
              applications quickly. Our platform connects talented
              creators with businesses searching for premium digital
              products.
            </p>

            <p className="text-gray-600 mb-6 leading-relaxed">
              From admin dashboards and landing pages to complete UI
              kits, ThemeMatrix offers ready-to-use solutions for
              startups, agencies, and enterprises.
            </p>

            {/* Feature list */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {[
                ["✅", "Ready-to-use templates"],
                ["⚡", "Instant download"],
                ["🔄", "Regular updates"],
                ["🛡️", "Lifetime access"],
                ["🎨", "Modern design"],
                ["💎", "Premium quality"],
              ].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span className="text-sm text-gray-600 font-medium">{label}</span>
                </div>
              ))}
            </div>

            <Link
              to="/"
              className="inline-block bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg transition font-semibold no-underline"
            >
              Explore Templates →
            </Link>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gray-100 py-14">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-6 text-center">
          {[
            ["500+", "Templates", "🎨"],
            ["200+", "Creators",  "👥"],
            ["5k+",  "Customers", "👤"],
          ].map(([value, label, icon]) => (
            <div key={label} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
              <div className="text-3xl mb-2">{icon}</div>
              <h3 className="text-3xl font-bold text-violet-600">{value}</h3>
              <p className="text-gray-600 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MISSION */}
      <section className="max-w-6xl mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-3">💡 Our Mission</p>
          <h2 className="text-2xl font-bold text-gray-800">Why ThemeMatrix?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            ["🎨", "Premium Quality",   "Every template is carefully reviewed and approved by our team to ensure the highest design standards."],
            ["⚡", "Fast Delivery",     "Instant access after purchase. Download and start building your project immediately."],
            ["🛡️", "Lifetime Support",  "Get dedicated support from our team and the template creators throughout your journey."],
          ].map(([icon, title, desc]) => (
            <div key={title} className="bg-white rounded-xl p-6 shadow hover:shadow-lg hover:-translate-y-1 transition-all text-center border border-violet-50">
              <div className="text-4xl mb-4">{icon}</div>
              <h3 className="font-bold text-gray-800 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TEAM / CTA */}
      <section className="bg-gradient-to-r from-gray-900 to-purple-900 py-14">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Browse our collection of premium templates and start building your next project today.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/" className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-lg font-bold no-underline transition">
              Browse Templates
            </Link>
            <Link to="/vendorregister" className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-lg font-bold no-underline transition">
              Become a Vendor
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

export default About
