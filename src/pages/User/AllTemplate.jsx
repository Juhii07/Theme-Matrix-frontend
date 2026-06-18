import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"

const IMG = "http://localhost:5000/uploads/"
const PER_PAGE = 4 // ✅ items per page

const AllTemplate = () => {
  const [allTemplates,   setAllTemplates]   = useState([])
  const [templates,      setTemplates]      = useState([])
  const [activeCategory, setActiveCategory] = useState("all")
  const [categories,     setCategories]     = useState([])
  const [loading,        setLoading]        = useState(true)
  const [priceFilter,    setPriceFilter]    = useState("all")
  const [search,         setSearch]         = useState("")

  // ✅ Pagination state
  const [currentPage, setCurrentPage] = useState(1)

  const init = async () => {
    setLoading(true)
    try {
      const res  = await axios.get("http://localhost:5000/userapi/templates")
      const list = Array.isArray(res.data) ? res.data : []
      setAllTemplates(list)
      setTemplates(list)
      const seen = new Map()
      list.forEach(t => {
        const cat = t.designCategory
        if (cat && cat._id && cat.name && !seen.has(cat._id)) {
          seen.set(cat._id, { _id: cat._id, name: cat.name })
        }
      })
      setCategories([...seen.values()])
    } catch (e) { console.log(e) }
    setLoading(false)
  }

  useEffect(() => { init() }, [])

  // Reset to page 1 when filters change
  useEffect(() => { setCurrentPage(1) }, [search, activeCategory, priceFilter])

  const handleCategoryFilter = (catId) => {
    setActiveCategory(catId)
    if (catId === "all") setTemplates(allTemplates)
    else setTemplates(allTemplates.filter(t =>
      t.designCategory?._id === catId || t.designCategory === catId
    ))
  }

  const filtered = templates.filter(t => {
    const matchSearch = t.designName?.toLowerCase().includes(search.toLowerCase())
    const matchPrice =
      priceFilter === "all"       ? true :
      priceFilter === "under500"  ? t.regularPrice < 500 :
      priceFilter === "500to1000" ? t.regularPrice >= 500 && t.regularPrice <= 1000 :
      priceFilter === "above1000" ? t.regularPrice > 1000 : true
    return matchSearch && matchPrice
  })

  // ✅ Pagination logic
  const totalPages   = Math.ceil(filtered.length / PER_PAGE)
  const paginated    = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE)

  const pill = (active) => ({
    background: active ? "linear-gradient(135deg,#a855f7,#7c3aed)" : "#ffffff",
    color:      active ? "#ffffff" : "#6b21a8",
    border:     active ? "none"    : "2px solid #e9d5ff",
    cursor: "pointer",
  })

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
    <div className="max-w-7xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <Link to="/" className="text-sm font-bold text-violet-500 hover:text-violet-700 no-underline">
          ← Back to Home
        </Link>
        <h1 className="text-3xl font-black text-gray-900 mt-2">🎨 All Templates</h1>
        <p className="text-gray-400 mt-1">{filtered.length} templates available</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 border border-violet-100 max-w-lg"
          style={{ boxShadow: "0 2px 12px rgba(124,58,237,0.06)" }}>
          <span className="text-gray-400">🔍</span>
          <input type="text" placeholder="Search templates..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 outline-none text-gray-700 text-sm bg-transparent" />
          {search && (
            <button onClick={() => setSearch("")}
              className="text-xs font-bold text-red-400 hover:text-red-600"
              style={{ background: "none", border: "none", cursor: "pointer" }}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <span className="text-xs font-bold text-gray-400">🏷️ Category:</span>
        <button onClick={() => handleCategoryFilter("all")}
          className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
          style={pill(activeCategory === "all")}>
          All
        </button>
        {categories.map(c => (
          <button key={c._id} onClick={() => handleCategoryFilter(c._id)}
            className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
            style={pill(activeCategory === c._id)}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Price Filter */}
      <div className="flex flex-wrap gap-2 items-center mb-8">
        <span className="text-xs font-bold text-gray-400">💰 Price:</span>
        {[
          ["all",       "All Prices"],
          ["under500",  "Under ₹500"],
          ["500to1000", "₹500 – ₹1000"],
          ["above1000", "Above ₹1000"],
        ].map(([val, label]) => (
          <button key={val} onClick={() => setPriceFilter(val)}
            className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
            style={pill(priceFilter === val)}>
            {label}
          </button>
        ))}
      </div>

      {/* Results info */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500 font-semibold">
          {search || activeCategory !== "all" || priceFilter !== "all"
            ? `🔍 ${filtered.length} results found`
            : `Showing all ${filtered.length} templates`}
        </p>
        {(search || activeCategory !== "all" || priceFilter !== "all") && (
          <button
            onClick={() => { setSearch(""); setPriceFilter("all"); handleCategoryFilter("all") }}
            className="text-xs font-bold text-red-400 hover:text-red-600 transition bg-transparent border-none cursor-pointer">
            ✕ Clear All Filters
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1,2,3,4,5,6,7,8].map(i => (
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
        <div className="text-center py-24 bg-white rounded-2xl border border-violet-100">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-black text-gray-700 mb-2">No templates found</h3>
          <p className="text-gray-400">Try a different search, category or price range</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {paginated.map(t => <Card key={t._id} t={t} />)}
          </div>

          {/* ✅ PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-violet-50">
              <p className="text-xs text-gray-400 font-semibold">
                Showing {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1.5">

                {/* Prev */}
                <button
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo(0, 0) }}
                  disabled={currentPage === 1}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: currentPage === 1 ? "#f5f3ff" : "#ede9fe",
                    color:      currentPage === 1 ? "#c4b5fd" : "#7c3aed",
                    border: "none", cursor: currentPage === 1 ? "not-allowed" : "pointer"
                  }}>
                  ‹
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...")
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, idx) =>
                    p === "..." ? (
                      <span key={`dot-${idx}`}
                        className="w-9 h-9 flex items-center justify-center text-gray-300 text-xs">
                        …
                      </span>
                    ) : (
                      <button key={p}
                        onClick={() => { setCurrentPage(p); window.scrollTo(0, 0) }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all"
                        style={{
                          background: currentPage === p ? "#7c3aed" : "#f5f3ff",
                          color:      currentPage === p ? "#fff"    : "#7c3aed",
                          border: "none", cursor: "pointer"
                        }}>
                        {p}
                      </button>
                    )
                  )}

                {/* Next */}
                <button
                  onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo(0, 0) }}
                  disabled={currentPage === totalPages}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    background: currentPage === totalPages ? "#f5f3ff" : "#ede9fe",
                    color:      currentPage === totalPages ? "#c4b5fd" : "#7c3aed",
                    border: "none", cursor: currentPage === totalPages ? "not-allowed" : "pointer"
                  }}>
                  ›
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AllTemplate