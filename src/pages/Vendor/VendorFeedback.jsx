import { useState, useEffect } from "react"
import axios from "axios"

const IMG = "http://localhost:5000/uploads/"

const VendorFeedback = () => {
  const [ratings,     setRatings]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState("")
  const [filter,      setFilter]      = useState("all")
  const [starFilter,  setStarFilter]  = useState("all")
  const [popupData,   setPopupData]   = useState(null) // ✅ popup state

  const H = { Authorization: `Bearer ${localStorage.getItem("vendorToken")}` }

  const getFeedback = async () => {
    setLoading(true)
    try {
      const res = await axios.get("http://localhost:5000/vendorapi/feedback", { headers: H })
      let data = []
      if (Array.isArray(res.data))           data = res.data
      else if (Array.isArray(res.data.data)) data = res.data.data
      setRatings(data)
    } catch (e) { console.log(e) }
    setLoading(false)
  }

  useEffect(() => { getFeedback() }, [])

  const filtered = ratings.filter(r => {
    const matchSearch =
      r.templateId?.designName?.toLowerCase().includes(search.toLowerCase()) ||
      r.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.review?.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === "all"        ? true :
      filter === "complaints" ? r.complaint && r.complaint !== "" :
      filter === "positive"   ? r.rating >= 4 :
      filter === "negative"   ? r.rating <= 2 : true
    const matchStar = starFilter === "all" ? true : r.rating === Number(starFilter)
    return matchSearch && matchFilter && matchStar
  })

  const totalRatings = ratings.length
  const avgRating    = ratings.length
    ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
    : "0.0"
  const complaints = ratings.filter(r => r.complaint && r.complaint !== "").length
  const positive   = ratings.filter(r => r.rating >= 4).length

  const StarDisplay = ({ value }) => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= value ? "#f59e0b" : "#d1d5db", fontSize: "14px" }}>★</span>
      ))}
    </div>
  )

  return (
    <div>

      {/* ✅ Complaint + Resolve Message Popup */}
      {popupData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
          onClick={() => setPopupData(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg,#fff1f2,#fee2e2)" }}>
              <div>
                <h3 className="font-black text-gray-900">Complaint Details</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Template: {popupData.templateId?.designName || "—"}
                </p>
              </div>
              <button
                onClick={() => setPopupData(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: "#9ca3af" }}>
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">

              {/* Rating */}
              <div className="flex items-center gap-3">
                <StarDisplay value={popupData.rating} />
                <span className="text-sm font-bold text-gray-600">{popupData.rating}/5</span>
              </div>

              {/* Review */}
              {popupData.review && (
                <div className="rounded-xl p-4 border border-violet-100"
                  style={{ background: "#faf5ff" }}>
                  <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">Review</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{popupData.review}</p>
                </div>
              )}

              {/* Complaint */}
              <div className="rounded-xl p-4 border border-red-100"
                style={{ background: "#fff5f5" }}>
                <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">Complaint from user</p>
                <p className="text-sm text-red-700 leading-relaxed">{popupData.complaint}</p>
              </div>

              {/* Complaint Status */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status:</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: popupData.complaintStatus === "resolved" ? "#dcfce7" : "#fee2e2",
                    color:      popupData.complaintStatus === "resolved" ? "#15803d"  : "#dc2626",
                  }}>
                  {popupData.complaintStatus === "resolved" ? "✅ Resolved" : "⚠️ Open"}
                </span>
              </div>

              {/* ✅ Admin resolve message — shown only if present */}
              {popupData.vendorMessage ? (
                <div className="rounded-xl p-4 border border-emerald-200"
                  style={{ background: "#f0fdf4" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-600 text-sm">✅</span>
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                      Message from Admin
                    </p>
                  </div>
                  <p className="text-sm text-emerald-800 leading-relaxed">
                    {popupData.vendorMessage}
                  </p>
                  {popupData.resolvedAt && (
                    <p className="text-xs text-emerald-500 mt-2">
                      Resolved on: {new Date(popupData.resolvedAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                  )}
                </div>
              ) : popupData.complaintStatus === "resolved" ? (
                <div className="rounded-xl p-4 border border-emerald-100"
                  style={{ background: "#f0fdf4" }}>
                  <p className="text-xs text-emerald-600 font-semibold">
                    ✅ Admin has resolved this complaint. No additional message was provided.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl p-4 border border-amber-100"
                  style={{ background: "#fffbeb" }}>
                  <p className="text-xs text-amber-600 font-semibold">
                    ⏳ This complaint is pending admin review.
                  </p>
                </div>
              )}

              <button
                onClick={() => setPopupData(null)}
                className="w-full py-3 rounded-xl font-black text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                style={{ border: "none", cursor: "pointer" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900">Feedback and Reviews</h2>
        <p className="text-sm text-gray-400 mt-1">
          Ratings, reviews and complaints for your templates
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          ["Total Reviews",   totalRatings, "from-violet-500 to-purple-600"],
          ["Avg Rating",      avgRating,    "from-amber-400 to-orange-500"],
          ["Positive (4-5★)", positive,     "from-emerald-500 to-green-600"],
          ["Complaints",      complaints,   "from-red-500 to-rose-600"],
        ].map(([label, value, bg]) => (
          <div key={label} className={`rounded-2xl p-4 bg-gradient-to-br ${bg} text-white`}
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
            <p className="font-black text-2xl leading-none mb-1">{value}</p>
            <p className="text-xs font-semibold text-white/80">{label}</p>
          </div>
        ))}
      </div>

      {/* Rating Distribution */}
      {ratings.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-violet-100 mb-6"
          style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
          <h3 className="font-black text-gray-800 mb-4 text-sm">Rating Distribution</h3>
          <div className="space-y-2">
            {[5,4,3,2,1].map(star => {
              const count = ratings.filter(r => r.rating === star).length
              const pct   = ratings.length ? Math.round((count / ratings.length) * 100) : 0
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-500 w-4">{star}</span>
                  <span className="text-amber-400 text-sm">★</span>
                  <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: "linear-gradient(90deg,#f59e0b,#fbbf24)" }} />
                  </div>
                  <span className="text-xs text-gray-500 font-semibold w-8 text-right">{count}</span>
                  <span className="text-xs text-gray-300 w-8">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <input type="text" placeholder="Search template, user, review..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl text-sm outline-none border-2 border-violet-100 focus:border-violet-400 bg-white"
          style={{ fontFamily: "inherit", minWidth: "220px" }} />

        {["all","positive","negative","complaints"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize"
            style={{
              background: filter === f ? "linear-gradient(135deg,#a855f7,#7c3aed)" : "#f5f3ff",
              color:      filter === f ? "#fff" : "#7c3aed",
              border: "none", cursor: "pointer"
            }}>
            {f === "all" ? "All" : f === "positive" ? "Positive" : f === "negative" ? "Negative" : "Complaints"}
          </button>
        ))}

        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400 font-bold">Stars:</span>
          {["all","5","4","3","2","1"].map(s => (
            <button key={s} onClick={() => setStarFilter(s)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{
                background: starFilter === s ? "#f59e0b" : "#fef9c3",
                color:      starFilter === s ? "#fff"    : "#92400e",
                border: "none", cursor: "pointer"
              }}>
              {s === "all" ? "All" : `${s}★`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-violet-100"
        style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-violet-50/60">
              <tr>
                {["No.","Template","Customer","Rating","Review","Complaint","Date"].map(h => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-violet-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i}>
                    <td colSpan={7} className="px-4 py-4">
                      <div className="h-4 rounded-full animate-pulse bg-violet-50" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-14">
                    <p className="text-4xl mb-3">⭐</p>
                    <p className="text-gray-400 font-semibold">No feedback yet</p>
                    <p className="text-xs text-gray-300 mt-1">Reviews will appear when users rate your templates</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={r._id} className="border-t border-violet-50 hover:bg-violet-50/30 transition-colors">

                    <td className="px-4 py-3.5 text-gray-300 text-xs">{i + 1}</td>

                    {/* Template */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {r.templateId?.designThumbnail ? (
                          <img src={`${IMG}${r.templateId.designThumbnail}`}
                            className="w-10 h-8 rounded-lg object-cover border border-violet-100" alt="" />
                        ) : (
                          <div className="w-10 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white"
                            style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
                            {r.templateId?.designName?.charAt(0) || "T"}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-800 text-xs max-w-[120px] truncate">
                            {r.templateId?.designName || "—"}
                          </p>
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: r.templateId?.designStatus === "approved" ? "#dcfce7" : "#fee2e2",
                              color:      r.templateId?.designStatus === "approved" ? "#15803d" : "#dc2626",
                            }}>
                            {r.templateId?.designStatus === "approved" ? "Active" : "Disabled"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                          style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
                          {(r.userId?.name || "U").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700 text-xs">{r.userId?.name || "—"}</p>
                          <p className="text-xs text-gray-400">{r.userId?.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3.5">
                      <StarDisplay value={r.rating} />
                      <span className="text-xs font-bold mt-0.5 block"
                        style={{ color: r.rating >= 4 ? "#059669" : r.rating === 3 ? "#d97706" : "#dc2626" }}>
                        {r.rating}/5
                      </span>
                    </td>

                    {/* Review */}
                    <td className="px-4 py-3.5 max-w-xs">
                      {r.isVisible === false ? (
                        <span className="text-xs text-gray-400 italic">Hidden by admin</span>
                      ) : r.review ? (
                        <p className="text-xs text-gray-600 line-clamp-2" title={r.review}>{r.review}</p>
                      ) : (
                        <span className="text-xs text-gray-300 italic">No review</span>
                      )}
                    </td>

                    {/* ✅ Complaint — popup button */}
                    <td className="px-4 py-3.5">
                      {r.complaint ? (
                        <button
                          onClick={() => setPopupData(r)}
                          style={{
                            background: r.complaintStatus === "resolved"
                              ? "linear-gradient(135deg,#10b981,#059669)"
                              : "linear-gradient(135deg,#ef4444,#dc2626)",
                            color: "#fff",
                            border: "none",
                            cursor: "pointer",
                            padding: "5px 12px",
                            borderRadius: "10px",
                            fontSize: "11px",
                            fontWeight: "900",
                            whiteSpace: "nowrap",
                          }}>
                          {r.complaintStatus === "resolved" ? "✅ View resolved" : "⚠️ View complaint"}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300 italic">No complaint</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-violet-50 flex items-center justify-between"
            style={{ background: "#faf5ff" }}>
            <p className="text-xs text-gray-400 font-semibold">
              Showing {filtered.length} of {ratings.length} reviews
            </p>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Average Rating</p>
                <p className="font-black text-amber-500">★ {avgRating} / 5</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Total Reviews</p>
                <p className="font-black text-violet-600">{totalRatings}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorFeedback