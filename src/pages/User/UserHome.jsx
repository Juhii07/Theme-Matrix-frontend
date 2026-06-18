import { useState, useEffect } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import axios from "axios"

const IMG = "http://localhost:5000/uploads/"

const UserHome = () => {
  const [templates,      setTemplates]      = useState([])
  const [latest,         setLatest]         = useState([])
  const [categories,     setCategories]     = useState([])
  const [activeCategory, setActiveCategory] = useState("all")
  const [loading,        setLoading]        = useState(true)
  const [search,         setSearch]         = useState("")
  const [priceFilter,    setPriceFilter]    = useState("all")

  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const q = searchParams.get("search") || ""
    setSearch(q)
  }, [searchParams])

  const init = async () => {
    setLoading(true)
    try {
      const [t, l, c] = await Promise.all([
        axios.get("http://localhost:5000/userapi/templates"),
        axios.get("http://localhost:5000/userapi/templates/latest"),
        axios.get("http://localhost:5000/adminapi/category"),
      ])
      setTemplates(Array.isArray(t.data) ? t.data : [])
      setLatest(Array.isArray(l.data) ? l.data : [])
      setCategories(Array.isArray(c.data.data) ? c.data.data : [])
    } catch (e) { console.log(e) }
    setLoading(false)
  }

  const filterByCategory = async (catId) => {
    setActiveCategory(catId)
    try {
      const url = catId === "all"
        ? "http://localhost:5000/userapi/templates"
        : `http://localhost:5000/userapi/templates/category/${catId}`
      const res = await axios.get(url)
      setTemplates(Array.isArray(res.data) ? res.data : [])
    } catch (e) { console.log(e) }
  }

  useEffect(() => { init() }, [])

  const filtered = templates.filter(t => {
    const matchSearch = t.designName?.toLowerCase().includes(search.toLowerCase())
    const matchPrice =
      priceFilter === "all"       ? true :
      priceFilter === "under500"  ? t.regularPrice < 500 :
      priceFilter === "500to1000" ? t.regularPrice >= 500 && t.regularPrice <= 1000 :
      priceFilter === "above1000" ? t.regularPrice > 1000 : true
    return matchSearch && matchPrice
  })

  const handleHeroSearch = () => {
    if (search.trim()) setSearchParams({ search: search.trim() })
    else setSearchParams({})
  }

  const whyFeatures = [
    { icon: "🎨", title: "Premium Templates", desc: "Browse and compare templates across categories with detailed previews, ratings, and live demos instantly." },
    { icon: "👨‍💻", title: "Expert Vendors", desc: "Connect with verified, experienced template developers across every design field and download instantly." },
    { icon: "⚡", title: "Easy Downloads", desc: "Purchase, download, or cancel orders in seconds from any device, anywhere with lifetime access." },
    { icon: "🔒", title: "Secure & Private", desc: "Your payment data is encrypted and protected. We never share your personal information." },
  ]

  const Card = ({ t }) => (
    <Link to={`/template/${t._id}`} className="no-underline group block">
      <div className="bg-white rounded-2xl overflow-hidden border border-violet-100 hover:border-violet-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50">
          {t.designThumbnail ? (
            <img src={`${IMG}${t.designThumbnail}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={e => { e.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f3e8ff,#ede9fe);color:#7c3aed;font-size:52px;font-weight:900">${t.designName?.charAt(0)?.toUpperCase()}</div>` }} />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-black text-5xl"
              style={{ background: "linear-gradient(135deg,#f3e8ff,#ede9fe)", color: "#7c3aed" }}>
              {t.designName?.charAt(0)?.toUpperCase()}
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "rgba(109,40,217,0.65)" }}>
            <span className="bg-white text-violet-700 font-bold text-sm px-5 py-2 rounded-full">👁️ Preview</span>
          </div>
          {t.designCategory?.name && (
            <div className="absolute top-3 left-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(109,40,217,0.85)", color: "#fff" }}>
                {t.designCategory.name}
              </span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-1 truncate">{t.designName}</h3>
          <p className="text-xs text-gray-400 mb-3 truncate">by {t.vendorId?.name || "Developer"}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 line-through">₹{Math.round(t.regularPrice * 1.3)}</p>
              <p className="font-black text-violet-700 text-lg">₹{t.regularPrice}</p>
            </div>
            <span className="text-xs text-amber-600 font-semibold">⭐ 4.8</span>
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* HERO */}
      <div className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg,#3b0764 0%,#4c1d95 40%,#6b21a8 70%,#7e22ce 100%)", minHeight: "480px" }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,#e879f9,transparent)", transform: "translate(30%,-30%)" }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,#a78bfa,transparent)", transform: "translate(-30%,30%)" }} />
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(255,255,255,0.5) 1px,transparent 0)", backgroundSize: "24px 24px" }} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6"
            style={{ background: "rgba(255,255,255,0.1)", color: "#e9d5ff", border: "1px solid rgba(255,255,255,0.15)" }}>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            🎨 Premium UI Kits & Templates Marketplace
          </div>

          <h1 className="font-black text-white mb-4 leading-tight" style={{ fontSize: "clamp(2.2rem,5vw,4rem)" }}>
            Discover &amp; Download<br />
            <span style={{ background: "linear-gradient(90deg,#f0abfc,#c084fc,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Premium Templates
            </span>
          </h1>

          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            {templates.length}+ hand-crafted templates. Ready to use. Fully responsive. Modern design.
          </p>

          <div className="max-w-xl mx-auto mb-8">
            <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-2xl">
              <span className="text-gray-400 text-lg">🔍</span>
              <input type="text" placeholder="Search templates, categories..."
                value={search} onChange={e => setSearch(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleHeroSearch()}
                className="flex-1 outline-none text-gray-700 text-sm font-medium bg-transparent" />
              <button onClick={handleHeroSearch}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer" }}>
                Search
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 justify-center">
            {[["🎨", `${templates.length}+`, "Templates"], ["👥", "500+", "Vendors"], ["👤", "10K+", "Customers"], ["⭐", "4.9", "Rating"]].map(([icon, val, label]) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-white">{icon} {val}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES BAR */}
      <div style={{ background: "#f9fafb", borderBottom: "1px solid #ede9fe", borderTop: "1px solid #ede9fe" }}>
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "24px" }}>
            {[
              ["✅", "Fully Responsive", "Works perfectly on all screen sizes and devices."],
              ["⚡", "Ready to Use", "Download and launch your project instantly."],
              ["🎨", "Modern Design", "Clean, professional and up-to-date UI styles."],
              ["🔄", "Regular Updates", "Templates updated with the latest trends."],
              ["💎", "Premium Quality", "Hand-crafted by experienced designers."],
              ["🛡️", "Lifetime Access", "Buy once and access forever, no renewals."],
            ].map(([icon, title, desc]) => (
              <div key={title}
                style={{ background: "#ffffff", border: "1.5px solid #ede9fe", borderRadius: "16px", padding: "24px 20px", textAlign: "left", transition: "transform 0.25s ease, box-shadow 0.25s ease", boxShadow: "0 2px 8px rgba(124,58,237,0.05)", cursor: "default" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(124,58,237,0.12)" }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(124,58,237,0.05)" }}>
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "linear-gradient(135deg,#a855f7,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", marginBottom: "14px" }}>
                  {icon}
                </div>
                <p style={{ fontSize: "15px", fontWeight: 800, color: "#1a1a2e", margin: "0 0 8px 0" }}>{title}</p>
                <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WHY CHOOSE */}
      <div style={{ background: "#ffffff", padding: "80px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: "#a855f7", margin: "0 0 14px 0" }}>
            Why Choose ThemeMatrix
          </p>
          <h2 style={{ fontSize: "clamp(26px,4.5vw,50px)", fontWeight: 900, color: "#1a1a2e", lineHeight: 1.15, margin: "0 0 18px 0" }}>
            Everything you need for<br />better templates
          </h2>
          <p style={{ fontSize: "clamp(14px,1.8vw,17px)", color: "#6b7280", maxWidth: "520px", margin: "0 auto", lineHeight: 1.75 }}>
            One platform for all your design needs — from finding premium templates to managing downloads and orders.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px", marginTop: "48px" }}>
            {whyFeatures.map((f, i) => (
              <div key={i}
                style={{ background: "#ffffff", border: "1.5px solid #ede9fe", borderRadius: "20px", padding: "32px 24px", textAlign: "left", transition: "transform 0.25s ease, box-shadow 0.25s ease", cursor: "default", boxShadow: "0 2px 12px rgba(124,58,237,0.06)" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 48px rgba(124,58,237,0.13)" }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(124,58,237,0.06)" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "14px", background: "linear-gradient(135deg,#a855f7,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", marginBottom: "20px" }}>
                  {f.icon}
                </div>
                <p style={{ fontSize: "17px", fontWeight: 800, color: "#1a1a2e", margin: "0 0 10px 0" }}>{f.title}</p>
                <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* LATEST TEMPLATES */}
        {latest.length > 0 && !search && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-800">🆕 Latest Templates</h2>
                <p className="text-gray-500 text-sm mt-1">Freshly uploaded by our top vendors</p>
              </div>
              <button onClick={() => navigate("/all-templates")}
                className="text-sm font-bold text-violet-600 hover:text-violet-800 transition-colors bg-transparent border-none cursor-pointer">
                View all →
              </button>
            </div>
            <div className="flex gap-5 overflow-x-auto pb-4" style={{ scrollbarWidth: "thin", scrollbarColor: "#c084fc #f3e8ff" }}>
              {latest.map(t => (
                <Link key={t._id} to={`/template/${t._id}`} className="no-underline flex-shrink-0 w-52 group">
                  <div className="bg-white rounded-2xl overflow-hidden border border-violet-100 hover:border-violet-300 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="h-32 overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50">
                      {t.designThumbnail ? (
                        <img src={`${IMG}${t.designThumbnail}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-black text-3xl"
                          style={{ background: "linear-gradient(135deg,#f3e8ff,#ede9fe)", color: "#7c3aed" }}>
                          {t.designName?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-bold text-gray-800 text-xs truncate mb-1">{t.designName}</p>
                      <div className="flex items-center justify-between">
                        <p className="font-black text-violet-700">₹{t.regularPrice}</p>
                        <span className="text-xs text-amber-500">⭐ 4.8</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORY FILTER */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-gray-800">
              {search ? `🔍 Results for "${search}" (${filtered.length})` : "🎨 Featured Templates"}
            </h2>
            {search ? (
              <button onClick={() => { setSearch(""); setSearchParams({}) }}
                className="text-sm font-bold text-red-400 hover:text-red-600 transition bg-transparent border-none cursor-pointer">
                ✕ Clear Search
              </button>
            ) : (
              <button onClick={() => navigate("/all-templates")}
                className="text-sm font-bold text-violet-600 hover:text-violet-800 transition bg-transparent border-none cursor-pointer">
                View More →
              </button>
            )}
          </div>

          {!search && (
            <>
              {/* ✅ Category Filter — pill style */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs font-bold text-gray-400 flex items-center mr-1">🏷️ Category:</span>
                <button onClick={() => filterByCategory("all")}
                  className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                  style={{ background: activeCategory === "all" ? "linear-gradient(135deg,#a855f7,#7c3aed)" : "white", color: activeCategory === "all" ? "white" : "#6b21a8", border: activeCategory === "all" ? "none" : "2px solid #e9d5ff", cursor: "pointer" }}>
                  All
                </button>
                {categories.map(c => (
                  <button key={c._id} onClick={() => filterByCategory(c._id)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={{ background: activeCategory === c._id ? "linear-gradient(135deg,#a855f7,#7c3aed)" : "white", color: activeCategory === c._id ? "white" : "#6b21a8", border: activeCategory === c._id ? "none" : "2px solid #e9d5ff", cursor: "pointer" }}>
                    {c.name}
                  </button>
                ))}
              </div>

              {/* ✅ Price Filter — pill style */}
              <div className="flex flex-wrap gap-2 items-center mb-6">
                <span className="text-xs font-bold text-gray-400 mr-1">💰 Price:</span>
                {[
                  ["all", "All Prices"],
                  ["under500", "Under ₹500"],
                  ["500to1000", "₹500 - ₹1000"],
                  ["above1000", "Above ₹1000"],
                ].map(([val, label]) => (
                  <button key={val} onClick={() => setPriceFilter(val)}
                    className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                    style={{ background: priceFilter === val ? "linear-gradient(135deg,#10b981,#059669)" : "white", color: priceFilter === val ? "white" : "#047857", border: priceFilter === val ? "none" : "2px solid #d1fae5", cursor: "pointer" }}>
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ✅ SHOW ONLY 4 TEMPLATES on home */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-violet-100 animate-pulse">
                <div className="h-48 bg-violet-50"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 rounded-full bg-violet-50"></div>
                  <div className="h-3 rounded-full bg-violet-50 w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-black text-gray-700 mb-2">No templates found</h3>
            <p className="text-gray-400">Try a different search or category</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* ✅ show only first 4 */}
              {filtered.slice(0, 4).map(t => <Card key={t._id} t={t} />)}
            </div>

            {/* ✅ View More button */}
            {filtered.length > 4 && (
              <div className="text-center mt-10">
                <button
                  onClick={() => navigate("/all-templates")}
                  className="px-10 py-3.5 rounded-2xl font-black text-white text-sm transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(168,85,247,0.35)" }}>
                  🎨 View More Templates ({filtered.length - 4} more)
                </button>
              </div>
            )}
          </>
        )}

        {/* CTA BANNER */}
        {!loading && (
          <div className="mt-16 rounded-3xl overflow-hidden relative"
            style={{ background: "linear-gradient(135deg,#4c1d95,#6b21a8,#7e22ce)" }}>
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
              style={{ background: "radial-gradient(circle,#e879f9,transparent)", transform: "translate(30%,-30%)" }} />
            <div className="relative z-10 px-8 py-12 text-center">
              <h2 className="text-3xl font-black text-white mb-3">Start Selling Your Templates</h2>
              <p className="text-lg mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>
                Join 500+ vendors and reach thousands of developers worldwide
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/vendorregister"
                  className="px-8 py-3 rounded-2xl font-black text-violet-700 no-underline transition-all hover:scale-105"
                  style={{ background: "#fff" }}>
                  🚀 Become a Vendor
                </Link>
                <Link to="/contact"
                  className="px-8 py-3 rounded-2xl font-black no-underline transition-all hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#fff", border: "1.5px solid rgba(255,255,255,0.25)" }}>
                  Learn More →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserHome