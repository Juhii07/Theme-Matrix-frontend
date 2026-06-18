import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

const IMG = "http://localhost:5000/uploads/"
const DOWNLOAD = "http://localhost:5000/uploads/"

const MyTemplate = () => {
  const [templates, setTemplates] = useState([]) // ✅ flat template list
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [downloading, setDownloading] = useState(null)

  const navigate = useNavigate()
  const H = { Authorization: `Bearer ${localStorage.getItem("userToken")}` }

  const getMyOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/user/my-orders", 
        { headers: H }
      )
      const orders = Array.isArray(res.data) ? res.data : []

      // ✅ Flatten all orders → individual templates
      const flat = []
      orders.forEach(order => {
        order.items?.forEach((item, i) => {
          flat.push({
            key: `${order._id}_${i}`,
            orderId: order._id,
            orderDate: order.createdAt,
            paymentId: order.paymentId,
            orderStatus: order.status,
            price: item.price,
            templateId: item.templateId?._id,
            designName: item.templateId?.designName,
            designThumbnail: item.templateId?.designThumbnail,
            designPackage: item.templateId?.designPackage,
            demoUrl: item.templateId?.demoUrl,
            designCategory: item.templateId?.designCategory,
            vendorName: item.templateId?.vendorId?.name,
            discountCode: order.discountCode,
            discountPercent: order.discountPercent,
            discountAmount: order.discountAmount,
            finalTotal: order.finalTotal,
          })
        })
      })

      setTemplates(flat)
    } catch (e) {
      console.log("Orders error:", e)
      if (e.response?.status === 401) navigate("/login")
    }
    setLoading(false)
  }

  useEffect(() => { getMyOrders() }, [])

  // ✅ Download package as blob
  const handleDownload = async (designPackage, designName, key) => {
    if (!designPackage) return alert("No file available for download")
    setDownloading(key)
    try {
      const url = `${DOWNLOAD}${designPackage}`
      const response = await fetch(url)
      if (!response.ok) throw new Error("File not found")
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = `${designName || "template"}.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
    } catch (e) {
      console.log("Download error:", e)
      alert("Download failed. File may not exist on server.")
    }
    setDownloading(null)
  }

  // ✅ Filter by search
  const filtered = templates.filter(t =>
    t.designName?.toLowerCase().includes(search.toLowerCase()) ||
    t.vendorName?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-gray-900">🎨 My Purchases</h2>
          <p className="text-gray-400 mt-1">
            {templates.length} template{templates.length !== 1 ? "s" : ""} purchased
          </p>
        </div>
        <Link to="/"
          className="text-sm font-bold text-violet-600 no-underline hover:text-violet-800 transition-colors">
          ← Browse More
        </Link>
      </div>

      {/* Search */}
      {!loading && templates.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 border border-violet-100 max-w-md"
            style={{ boxShadow: "0 2px 12px rgba(124,58,237,0.06)" }}>
            <span className="text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search your templates..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 outline-none text-gray-700 text-sm bg-transparent"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs font-bold text-red-400 hover:text-red-600"
                style={{ background: "none", border: "none", cursor: "pointer" }}>
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 animate-spin"
            style={{ borderColor: "#ede9fe", borderTopColor: "#a855f7" }} />
        </div>

      ) : templates.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-violet-100"
          style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-black text-gray-700 mb-2">No purchases yet</h3>
          <p className="text-gray-400 mb-6">Browse templates and make your first purchase!</p>
          <Link to="/"
            className="inline-block px-8 py-3 rounded-full font-bold text-white no-underline transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
            Browse Templates
          </Link>
        </div>

      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-violet-100">
          <div className="text-5xl mb-3">🔍</div>
          <h3 className="text-lg font-black text-gray-700 mb-1">No results found</h3>
          <p className="text-gray-400 text-sm">Try a different search term</p>
        </div>

      ) : (
        <div className="space-y-4">
          {filtered.map(t => (
            <div key={t.key}
              className="bg-white rounded-2xl border border-violet-100 overflow-hidden transition-all hover:shadow-lg hover:border-violet-200"
              style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>

              <div className="flex items-center gap-4 p-5">

                {/* ✅ Thumbnail */}
                <div className="w-20 h-14 rounded-xl overflow-hidden border border-violet-100 flex-shrink-0">
                  {t.designThumbnail
                    ? <img
                      src={`${IMG}${t.designThumbnail}`}
                      className="w-full h-full object-cover"
                      alt={t.designName}
                      onError={e => {
                        e.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f5f3ff;color:#7c3aed;font-weight:900;font-size:18px">${t.designName?.charAt(0)?.toUpperCase()}</div>`
                      }}
                    />
                    : <div className="w-full h-full flex items-center justify-center font-black text-xl bg-violet-50 text-violet-600">
                      {t.designName?.charAt(0)?.toUpperCase() || "T"}
                    </div>
                  }
                </div>

                {/* ✅ Template Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-black text-gray-800 truncate">
                        {t.designName || "Template"}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        by {t.vendorName || "Developer"}
                        {t.designCategory?.name && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold"
                            style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                            {t.designCategory.name}
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="font-black text-violet-700 text-lg flex-shrink-0">
                      ₹{(t.price || 0).toLocaleString("en-IN")}
                    </p>
                  </div>

                  {/* Order info row */}
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-xs text-gray-400">
                      📅 {new Date(t.orderDate).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric"
                      })}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#dcfce7", color: "#166534" }}>
                      ✅ {t.orderStatus}
                    </span>
                    {t.discountAmount > 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ background: "#fef3c7", color: "#92400e" }}>
                        🏷️ {t.discountCode} -{t.discountPercent}%
                      </span>
                    )}
                    {t.paymentId && (
                      <span className="text-xs font-mono px-2 py-0.5 rounded-lg hidden sm:inline"
                        style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                        {t.paymentId.slice(0, 18)}...
                      </span>
                    )}
                  </div>
                </div>

                {/* ✅ Action Buttons */}
                <div className="flex flex-col gap-2 flex-shrink-0">

                  {/* Download */}
                  <button
                    onClick={() => handleDownload(t.designPackage, t.designName, t.key)}
                    disabled={!t.designPackage || downloading === t.key}
                    className="px-4 py-2 rounded-xl text-xs font-black text-white transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-1"
                    style={{
                      background: "linear-gradient(135deg,#a855f7,#7c3aed)",
                      border: "none",
                      cursor: t.designPackage ? "pointer" : "not-allowed",
                      minWidth: "110px"
                    }}>
                    {downloading === t.key ? (
                      <>
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Downloading...
                      </>
                    ) : t.designPackage ? "⬇️ Download" : "⚠️ No File"}
                  </button>

                  {/* Demo + Rate row */}
                  <div className="flex gap-2">
                    {t.demoUrl && (
                      <a href={t.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 px-3 py-1.5 rounded-xl text-xs font-black no-underline text-center transition-all hover:scale-105"
                        style={{ background: "#eff6ff", color: "#1d4ed8" }}>
                        👁️ Demo
                      </a>
                    )}
                    {t.templateId && (
                      <Link
                        to={`/template/${t.templateId}`}
                        className="flex-1 px-3 py-1.5 rounded-xl text-xs font-black no-underline text-center transition-all hover:scale-105"
                        style={{ background: "#fef3c7", color: "#92400e" }}>
                        ⭐ Rate
                      </Link>
                    )}
                  </div>
                </div>

              </div>

              {/* ✅ Payment success bar at bottom */}
              {t.paymentId && (
                <div className="px-5 py-2.5 flex items-center gap-2 border-t border-violet-50"
                  style={{ background: "#f0fdf4" }}>
                  <span className="text-emerald-500 text-sm">✅</span>
                  <p className="text-xs text-emerald-600 font-semibold">Payment Successful</p>
                  <span className="text-xs text-emerald-400 font-mono ml-1">
                    · {t.paymentId}
                  </span>
                </div>
              )}

            </div>
          ))}
        </div>
      )}

    </div>
  )
}

export default MyTemplate