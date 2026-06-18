import { useState, useEffect } from "react"
import axios from "axios"

const itemsPerPage = 5

const ViewVendor = () => {
  const [vendors,     setVendors]     = useState([])
  const [selected,    setSelected]    = useState(null)
  const [activeTab,   setActiveTab]   = useState("info")
  const [loading,     setLoading]     = useState(true)
  const [toggling,    setToggling]    = useState(null)
  const [search,      setSearch]      = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const H = { Authorization: `Bearer ${localStorage.getItem("token")}` }

  // GET http://localhost:5000/adminapi/vendors
  const getVendors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/adminapi/vendors", { headers: H })
      setVendors(Array.isArray(res.data) ? res.data : [])
    } catch (e) { console.log(e) }
    setLoading(false)
  }

  // GET http://localhost:5000/adminapi/vendor/:id
  const viewSingleVendor = async (id) => {
    setActiveTab("info")
    try {
      const res = await axios.get(`http://localhost:5000/adminapi/vendor/${id}`, { headers: H })
      setSelected(res.data?.Vendor || res.data)
    } catch (e) {
      const fallback = vendors.find(v => v._id === id)
      setSelected(fallback)
    }
  }

  // POST http://localhost:5000/adminapi/toggleVendor  body: { id }
  const toggleVendorStatus = async (vendor) => {
    setToggling(vendor._id)
    try {
      await axios.post(
        "http://localhost:5000/adminapi/toggleVendor",
        { id: vendor._id },
        { headers: H }
      )
      setVendors(prev => prev.map(v =>
        v._id === vendor._id
          ? { ...v, status: v.status === "enable" ? "disable" : "enable" }
          : v
      ))
    } catch (e) { console.log(e) }
    setToggling(null)
  }

  useEffect(() => { getVendors() }, [])

  // Search Filter
  const filtered = vendors.filter(v =>
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase())
  )

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginated  = filtered.slice(startIndex, startIndex + itemsPerPage)

  const handleSearch = (e) => {
    setSearch(e.target.value)
    setCurrentPage(1)
  }

  const hasBankDetails = (v) => v?.bankDetails?.accountNumber

  const ToggleSwitch = ({ vendor }) => {
    const isOn = vendor.status === "enable"
    return (
      <button
        onClick={() => toggleVendorStatus(vendor)}
        disabled={toggling === vendor._id}
        title={isOn ? "Click to disable" : "Click to enable"}
        className="relative inline-flex items-center gap-2"
        style={{ background: "none", border: "none", cursor: "pointer" }}>
        <div
          className="w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0"
          style={{ background: isOn ? "linear-gradient(135deg,#10b981,#059669)" : "#d1d5db" }}>
          <div
            className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-300"
            style={{ left: isOn ? "22px" : "2px" }} />
        </div>
        {toggling === vendor._id
          ? <span className="w-3 h-3 border-2 border-gray-300 border-t-violet-600 rounded-full animate-spin" />
          : <span className="text-xs font-semibold"
              style={{ color: isOn ? "#15803d" : "#9ca3af" }}>
              {isOn ? "On" : "Off"}
            </span>}
      </button>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900">👥 Vendors</h2>
        <p className="text-sm text-gray-400 mt-1">{vendors.length} registered vendors</p>
      </div>

      {/* MODAL */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="h-1.5 w-full"
              style={{ background: "linear-gradient(90deg,#a855f7,#7c3aed)" }} />

            <div className="flex items-center justify-between px-6 py-4 border-b border-violet-50">
              <h3 className="font-black text-gray-900">👥 Vendor Details</h3>
              <button onClick={() => setSelected(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: "#9ca3af" }}>
                ×
              </button>
            </div>

            {/* Avatar + Name */}
            <div className="px-6 pt-5 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
                {selected.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 className="font-black text-gray-900 text-lg">{selected.name}</h3>
                <p className="text-sm text-gray-400">{selected.email}</p>
              </div>
              {hasBankDetails(selected) ? (
                <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "#dcfce7", color: "#15803d" }}>
                  🏦 Bank Added
                </span>
              ) : (
                <span className="ml-auto px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "#fef9c3", color: "#854d0e" }}>
                  ⚠️ No Bank
                </span>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-6 mt-4">
              {["info","bank"].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                  style={{
                    background: activeTab === tab ? "linear-gradient(135deg,#a855f7,#7c3aed)" : "#f5f3ff",
                    color:      activeTab === tab ? "#fff" : "#7c3aed",
                    border:     "none", cursor: "pointer"
                  }}>
                  {tab === "info" ? "👤 Vendor Info" : "🏦 Bank Details"}
                </button>
              ))}
            </div>

            <div className="p-6">

              {/* Tab 1 — Info */}
              {activeTab === "info" && (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["📞 Mobile",  selected.mobile   || "N/A"],
                    ["📍 Address", selected.address  || "N/A"],
                    ["📊 Status",  selected.status   || "N/A"],
                    ["📅 Joined",  selected.createdAt
                      ? new Date(selected.createdAt).toLocaleDateString("en-IN")
                      : "N/A"],
                  ].map(([l, v]) => (
                    <div key={l} className="rounded-xl p-3 bg-violet-50">
                      <p className="text-xs font-bold text-violet-500 mb-0.5">{l}</p>
                      <p className="text-sm font-semibold text-gray-700">{v}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 2 — Bank */}
              {activeTab === "bank" && (
                !hasBankDetails(selected) ? (
                  <div className="text-center py-8">
                    <p className="text-4xl mb-3">🏦</p>
                    <p className="font-bold text-gray-500">No bank details added yet</p>
                    <p className="text-xs text-gray-400 mt-1">Vendor has not submitted bank information</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["👤 Account Holder", selected.bankDetails?.accountHolder || "N/A"],
                      ["🏛️ Bank Name",      selected.bankDetails?.bankName      || "N/A"],
                      ["🔢 Account No",     selected.bankDetails?.accountNumber
                        ? `****${selected.bankDetails.accountNumber.slice(-4)}`
                        : "N/A"],
                      ["📋 IFSC Code",      selected.bankDetails?.ifscCode   || "N/A"],
                      ["📍 Branch",         selected.bankDetails?.branchName  || "N/A"],
                      ["📱 UPI ID",         selected.bankDetails?.upiId       || "N/A"],
                      ["🪪 PAN Card",       selected.bankDetails?.panCard     || "N/A"],
                    ].map(([l, v]) => (
                      <div key={l} className="rounded-xl p-3 bg-violet-50">
                        <p className="text-xs font-bold text-violet-500 mb-0.5">{l}</p>
                        <p className="text-sm font-semibold text-gray-700 break-all">{v}</p>
                      </div>
                    ))}
                  </div>
                )
              )}

              <button onClick={() => setSelected(null)}
                className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 mt-4"
                style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4">
        <input type="text" value={search} onChange={handleSearch}
          placeholder="🔍 Search by vendor name or email..."
          className="w-full px-4 py-3 rounded-xl text-sm outline-none bg-white border-2 border-violet-100 focus:border-violet-400"
          style={{ fontFamily: "inherit" }} />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl overflow-hidden border border-violet-100"
        style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
        <table className="w-full text-sm">
          <thead className="bg-violet-50/60">
            <tr>
              {["No.","Vendor","Email","Mobile","Status","Bank","Enable / Disable","Action"].map(h => (
                <th key={h}
                  className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-violet-500">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1,2,3].map(i => (
                <tr key={i}>
                  <td colSpan={8} className="px-5 py-4">
                    <div className="h-4 rounded-full animate-pulse bg-violet-50" />
                  </td>
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-14 text-gray-300">No vendors found</td>
              </tr>
            ) : (
              paginated.map((v, i) => {
                const isEnabled = v.status === "enable"
                const hasBank   = hasBankDetails(v)
                return (
                  <tr key={v._id}
                    className="border-t border-violet-50 hover:bg-violet-50/40 transition-colors">

                    <td className="px-5 py-3.5 text-gray-300 text-xs">{startIndex + i + 1}</td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white"
                          style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
                          {v.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">{v.name}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-gray-400 text-xs">{v.email}</td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{v.mobile || "—"}</td>

                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: isEnabled ? "#dcfce7" : "#fee2e2",
                          color:      isEnabled ? "#15803d"  : "#dc2626"
                        }}>
                        {isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: hasBank ? "#dcfce7" : "#fef9c3",
                          color:      hasBank ? "#15803d"  : "#854d0e"
                        }}>
                        {hasBank ? "🏦 Added" : "⚠️ Pending"}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <ToggleSwitch vendor={v} />
                    </td>

                    <td className="px-5 py-3.5">
                      <button onClick={() => viewSingleVendor(v._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
                        style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer" }}>
                        👁️ View
                      </button>
                    </td>

                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!loading && filtered.length > itemsPerPage && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filtered.length)} of {filtered.length} Vendors
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 text-xs font-semibold rounded-lg transition"
                  style={{
                    background: currentPage === page ? "#7c3aed" : "#f3f4f6",
                    color:      currentPage === page ? "#fff"     : "#4b5563"
                  }}>
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed">
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewVendor