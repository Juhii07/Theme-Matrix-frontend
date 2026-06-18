import { useState, useEffect, useRef } from "react"
import axios from "axios"

const UPLOADS = "http://localhost:5000/uploads/"

const AdminPayments = () => {
  const [payments,  setPayments]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null)
  const [note,      setNote]      = useState("")
  const [file,      setFile]      = useState(null)
  const [sending,   setSending]   = useState(false)
  const [success,   setSuccess]   = useState("")
  const [search,    setSearch]    = useState("")
  const [filter,    setFilter]    = useState("all")
  const [viewModal, setViewModal] = useState(null)
  const fileRef = useRef()

  const H = { Authorization: `Bearer ${localStorage.getItem("token")}` }

  const getPayments = async () => {
    setLoading(true)
    try {
      const res = await axios.get("http://localhost:5000/adminapi/payments", { headers: H })
      console.log("Payments:", res.data)
      let data = []
      if (Array.isArray(res.data))              data = res.data
      else if (Array.isArray(res.data.data))    data = res.data.data
      else if (Array.isArray(res.data.payments)) data = res.data.payments
      setPayments(data)
    } catch (e) { console.log(e) }
    setLoading(false)
  }

  useEffect(() => { getPayments() }, [])

  const sendReceipt = async () => {
    if (!modal) return
    setSending(true)
    try {
      const fd = new FormData()
      fd.append("note", note)
      if (file) fd.append("receipt", file)
      await axios.post(
        `http://localhost:5000/adminapi/payments/${modal._id}/send-receipt`,
        fd,
        { headers: { ...H, "Content-Type": "multipart/form-data" } }
      )
      setSuccess("✅ Receipt sent to vendor successfully!")
      setModal(null)
      setNote("")
      setFile(null)
      getPayments()
      setTimeout(() => setSuccess(""), 4000)
    } catch (e) { console.log(e) }
    setSending(false)
  }

  const filtered = payments.filter(p => {
    const matchFilter = filter === "all" ? true : p.status === filter
    const matchSearch =
      p.vendorId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
      String(p._id).includes(search)
    return matchFilter && matchSearch
  })

  const totalRevenue   = payments.reduce((s, p) => s + (p.totalAmount || 0), 0)
  const totalAdminShare  = payments.reduce((s, p) => s + (p.adminShare  || 0), 0)
  const totalVendorShare = payments.reduce((s, p) => s + (p.vendorShare || 0), 0)
  const pendingCount   = payments.filter(p => p.status === "pending").length

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900">💰 Payments</h2>
        <p className="text-sm text-gray-400 mt-1">Admin 30% · Vendor 70% revenue split</p>
      </div>

      {success && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold">
          {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          ["💰 Total Revenue",    `₹${totalRevenue.toLocaleString("en-IN")}`,   "from-violet-500 to-purple-600"],
          ["🏦 Admin Share (30%)", `₹${totalAdminShare.toLocaleString("en-IN")}`, "from-blue-500 to-indigo-600"],
          ["👥 Vendor Share (70%)",`₹${totalVendorShare.toLocaleString("en-IN")}`,"from-emerald-500 to-green-600"],
          ["⏳ Pending",           pendingCount,                                  "from-amber-400 to-orange-500"],
        ].map(([label, value, bg]) => (
          <div key={label} className={`rounded-2xl p-5 bg-gradient-to-br ${bg} text-white`}
            style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}>
            <p className="font-black text-2xl leading-none mb-1">{value}</p>
            <p className="text-xs font-semibold text-white/80">{label}</p>
          </div>
        ))}
      </div>

      {/* ✅ View User Receipt Modal */}
      {viewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setViewModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg,#a855f7,#7c3aed)" }} />
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-black text-gray-900">🧾 User Payment Receipt</h3>
                <p className="text-xs text-gray-400 mt-0.5">Receipt auto-generated on payment</p>
              </div>
              <button onClick={() => setViewModal(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: "#9ca3af" }}>×</button>
            </div>
            <div className="p-6 space-y-3">
              <div className="rounded-xl p-4 space-y-2" style={{ background: "#faf5ff" }}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Receipt No</span>
                  <span className="font-bold text-violet-600">{viewModal.userReceiptNumber || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Customer</span>
                  <span className="font-bold text-gray-800">{viewModal.userId?.name || "—"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Template</span>
                  <span className="font-bold text-gray-800">{viewModal.templateId?.designName || "—"}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-violet-100 pt-2">
                  <span className="text-gray-500">Amount Paid</span>
                  <span className="font-black text-violet-700">₹{viewModal.totalAmount?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Admin Share (30%)</span>
                  <span className="font-bold text-blue-600">₹{viewModal.adminShare?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Vendor Share (70%)</span>
                  <span className="font-bold text-emerald-600">₹{viewModal.vendorShare?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="font-bold text-gray-600">
                    {new Date(viewModal.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>

              {viewModal.userReceiptFile && (
                <a href={UPLOADS + viewModal.userReceiptFile} target="_blank" rel="noreferrer"
                  className="w-full py-3 rounded-xl font-bold text-white text-sm no-underline flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                  style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
                  📄 Download User Receipt PDF
                </a>
              )}

              <button
                onClick={() => { setViewModal(null); setModal(viewModal); setNote("") }}
                className="w-full py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                style={{ border: "none", cursor: "pointer" }}>
                📨 Send Receipt to Vendor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Send Receipt to Vendor Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="h-1.5 w-full" style={{ background: "linear-gradient(90deg,#a855f7,#7c3aed)" }} />
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-black text-gray-900">📨 Send Receipt to Vendor</h3>
                <p className="text-xs text-gray-400 mt-0.5">{modal.vendorId?.name}</p>
              </div>
              <button onClick={() => setModal(null)}
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: "#9ca3af" }}>×</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl p-4 space-y-2" style={{ background: "#faf5ff" }}>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Order Total</span>
                  <span className="font-bold text-gray-800">₹{modal.totalAmount?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Admin Share (30%)</span>
                  <span className="font-bold text-blue-600">₹{modal.adminShare?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-violet-100 pt-2">
                  <span className="text-gray-500">Vendor Share (70%)</span>
                  <span className="font-black text-emerald-600">₹{modal.vendorShare?.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Note to Vendor</label>
                <textarea value={note} onChange={e => setNote(e.target.value)}
                  placeholder="e.g. Payment for March sales..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white resize-none"
                  style={{ fontFamily: "inherit" }} />
              </div>

              <div className="flex gap-3">
                <button onClick={sendReceipt} disabled={sending}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer" }}>
                  {sending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Generating & Sending...
                    </span>
                  ) : "📨 Generate & Send Receipt"}
                </button>
                <button onClick={() => setModal(null)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200"
                  style={{ border: "none", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <input type="text" placeholder="🔍 Search vendor or user..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl text-sm outline-none border-2 border-violet-100 focus:border-violet-400 bg-white"
          style={{ fontFamily: "inherit", minWidth: "220px" }} />
        {["all", "pending", "paid"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize"
            style={{
              background: filter === f ? "linear-gradient(135deg,#a855f7,#7c3aed)" : "#f5f3ff",
              color: filter === f ? "#fff" : "#7c3aed",
              border: "none", cursor: "pointer"
            }}>
            {f === "all" ? "All" : f === "pending" ? "⏳ Pending" : "✅ Paid"}
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
                {["No.", "Order", "Vendor", "User", "Total", "Admin 30%", "Vendor 70%", "Status", "User Receipt", "Action"].map(h => (
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
                    <td colSpan={10} className="px-4 py-4">
                      <div className="h-4 rounded-full animate-pulse bg-violet-50" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-14">
                    <p className="text-4xl mb-3">💳</p>
                    <p className="font-semibold text-gray-400">No payments found</p>
                    <p className="text-xs text-gray-300 mt-1">Payments appear automatically after users purchase templates</p>
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => (
                  <tr key={p._id} className="border-t border-violet-50 hover:bg-violet-50/30 transition-colors">
                    <td className="px-4 py-3.5 text-gray-300 text-xs">{i + 1}</td>
                    <td className="px-4 py-3.5 text-xs font-mono text-gray-500">
                      #{String(p._id).slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                          style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
                          {(p.vendorId?.name || "V").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-xs">{p.vendorId?.name || "—"}</p>
                          <p className="text-xs text-gray-400">{p.vendorId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600 font-semibold">{p.userId?.name || "—"}</td>
                    <td className="px-4 py-3.5 font-black text-gray-800 text-xs">₹{p.totalAmount?.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3.5 font-bold text-blue-600 text-xs">₹{p.adminShare?.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600 text-xs">₹{p.vendorShare?.toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{
                          background: p.status === "paid" ? "#dcfce7" : "#fef9c3",
                          color:      p.status === "paid" ? "#15803d" : "#854d0e"
                        }}>
                        {p.status === "paid" ? "✅ Paid" : "⏳ Pending"}
                      </span>
                    </td>

                    {/* ✅ View user receipt */}
                    <td className="px-4 py-3.5">
                      {p.userReceiptFile ? (
                        <button onClick={() => setViewModal(p)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
                          style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", border: "none", cursor: "pointer" }}>
                          👁️ View
                        </button>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>

                    {/* ✅ Send to vendor */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => { setModal(p); setNote(p.receiptNote || "") }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:scale-105"
                        style={{
                          background: p.status === "paid"
                            ? "linear-gradient(135deg,#10b981,#059669)"
                            : "linear-gradient(135deg,#a855f7,#7c3aed)",
                          border: "none", cursor: "pointer"
                        }}>
                        {p.status === "paid" ? "🔄 Resend" : "📨 Send"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminPayments