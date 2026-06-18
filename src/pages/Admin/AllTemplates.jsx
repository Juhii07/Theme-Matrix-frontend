import { useState, useEffect } from "react"
import axios from "axios"

const IMG          = "http://localhost:5000/uploads/"
const itemsPerPage = 5

const AllTemplates = () => {
  const [templates,    setTemplates]    = useState([])
  const [modal,        setModal]        = useState(null)
  const [status,       setStatus]       = useState("approved")
  const [comment,      setComment]      = useState("")
  const [saving,       setSaving]       = useState(false)
  const [loading,      setLoading]      = useState(true)
  const [downloading,  setDownloading]  = useState(null)
  const [toggling,     setToggling]     = useState(null)
  const [search,       setSearch]       = useState("")
  const [currentPage,  setCurrentPage]  = useState(1)
  const [vendorFilter,   setVendorFilter]   = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter,   setStatusFilter]   = useState("all")

  const H = { Authorization: `Bearer ${localStorage.getItem("token")}` }

  const getTemplates = async () => {
    setLoading(true)
    try {
      const res = await axios.get("http://localhost:5000/adminapi/all-templates", { headers: H })
      setTemplates(Array.isArray(res.data) ? res.data : [])
    } catch (e) { console.log(e) }
    setLoading(false)
  }

  const updateStatus = async () => {
    setSaving(true)
    try {
      await axios.post(
        `http://localhost:5000/adminapi/template-status/${modal.id}`,
        { status, comment },
        { headers: H }
      )
      setModal(null)
      setComment("")
      setStatus("approved")
      getTemplates()
    } catch (e) { console.log(e) }
    setSaving(false)
  }

  const toggleEnable = async (t) => {
    setToggling(t._id)
    const currentEnabled = t.isEnabled === undefined ? true : t.isEnabled
    const newEnabled     = !currentEnabled
    try {
      await axios.patch(
        `http://localhost:5000/adminapi/template-toggle/${t._id}`,
        { isEnabled: newEnabled },
        { headers: H }
      )
      setTemplates(prev =>
        prev.map(x => x._id === t._id
          ? { ...x, isEnabled: newEnabled, designStatus: newEnabled ? "approved" : "disabled" }
          : x
        )
      )
    } catch (e) { console.log(e) }
    setToggling(null)
  }

  const openModal = (t, s) => {
    setModal({ id: t._id, name: t.designName })
    setStatus(s || t.designStatus)
    setComment(t.adminComment || "")
  }

  const downloadTemplate = async (packageFile, name, id) => {
    if (!packageFile) return alert("No package file available for this template")
    setDownloading(id)
    try {
      const url      = `${IMG}${packageFile}`
      const response = await fetch(url)
      if (!response.ok) throw new Error("File not found")
      const blob    = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a       = document.createElement("a")
      a.href        = blobUrl
      a.download    = `${name || "template"}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch (e) {
      alert("Download failed. File may not exist on server.")
    }
    setDownloading(null)
  }

  useEffect(() => { getTemplates() }, [])
  useEffect(() => { setCurrentPage(1) }, [search, vendorFilter, categoryFilter, statusFilter])

  // ── derive unique vendors and categories from loaded data ──────────────────
  const uniqueVendors = [...new Map(
    templates
      .filter(t => t.vendorId?._id && t.vendorId?.name)
      .map(t => [String(t.vendorId._id), { id: String(t.vendorId._id), name: t.vendorId.name }])
  ).values()]

  const uniqueCategories = [...new Map(
    templates
      .filter(t => t.designCategory?._id && t.designCategory?.name)
      .map(t => [String(t.designCategory._id), { id: String(t.designCategory._id), name: t.designCategory.name }])
  ).values()]

  // ── combined filter ──────────────────────────────────────────────────────────
  const filtered = templates.filter(t => {
    const matchSearch =
      t.designName?.toLowerCase().includes(search.toLowerCase()) ||
      t.vendorId?.name?.toLowerCase().includes(search.toLowerCase())

    const matchVendor =
      vendorFilter === "all" ||
      String(t.vendorId?._id) === vendorFilter

    const matchCategory =
      categoryFilter === "all" ||
      String(t.designCategory?._id) === categoryFilter

    const matchStatus =
      statusFilter === "all" || t.designStatus === statusFilter

    return matchSearch && matchVendor && matchCategory && matchStatus
  })

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginated  = filtered.slice(startIndex, startIndex + itemsPerPage)

  const clearFilters = () => {
    setSearch("")
    setVendorFilter("all")
    setCategoryFilter("all")
    setStatusFilter("all")
    setCurrentPage(1)
  }

  const hasActiveFilter =
    search !== "" ||
    vendorFilter !== "all" ||
    categoryFilter !== "all" ||
    statusFilter !== "all"

  const approved = templates.filter(t => t.designStatus === "approved").length
  const pending  = templates.filter(t => t.designStatus === "pending").length
  const rejected = templates.filter(t => t.designStatus === "rejected").length

  // ── Status Badge ──────────────────────────────────────────────────────────
  const Badge = ({ s }) => {
    const map = {
      approved: { bg: "#dcfce7", color: "#15803d", label: "Approved" },
      pending:  { bg: "#fef9c3", color: "#854d0e", label: "Pending"  },
      rejected: { bg: "#fee2e2", color: "#dc2626", label: "Rejected" },
      disabled: { bg: "#f3f4f6", color: "#6b7280", label: "Disabled" },
    }
    const style = map[s] || map.disabled
    return (
      <span style={{
        background: style.bg, color: style.color,
        padding: "4px 12px", borderRadius: "999px",
        fontSize: "11px", fontWeight: "700",
        whiteSpace: "nowrap",
      }}>
        {style.label}
      </span>
    )
  }

  // ── Toggle Switch ─────────────────────────────────────────────────────────
  const ToggleSwitch = ({ t }) => {
    const enabled = t.isEnabled === undefined ? true : t.isEnabled
    const busy    = toggling === t._id
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          onClick={() => toggleEnable(t)}
          disabled={busy}
          title={enabled ? "Click to Disable" : "Click to Enable"}
          style={{
            position: "relative", display: "inline-block",
            width: "44px", height: "24px", borderRadius: "999px",
            border: "none", cursor: busy ? "not-allowed" : "pointer",
            background: enabled ? "#22c55e" : "#d1d5db",
            transition: "background 0.3s", opacity: busy ? 0.6 : 1,
            padding: 0, flexShrink: 0,
          }}>
          <span style={{
            position: "absolute", top: "3px",
            left: enabled ? "22px" : "3px",
            width: "18px", height: "18px", borderRadius: "50%",
            background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
            transition: "left 0.3s", display: "block",
          }} />
        </button>
        <span style={{ fontSize: "11px", fontWeight: "600", color: enabled ? "#16a34a" : "#9ca3af" }}>
          {busy ? "..." : enabled ? "On" : "Off"}
        </span>
      </div>
    )
  }

  const selectStyle = {
    padding: "7px 12px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "600",
    border: "2px solid #ede9fe",
    outline: "none",
    background: "#fff",
    color: "#7c3aed",
    cursor: "pointer",
    fontFamily: "inherit",
  }

  // ── Approve SVG icon ──────────────────────────────────────────────────────
  const IconApprove = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )

  // ── Reject SVG icon ───────────────────────────────────────────────────────
  const IconReject = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )

  // ── Download SVG icon ─────────────────────────────────────────────────────
  const IconDownload = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )

  return (
    <div>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900">All Templates</h2>
        <p className="text-sm text-gray-400 mt-1">
          {templates.length} total · {pending} pending
          {hasActiveFilter && (
            <span className="ml-2 font-semibold" style={{ color: "#7c3aed" }}>
              · {filtered.length} filtered
            </span>
          )}
        </p>
      </div>

      {/* Stats — clickable to filter by status */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          ["Approved", approved, "from-emerald-500 to-green-600",  "approved"],
          ["Pending",  pending,  "from-amber-400 to-orange-500",   "pending" ],
          ["Rejected", rejected, "from-red-500 to-rose-600",       "rejected"],
        ].map(([l, v, bg, val]) => (
          <div key={l}
            className={"rounded-2xl p-5 bg-gradient-to-br " + bg + " text-white cursor-pointer transition-all hover:scale-[1.02]"}
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
            onClick={() => setStatusFilter(statusFilter === val ? "all" : val)}>
            <p className="font-black text-4xl leading-none mb-1">{v}</p>
            <p className="text-sm font-semibold text-white/80 flex items-center gap-2">
              {l}
              {statusFilter === val && (
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Active</span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Status Update Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="h-1.5 w-full"
              style={{ background: status === "approved" ? "linear-gradient(90deg,#10b981,#059669)" : "linear-gradient(90deg,#ef4444,#dc2626)" }} />
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-black text-gray-900">Update Template Status</h3>
              <button onClick={() => setModal(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: "#9ca3af" }}>
                x
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="px-4 py-3 rounded-xl" style={{ background: "#faf5ff" }}>
                <p className="text-xs font-bold text-violet-500 mb-0.5">Template</p>
                <p className="font-bold text-gray-800">{modal.name}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border-2 border-transparent focus:border-violet-400"
                  style={{ background: "#faf5ff", fontFamily: "inherit" }}>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                  <option value="pending">Keep Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Comment for Vendor
                </label>
                <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Write feedback for the vendor..."
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none resize-none border-2 border-transparent focus:border-violet-400"
                  style={{ background: "#faf5ff", fontFamily: "inherit" }} />
              </div>
              <div className="flex gap-3">
                <button onClick={updateStatus} disabled={saving}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-60"
                  style={{
                    background: status === "approved"
                      ? "linear-gradient(135deg,#10b981,#059669)"
                      : "linear-gradient(135deg,#ef4444,#dc2626)",
                    border: "none", cursor: "pointer",
                  }}>
                  {saving ? "Updating..." : "Update Status"}
                </button>
                <button onClick={() => setModal(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-violet-600"
                  style={{ background: "#faf5ff", border: "none", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FILTER PANEL ── */}
      <div className="bg-white rounded-2xl border border-violet-100 p-4 mb-5"
        style={{ boxShadow: "0 2px 8px rgba(109,40,217,0.06)" }}>

        {/* Search row */}
        <div className="flex flex-wrap gap-3 items-center mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-[200px] px-4 py-2.5 rounded-xl bg-white"
            style={{ border: "2px solid #ede9fe" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search template name or vendor..."
              className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
              style={{ fontFamily: "inherit" }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: "16px", lineHeight: 1 }}>
                x
              </button>
            )}
          </div>

          {hasActiveFilter && (
            <button onClick={clearFilters}
              style={{
                background: "#fee2e2", color: "#dc2626",
                border: "none", cursor: "pointer",
                padding: "9px 16px", borderRadius: "10px",
                fontSize: "12px", fontWeight: "700", whiteSpace: "nowrap",
              }}>
              Clear All Filters
            </button>
          )}
        </div>

        {/* Dropdown row */}
        <div className="flex flex-wrap gap-3 items-center">

          {/* Status */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</span>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              style={{
                ...selectStyle,
                borderColor: statusFilter !== "all" ? "#a855f7" : "#ede9fe",
                background:  statusFilter !== "all" ? "#faf5ff"  : "#fff",
              }}>
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          {/* Vendor */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vendor</span>
            <select value={vendorFilter} onChange={e => setVendorFilter(e.target.value)}
              style={{
                ...selectStyle,
                borderColor: vendorFilter !== "all" ? "#a855f7" : "#ede9fe",
                background:  vendorFilter !== "all" ? "#faf5ff"  : "#fff",
                maxWidth: "180px",
              }}>
              <option value="all">All Vendors ({uniqueVendors.length})</option>
              {uniqueVendors.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</span>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
              style={{
                ...selectStyle,
                borderColor: categoryFilter !== "all" ? "#a855f7" : "#ede9fe",
                background:  categoryFilter !== "all" ? "#faf5ff"  : "#fff",
                maxWidth: "200px",
              }}>
              <option value="all">All Categories ({uniqueCategories.length})</option>
              {uniqueCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Active filter pills */}
          {hasActiveFilter && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginLeft: "auto" }}>
              {vendorFilter !== "all" && (
                <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "999px", background: "#faf5ff", color: "#7c3aed", border: "1.5px solid #e9d5ff", fontSize: "11px", fontWeight: "700" }}>
                  Vendor: {uniqueVendors.find(v => v.id === vendorFilter)?.name}
                  <button onClick={() => setVendorFilter("all")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#a855f7", padding: 0, fontSize: "14px", lineHeight: 1 }}>x</button>
                </span>
              )}
              {categoryFilter !== "all" && (
                <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "999px", background: "#faf5ff", color: "#7c3aed", border: "1.5px solid #e9d5ff", fontSize: "11px", fontWeight: "700" }}>
                  Category: {uniqueCategories.find(c => c.id === categoryFilter)?.name}
                  <button onClick={() => setCategoryFilter("all")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#a855f7", padding: 0, fontSize: "14px", lineHeight: 1 }}>x</button>
                </span>
              )}
              {statusFilter !== "all" && (
                <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "999px", background: "#faf5ff", color: "#7c3aed", border: "1.5px solid #e9d5ff", fontSize: "11px", fontWeight: "700" }}>
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter("all")}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#a855f7", padding: 0, fontSize: "14px", lineHeight: 1 }}>x</button>
                </span>
              )}
            </div>
          )}
        </div>

        {hasActiveFilter && (
          <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-violet-50">
            Showing <strong style={{ color: "#7c3aed" }}>{filtered.length}</strong> of{" "}
            <strong style={{ color: "#374151" }}>{templates.length}</strong> templates
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-violet-100"
        style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-violet-50/60">
              <tr>
                {["No.","Thumb","Template","Vendor","Category","Price","Status","Enable / Disable","Comment","Actions"].map(h => (
                  <th key={h}
                    className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-violet-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>
                    <td colSpan={10} className="px-4 py-4">
                      <div className="h-4 rounded-full animate-pulse bg-violet-50" />
                    </td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-16">
                    <p className="text-gray-300 font-semibold text-sm">No templates match your filters</p>
                    {hasActiveFilter && (
                      <button onClick={clearFilters}
                        className="mt-3 text-xs font-bold text-violet-600 hover:underline"
                        style={{ background: "none", border: "none", cursor: "pointer" }}>
                        Clear all filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginated.map((t, i) => (
                  <tr key={t._id}
                    className="border-t border-violet-50 hover:bg-violet-50/40 transition-colors">

                    {/* No */}
                    <td className="px-4 py-3.5 text-gray-300 text-xs">{startIndex + i + 1}</td>

                    {/* Thumb */}
                    <td className="px-4 py-3.5">
                      <div className="w-12 h-9 rounded-lg overflow-hidden border border-violet-100">
                        {t.designThumbnail
                          ? <img src={`${IMG}${t.designThumbnail}`} className="w-full h-full object-cover"
                              onError={e => { e.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f5f3ff;color:#7c3aed;font-weight:900;font-size:11px">${t.designName?.charAt(0)?.toUpperCase()}</div>` }} />
                          : <div className="w-full h-full flex items-center justify-center font-black text-xs bg-violet-50 text-violet-600">
                              {t.designName?.charAt(0)?.toUpperCase()}
                            </div>}
                      </div>
                    </td>

                    {/* Name */}
                    <td className="px-4 py-3.5 font-semibold text-gray-800 text-xs" style={{ maxWidth: "130px" }}>
                      <p className="truncate" title={t.designName}>{t.designName}</p>
                    </td>

                    {/* Vendor — click to filter */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => setVendorFilter(
                          vendorFilter === String(t.vendorId?._id) ? "all" : String(t.vendorId?._id)
                        )}
                        title="Filter by this vendor"
                        style={{
                          background:   vendorFilter === String(t.vendorId?._id) ? "#faf5ff" : "transparent",
                          border:       vendorFilter === String(t.vendorId?._id) ? "1.5px solid #e9d5ff" : "none",
                          cursor:       "pointer",
                          padding:      "3px 8px",
                          borderRadius: "8px",
                          color:        vendorFilter === String(t.vendorId?._id) ? "#7c3aed" : "#6b7280",
                          fontWeight:   "600",
                          fontSize:     "12px",
                          whiteSpace:   "nowrap",
                        }}>
                        {t.vendorId?.name || "—"}
                      </button>
                    </td>

                    {/* Category — click to filter */}
                    <td className="px-4 py-3.5">
                      {t.designCategory?.name ? (
                        <button
                          onClick={() => {
                            const cid = String(t.designCategory._id)
                            setCategoryFilter(categoryFilter === cid ? "all" : cid)
                          }}
                          title="Filter by this category"
                          style={{
                            background:   categoryFilter === String(t.designCategory._id) ? "#7c3aed" : "#f5f3ff",
                            color:        categoryFilter === String(t.designCategory._id) ? "#fff"    : "#7c3aed",
                            border:       "none",
                            cursor:       "pointer",
                            padding:      "4px 10px",
                            borderRadius: "999px",
                            fontWeight:   "700",
                            fontSize:     "11px",
                            whiteSpace:   "nowrap",
                          }}>
                          {t.designCategory.name}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300 italic">—</span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3.5 font-bold text-gray-800 text-xs whitespace-nowrap">
                      Rs.{t.regularPrice}
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <Badge s={t.designStatus} />
                    </td>

                    {/* Toggle */}
                    <td className="px-4 py-3.5">
                      <ToggleSwitch t={t} />
                    </td>

                    {/* Comment */}
                    <td className="px-4 py-3.5" style={{ maxWidth: "140px" }}>
                      {t.adminComment && t.adminComment.trim() !== ""
                        ? <span className="text-xs text-gray-600 px-2 py-1 rounded-lg block truncate"
                            style={{ background: "#faf5ff" }}
                            title={t.adminComment}>
                            {t.adminComment}
                          </span>
                        : <span className="text-xs text-gray-300 italic">—</span>}
                    </td>

                    {/* ── Actions with SVG icon buttons ── */}
                    <td className="px-4 py-3.5">
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>

                        {/* Approve button */}
                        <button
                          disabled={t.designStatus === "approved"}
                          onClick={() => openModal(t, "approved")}
                          title="Approve template"
                          style={{
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                            width:          "30px",
                            height:         "30px",
                            borderRadius:   "8px",
                            border:         "none",
                            cursor:         t.designStatus === "approved" ? "not-allowed" : "pointer",
                            background:     t.designStatus === "approved"
                              ? "#d1fae5"
                              : "linear-gradient(135deg,#10b981,#059669)",
                            color:          t.designStatus === "approved" ? "#6ee7b7" : "#fff",
                            opacity:        t.designStatus === "approved" ? 0.5 : 1,
                            transition:     "transform 0.15s",
                            flexShrink:     0,
                          }}
                          onMouseEnter={e => { if (t.designStatus !== "approved") e.currentTarget.style.transform = "scale(1.1)" }}
                          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)" }}>
                          <IconApprove />
                        </button>

                        {/* Reject button */}
                        <button
                          disabled={t.designStatus === "rejected"}
                          onClick={() => openModal(t, "rejected")}
                          title="Reject template"
                          style={{
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                            width:          "30px",
                            height:         "30px",
                            borderRadius:   "8px",
                            border:         "none",
                            cursor:         t.designStatus === "rejected" ? "not-allowed" : "pointer",
                            background:     t.designStatus === "rejected"
                              ? "#fee2e2"
                              : "linear-gradient(135deg,#ef4444,#dc2626)",
                            color:          t.designStatus === "rejected" ? "#fca5a5" : "#fff",
                            opacity:        t.designStatus === "rejected" ? 0.5 : 1,
                            transition:     "transform 0.15s",
                            flexShrink:     0,
                          }}
                          onMouseEnter={e => { if (t.designStatus !== "rejected") e.currentTarget.style.transform = "scale(1.1)" }}
                          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)" }}>
                          <IconReject />
                        </button>

                        {/* Download button */}
                        <button
                          disabled={!t.designPackage || downloading === t._id}
                          onClick={() => downloadTemplate(t.designPackage, t.designName, t._id)}
                          title={t.designPackage ? "Download package file" : "No package available"}
                          style={{
                            display:        "flex",
                            alignItems:     "center",
                            justifyContent: "center",
                            width:          "30px",
                            height:         "30px",
                            borderRadius:   "8px",
                            border:         "none",
                            cursor:         !t.designPackage ? "not-allowed" : "pointer",
                            background:     !t.designPackage
                              ? "#ede9fe"
                              : "linear-gradient(135deg,#a855f7,#7c3aed)",
                            color:          !t.designPackage ? "#c4b5fd" : "#fff",
                            opacity:        !t.designPackage ? 0.5 : 1,
                            transition:     "transform 0.15s",
                            flexShrink:     0,
                          }}
                          onMouseEnter={e => { if (t.designPackage) e.currentTarget.style.transform = "scale(1.1)" }}
                          onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)" }}>
                          {downloading === t._id
                            ? <span style={{ width: "12px", height: "12px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                            : <IconDownload />}
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > itemsPerPage && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} templates
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
                Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page}
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 text-xs font-semibold rounded-lg transition"
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
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
                Next
              </button>
            </div>
          </div>
        )}

        {!loading && filtered.length > 0 && filtered.length <= itemsPerPage && (
          <div className="px-5 py-3 border-t border-violet-50" style={{ background: "#faf5ff" }}>
            <p className="text-xs text-gray-400 font-semibold">
              Showing {filtered.length} of {templates.length} templates
            </p>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default AllTemplates