import { useState, useEffect } from "react"
import axios from "axios"

const IMG          = "http://localhost:5000/uploads/"
const ITEMS_PER_PAGE = 5

const AdminFeedback = () => {
  const [ratings,        setRatings]        = useState([])
  const [loading,        setLoading]        = useState(true)
  const [search,         setSearch]         = useState("")
  const [filter,         setFilter]         = useState("all")
  const [success,        setSuccess]        = useState("")
  const [currentPage,    setCurrentPage]    = useState(1)
  const [complaintModal, setComplaintModal] = useState(null)
  const [resolveModal,   setResolveModal]   = useState(null)
  const [resolveMsg,     setResolveMsg]     = useState("")
  const [resolving,      setResolving]      = useState(false)

  const H = { Authorization: `Bearer ${localStorage.getItem("token")}` }

  const getFeedback = async () => {
    setLoading(true)
    try {
      const res = await axios.get("http://localhost:5000/adminapi/feedback", { headers: H })
      let data = []
      if (Array.isArray(res.data))           data = res.data
      else if (Array.isArray(res.data.data)) data = res.data.data
      setRatings(data)
    } catch (e) { console.log(e) }
    setLoading(false)
  }

  useEffect(() => { getFeedback() }, [])

  // reset page when filter/search changes
  useEffect(() => { setCurrentPage(1) }, [search, filter])

  const showMsg = (msg) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(""), 3000)
  }

  const toggleVisibility = async (id) => {
    try {
      const res = await axios.put(
        "http://localhost:5000/adminapi/feedback/" + id + "/toggle-visibility",
        {}, { headers: H }
      )
      showMsg(res.data.message)
      getFeedback()
    } catch (e) { console.log(e) }
  }

  const resolveComplaint = async () => {
    if (!resolveModal) return
    setResolving(true)
    try {
      await axios.put(
        "http://localhost:5000/adminapi/feedback/" + resolveModal._id + "/resolve-complaint",
        { vendorMessage: resolveMsg },
        { headers: H }
      )
      showMsg("Complaint resolved!")
      setResolveModal(null)
      setResolveMsg("")
      getFeedback()
    } catch (e) { console.log(e) }
    setResolving(false)
  }

  const toggleTemplate = async (templateId) => {
    try {
      const res = await axios.put(
        "http://localhost:5000/adminapi/feedback/template/" + templateId + "/toggle",
        {}, { headers: H }
      )
      showMsg(res.data.message)
      getFeedback()
    } catch (e) { console.log(e) }
  }

  const deleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return
    try {
      await axios.delete("http://localhost:5000/adminapi/feedback/" + id, { headers: H })
      showMsg("Review deleted!")
      getFeedback()
    } catch (e) { console.log(e) }
  }

  // ── Filter ──
  const filtered = ratings.filter(r => {
    const matchSearch =
      r.templateId?.designName?.toLowerCase().includes(search.toLowerCase()) ||
      r.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.review?.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === "all"        ? true :
      filter === "complaints" ? r.complaint && r.complaint !== "" :
      filter === "hidden"     ? !r.isVisible :
      filter === "visible"    ? r.isVisible : true
    return matchSearch && matchFilter
  })

  // ── Pagination ──
  const totalPages  = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const startIndex  = (currentPage - 1) * ITEMS_PER_PAGE
  const paginated   = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const totalRatings = ratings.length
  const complaints   = ratings.filter(r => r.complaint && r.complaint !== "").length
  const hidden       = ratings.filter(r => !r.isVisible).length
  const avgRating    = ratings.length
    ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
    : "0.0"

  const StarDisplay = ({ value }) => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= value ? "#f59e0b" : "#d1d5db", fontSize: "14px" }}>
          ★
        </span>
      ))}
    </div>
  )

  return (
    <div>

      {/* ── Complaint View Modal ── */}
      {complaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
          onClick={() => setComplaintModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg,#fff1f2,#fee2e2)" }}>
              <div>
                <h3 className="font-black text-gray-900">Full Complaint</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  From: {complaintModal.userId?.name || "—"} on {complaintModal.templateId?.designName || "—"}
                </p>
              </div>
              <button onClick={() => setComplaintModal(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: "#9ca3af" }}>
                x
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <StarDisplay value={complaintModal.rating} />
                <span className="text-sm font-bold text-gray-600">{complaintModal.rating}/5</span>
              </div>
              <div className="rounded-xl p-4 border border-red-100" style={{ background: "#fff5f5" }}>
                <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-2">Complaint</p>
                <p className="text-sm text-red-700 leading-relaxed">{complaintModal.complaint}</p>
              </div>
              {complaintModal.review && (
                <div className="rounded-xl p-4 border border-violet-100" style={{ background: "#faf5ff" }}>
                  <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-2">Review</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{complaintModal.review}</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status:</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: complaintModal.complaintStatus === "resolved" ? "#dcfce7" : "#fee2e2",
                    color:      complaintModal.complaintStatus === "resolved" ? "#15803d" : "#dc2626",
                  }}>
                  {complaintModal.complaintStatus === "resolved" ? "Resolved" : "Open"}
                </span>
              </div>
              <div className="flex gap-3 pt-1">
                {complaintModal.complaintStatus !== "resolved" && (
                  <button
                    onClick={() => { setComplaintModal(null); setResolveModal(complaintModal) }}
                    className="flex-1 py-2.5 rounded-xl font-black text-white text-sm"
                    style={{ background: "linear-gradient(135deg,#10b981,#059669)", border: "none", cursor: "pointer" }}>
                    Resolve Complaint
                  </button>
                )}
                <button onClick={() => setComplaintModal(null)}
                  className="flex-1 py-2.5 rounded-xl font-black text-sm text-gray-600 bg-gray-100"
                  style={{ border: "none", cursor: "pointer" }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Resolve Complaint Modal ── */}
      {resolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(2px)" }}
          onClick={() => { setResolveModal(null); setResolveMsg("") }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)" }}>
              <div>
                <h3 className="font-black text-gray-900">Resolve Complaint</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Template: {resolveModal.templateId?.designName || "—"}
                </p>
              </div>
              <button onClick={() => { setResolveModal(null); setResolveMsg("") }}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: "#9ca3af" }}>
                x
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl p-4 border border-red-100" style={{ background: "#fff5f5" }}>
                <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Complaint</p>
                <p className="text-sm text-red-700 leading-relaxed">{resolveModal.complaint}</p>
              </div>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "#faf5ff", border: "1px solid #ede9fe" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
                  {(resolveModal.templateId?.vendorId?.name || "V").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-700">Message will be sent to vendor:</p>
                  <p className="text-xs text-violet-600 font-semibold">
                    {resolveModal.templateId?.vendorId?.name || "Vendor"}
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Message to Vendor (optional)
                </label>
                <textarea
                  value={resolveMsg}
                  onChange={e => setResolveMsg(e.target.value)}
                  placeholder="e.g. We have reviewed the complaint and taken necessary action."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white resize-none"
                  style={{ fontFamily: "inherit" }}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={resolveComplaint} disabled={resolving}
                  className="flex-1 py-3 rounded-xl font-black text-white text-sm disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#10b981,#059669)", border: "none", cursor: resolving ? "not-allowed" : "pointer" }}>
                  {resolving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resolving...
                    </span>
                  ) : "Resolve and Notify Vendor"}
                </button>
                <button onClick={() => { setResolveModal(null); setResolveMsg("") }}
                  className="flex-1 py-3 rounded-xl font-black text-sm text-gray-600 bg-gray-100"
                  style={{ border: "none", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900">Feedback and Reviews</h2>
        <p className="text-sm text-gray-400 mt-1">Manage ratings, reviews and template visibility</p>
      </div>

      {success && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
          {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          ["Total Reviews",  totalRatings, "linear-gradient(135deg,#a855f7,#7c3aed)"],
          ["Avg Rating",     avgRating,    "linear-gradient(135deg,#f59e0b,#d97706)"],
          ["Complaints",     complaints,   "linear-gradient(135deg,#ef4444,#dc2626)"],
          ["Hidden Reviews", hidden,       "linear-gradient(135deg,#6b7280,#4b5563)"],
        ].map(([label, value, bg]) => (
          <div key={label} className="rounded-2xl p-4 text-white"
            style={{ background: bg, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
            <p className="font-black text-2xl leading-none mb-1">{value}</p>
            <p className="text-xs font-semibold text-white/80">{label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <input type="text" placeholder="Search template, user, review..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl text-sm outline-none border-2 border-violet-100 focus:border-violet-400 bg-white"
          style={{ fontFamily: "inherit", minWidth: "240px" }} />
        {["all","complaints","hidden","visible"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-xs font-bold capitalize"
            style={{
              background: filter === f ? "linear-gradient(135deg,#a855f7,#7c3aed)" : "#f5f3ff",
              color:      filter === f ? "#fff" : "#7c3aed",
              border: "none", cursor: "pointer",
            }}>
            {f === "all" ? "All" : f === "complaints" ? "Complaints" : f === "hidden" ? "Hidden" : "Visible"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-violet-100"
        style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-violet-50/60">
              <tr>
                {["No.","Template","User","Rating","Review","Complaint","Status","Template Status","Actions"].map(h => (
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
                    <td colSpan={9} className="px-4 py-4">
                      <div className="h-4 rounded-full animate-pulse bg-violet-50" />
                    </td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-14">
                    <p className="text-gray-400 font-semibold">No feedback found</p>
                  </td>
                </tr>
              ) : (
                paginated.map((r, i) => (
                  <tr key={r._id} className="border-t border-violet-50 hover:bg-violet-50/30 transition-colors">

                    <td className="px-4 py-3.5 text-gray-300 text-xs">
                      {startIndex + i + 1}
                    </td>

                    {/* Template */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {r.templateId?.designThumbnail ? (
                          <img src={IMG + r.templateId.designThumbnail}
                            className="w-9 h-7 rounded-lg object-cover border border-violet-100" alt="" />
                        ) : (
                          <div className="w-9 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                            style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
                            {r.templateId?.designName?.charAt(0) || "T"}
                          </div>
                        )}
                        <span className="font-bold text-gray-800 text-xs truncate" style={{ maxWidth: "100px" }}>
                          {r.templateId?.designName || "—"}
                        </span>
                      </div>
                    </td>

                    {/* User */}
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-700 text-xs">{r.userId?.name || "—"}</p>
                      <p className="text-xs text-gray-400">{r.userId?.email || ""}</p>
                    </td>

                    {/* Rating */}
                    <td className="px-4 py-3.5">
                      <StarDisplay value={r.rating} />
                      <span className="text-xs text-gray-400 mt-0.5 block">{r.rating}/5</span>
                    </td>

                    {/* Review */}
                    <td className="px-4 py-3.5" style={{ maxWidth: "140px" }}>
                      {r.review ? (
                        <p className="text-xs text-gray-600"
                          style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
                          title={r.review}>
                          {r.review}
                        </p>
                      ) : (
                        <span className="text-xs text-gray-300 italic">No review</span>
                      )}
                      <p className="text-xs text-gray-300 mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </td>

                    {/* Complaint */}
                    <td className="px-4 py-3.5" style={{ maxWidth: "140px" }}>
                      {r.complaint ? (
                        <div className="space-y-1">
                          <p className="text-xs text-red-600 font-semibold"
                            style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                            {r.complaint}
                          </p>
                          <button onClick={() => setComplaintModal(r)}
                            style={{ background: "#fff1f2", color: "#dc2626", border: "1px solid #fecaca", cursor: "pointer", padding: "3px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "900", whiteSpace: "nowrap" }}>
                            View full
                          </button>
                          <div>
                            <span className="text-xs px-2 py-0.5 rounded-full inline-block"
                              style={{
                                background: r.complaintStatus === "resolved" ? "#dcfce7" : "#fee2e2",
                                color:      r.complaintStatus === "resolved" ? "#15803d" : "#dc2626",
                              }}>
                              {r.complaintStatus === "resolved" ? "Resolved" : "Open"}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 italic">None</span>
                      )}
                    </td>

                    {/* Visibility status */}
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: r.isVisible ? "#dcfce7" : "#f3f4f6",
                          color:      r.isVisible ? "#15803d" : "#6b7280",
                        }}>
                        {r.isVisible ? "Visible" : "Hidden"}
                      </span>
                    </td>

                    {/* Template status */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: r.templateId?.designStatus === "approved" ? "#dcfce7" : "#fee2e2",
                            color:      r.templateId?.designStatus === "approved" ? "#15803d" : "#dc2626",
                          }}>
                          {r.templateId?.designStatus === "approved" ? "Enabled" : "Disabled"}
                        </span>
                        {r.templateId?._id && (
                          <button onClick={() => toggleTemplate(r.templateId._id)}
                            style={{
                              background: r.templateId?.designStatus === "approved"
                                ? "linear-gradient(135deg,#ef4444,#dc2626)"
                                : "linear-gradient(135deg,#10b981,#059669)",
                              color: "#fff", border: "none", cursor: "pointer",
                              padding: "4px 10px", borderRadius: "8px", fontSize: "11px", fontWeight: "900", whiteSpace: "nowrap",
                            }}>
                            {r.templateId?.designStatus === "approved" ? "Disable" : "Enable"}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => toggleVisibility(r._id)}
                          style={{
                            background: r.isVisible ? "linear-gradient(135deg,#6b7280,#4b5563)" : "linear-gradient(135deg,#3b82f6,#1d4ed8)",
                            color: "#fff", border: "none", cursor: "pointer",
                            padding: "6px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: "900", whiteSpace: "nowrap",
                          }}>
                          {r.isVisible ? "Hide" : "Show"}
                        </button>
                        {r.complaint && r.complaintStatus !== "resolved" && (
                          <button onClick={() => setResolveModal(r)}
                            style={{
                              background: "linear-gradient(135deg,#10b981,#059669)",
                              color: "#fff", border: "none", cursor: "pointer",
                              padding: "6px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: "900", whiteSpace: "nowrap",
                            }}>
                            Resolve
                          </button>
                        )}
                        <button onClick={() => deleteReview(r._id)}
                          style={{
                            background: "linear-gradient(135deg,#ef4444,#dc2626)",
                            color: "#fff", border: "none", cursor: "pointer",
                            padding: "6px 10px", borderRadius: "10px", fontSize: "11px", fontWeight: "900",
                          }}>
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ── */}
        {!loading && filtered.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-violet-50">
            <p className="text-xs text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of {filtered.length} reviews
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg disabled:opacity-40">
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page}
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 text-xs font-semibold rounded-lg"
                  style={{
                    background: currentPage === page ? "#7c3aed" : "#f3f4f6",
                    color:      currentPage === page ? "#fff"    : "#4b5563",
                  }}>
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg disabled:opacity-40">
                Next
              </button>
            </div>
          </div>
        )}

        {!loading && filtered.length > 0 && filtered.length <= ITEMS_PER_PAGE && (
          <div className="px-5 py-3 border-t border-violet-50" style={{ background: "#faf5ff" }}>
            <p className="text-xs text-gray-400 font-semibold">
              Showing {filtered.length} of {ratings.length} reviews
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminFeedback