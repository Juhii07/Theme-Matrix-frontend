import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const IMG          = "http://localhost:5000/uploads/"
const ITEMS_PER_PAGE = 5

const VendorCategories = () => {
  const [categories,     setCategories]     = useState([])
  const [templates,      setTemplates]      = useState([])
  const [loading,        setLoading]        = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)
  const [page,           setPage]           = useState(1)
  const sliderRef = useRef(null)
  const navigate  = useNavigate()

  const H = { Authorization: `Bearer ${localStorage.getItem("vendorToken")}` }

  const getData = async () => {
    setLoading(true)
    try {
      const [catRes, tplRes] = await Promise.all([
        axios.get("http://localhost:5000/vendorapi/category",     { headers: H }),
        axios.get("http://localhost:5000/vendorapi/my-templates", { headers: H }),
      ])
      const cats = Array.isArray(catRes.data.categories) ? catRes.data.categories : []
      const tpls = Array.isArray(tplRes.data) ? tplRes.data : []
      setCategories(cats)
      setTemplates(tpls)
      if (cats.length > 0) setActiveCategory(cats[0]._id)
    } catch (e) { console.log(e) }
    setLoading(false)
  }

  useEffect(() => { getData() }, [])

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId)
    setPage(1)
  }

  const getTemplatesByCategory = (catId) =>
    templates.filter(t => {
      const id = t.designCategory?._id || t.designCategory
      return id?.toString() === catId?.toString()
    })

  const Badge = ({ s }) => {
    const styles = {
      approved:        { background: "#dcfce7", color: "#15803d" },
      pending:         { background: "#fef9c3", color: "#854d0e" },
      rejected:        { background: "#fee2e2", color: "#dc2626" },
      disabled:        { background: "#f3f4f6", color: "#6b7280" },
      "change needed": { background: "#ffedd5", color: "#c2410c" },
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold"
        style={styles[s] || { background: "#f3f4f6", color: "#6b7280" }}>
        {s}
      </span>
    )
  }

  const catColors = [
    "linear-gradient(135deg,#a855f7,#7c3aed)",
    "linear-gradient(135deg,#ec4899,#db2777)",
    "linear-gradient(135deg,#3b82f6,#4f46e5)",
    "linear-gradient(135deg,#10b981,#059669)",
    "linear-gradient(135deg,#f59e0b,#d97706)",
    "linear-gradient(135deg,#ef4444,#dc2626)",
    "linear-gradient(135deg,#06b6d4,#3b82f6)",
    "linear-gradient(135deg,#14b8a6,#10b981)",
  ]

  const allActiveCatTemplates = activeCategory
    ? getTemplatesByCategory(activeCategory)
    : []

  const totalPages         = Math.ceil(allActiveCatTemplates.length / ITEMS_PER_PAGE)
  const paginatedTemplates = allActiveCatTemplates.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )
  const activeCat = categories.find(c => c._id === activeCategory)

  const scrollLeft  = () => sliderRef.current?.scrollBy({ left: -220, behavior: "smooth" })
  const scrollRight = () => sliderRef.current?.scrollBy({ left:  220, behavior: "smooth" })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900">🏷️ Categories</h2>
          <p className="text-sm text-gray-400 mt-1">
            {categories.length} categories · {templates.length} total templates
          </p>
        </div>
        <button
          onClick={() => navigate("/vendor/upload")}
          className="px-4 py-2 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer" }}>
          + Upload New
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">🏷️</p>
          <p className="font-black text-gray-400 text-lg">No categories available</p>
          <p className="text-sm text-gray-300 mt-1">Ask admin to add categories</p>
        </div>
      ) : (
        <>
          {/* ── Category Slider ── */}
          <div className="relative mb-6">

            {/* Left Arrow */}
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
              style={{ background: "#fff", border: "1px solid #ede9fe", cursor: "pointer", marginLeft: "-12px" }}>
              <span className="text-violet-600 font-black text-sm">‹</span>
            </button>

            {/* Slider Track */}
            <div
              ref={sliderRef}
              className="flex gap-3 overflow-x-auto px-2"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
              }}>
              <style>{`div::-webkit-scrollbar { display: none; }`}</style>

              {categories.map((cat, idx) => {
                const count    = getTemplatesByCategory(cat._id).length
                const isActive = activeCategory === cat._id
                const bg       = catColors[idx % catColors.length]

                return (
                  <button
                    key={cat._id}
                    onClick={() => handleCategoryClick(cat._id)}
                    className="flex-shrink-0 flex flex-col items-center gap-2 px-4 py-3 rounded-2xl transition-all hover:scale-[1.03]"
                    style={{
                      minWidth:   "110px",
                      border:     isActive ? "none" : "2px solid #ede9fe",
                      background: isActive ? bg : "#fff",
                      cursor:     "pointer",
                      boxShadow:  isActive ? "0 4px 16px rgba(109,40,217,0.25)" : "none"
                    }}>

                    {/* Icon circle */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-white"
                      style={{ background: isActive ? "rgba(255,255,255,0.25)" : bg }}>
                      {cat.name?.charAt(0)?.toUpperCase()}
                    </div>

                    <div className="text-center">
                      <p className="font-bold text-xs truncate max-w-[90px]"
                        style={{ color: isActive ? "#fff" : "#1f2937" }}>
                        {cat.name}
                      </p>
                      <p className="text-xs font-semibold mt-0.5"
                        style={{ color: isActive ? "rgba(255,255,255,0.75)" : "#9ca3af" }}>
                        {count} template{count !== 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Active dot */}
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Right Arrow */}
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
              style={{ background: "#fff", border: "1px solid #ede9fe", cursor: "pointer", marginRight: "-12px" }}>
              <span className="text-violet-600 font-black text-sm">›</span>
            </button>
          </div>

          {/* ── Templates Panel ── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-black text-gray-900 text-lg">
                  🏷️ {activeCat?.name}
                </h3>
                <p className="text-sm text-gray-400 mt-0.5">
                  {allActiveCatTemplates.length} template
                  {allActiveCatTemplates.length !== 1 ? "s" : ""} in this category
                </p>
              </div>
              <button
                onClick={() => navigate("/vendor/upload")}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-violet-600 bg-violet-50 transition-all hover:bg-violet-100"
                style={{ border: "none", cursor: "pointer" }}>
                + Add Template
              </button>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-violet-100"
              style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>

              {allActiveCatTemplates.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-4xl mb-3">🎨</p>
                  <p className="font-bold text-gray-400 mb-2">No templates in this category</p>
                  <button
                    onClick={() => navigate("/vendor/upload")}
                    className="text-sm font-bold text-violet-600 bg-transparent border-none cursor-pointer hover:underline">
                    Upload one →
                  </button>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-violet-50/60">
                        <tr>
                          {["No.", "Thumb", "Template", "Price", "Status", "Actions"].map(h => (
                            <th key={h}
                              className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-violet-500 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTemplates.map((t, i) => (
                          <tr key={t._id}
                            className="border-t border-violet-50 hover:bg-violet-50/30 transition-colors">

                            <td className="px-5 py-4 text-xs font-semibold text-gray-400">
                              {(page - 1) * ITEMS_PER_PAGE + i + 1}
                            </td>

                            <td className="px-5 py-4">
                              <div className="w-14 h-10 rounded-lg overflow-hidden border border-violet-100 bg-violet-50">
                                {t.designThumbnail ? (
                                  <img
                                    src={IMG + t.designThumbnail}
                                    alt={t.designName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-black text-sm text-violet-600">
                                    {t.designName?.charAt(0)?.toUpperCase()}
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <p className="font-bold text-gray-800 text-xs">{t.designName}</p>
                              <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px]">
                                {t.shortDescription || "—"}
                              </p>
                            </td>

                            <td className="px-5 py-4 font-bold text-sm text-violet-700 whitespace-nowrap">
                              ₹{t.regularPrice}
                            </td>

                            <td className="px-5 py-4">
                              <Badge s={t.designStatus} />
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => navigate(`/vendor/edit-template/${t._id}`)}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
                                  style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer" }}>
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={() => navigate("/vendor/my-templates")}
                                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-violet-50 text-violet-600 transition-all hover:scale-105 hover:bg-violet-100"
                                  style={{ border: "none", cursor: "pointer" }}>
                                  👁️ View
                                </button>
                              </div>
                            </td>

                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {allActiveCatTemplates.length > ITEMS_PER_PAGE && (
                    <div className="flex items-center justify-between px-5 py-4 border-t border-violet-50">
                      <p className="text-xs font-semibold text-gray-400">
                        Showing{" "}
                        <span className="text-violet-600 font-bold">
                          {(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, allActiveCatTemplates.length)}
                        </span>{" "}
                        of{" "}
                        <span className="text-violet-600 font-bold">{allActiveCatTemplates.length}</span> templates
                      </p>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setPage(p => p - 1)}
                          disabled={page === 1}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border-none transition-all"
                          style={{
                            background: page === 1 ? "#f3f4f6" : "linear-gradient(135deg,#a855f7,#7c3aed)",
                            color:      page === 1 ? "#9ca3af" : "#fff",
                            cursor:     page === 1 ? "not-allowed" : "pointer"
                          }}>
                          ← Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(num => (
                          <button key={num} onClick={() => setPage(num)}
                            className="w-8 h-8 rounded-lg text-xs font-bold border-none cursor-pointer transition-all hover:scale-105"
                            style={{
                              background: num === page ? "linear-gradient(135deg,#a855f7,#7c3aed)" : "#f5f3ff",
                              color:      num === page ? "#fff" : "#7c3aed"
                            }}>
                            {num}
                          </button>
                        ))}

                        <button
                          onClick={() => setPage(p => p + 1)}
                          disabled={page === totalPages}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold border-none transition-all"
                          style={{
                            background: page === totalPages ? "#f3f4f6" : "linear-gradient(135deg,#a855f7,#7c3aed)",
                            color:      page === totalPages ? "#9ca3af" : "#fff",
                            cursor:     page === totalPages ? "not-allowed" : "pointer"
                          }}>
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default VendorCategories