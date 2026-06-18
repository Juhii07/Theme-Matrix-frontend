import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

const IMG      = "http://localhost:5000/uploads/"
const DOWNLOAD = "http://localhost:5000/uploads/"

const MyOrders = () => {
  const [orders,   setOrders]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)

  const navigate = useNavigate()
  const H = { Authorization: `Bearer ${localStorage.getItem("userToken")}` }

  const getMyOrders = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/user/my-orders",
        { headers: H }
      )
      setOrders(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      console.log("Orders error:", e)
      if (e.response?.status === 401) navigate("/login")
    }
    setLoading(false)
  }

  useEffect(() => { getMyOrders() }, [])

  const toggleExpand = (id) =>
    setExpanded(prev => prev === id ? null : id)

  // ✅ Download zip file
  const handleDownload = (designPackage, designName) => {
    if (!designPackage) return alert("No file available for download")
    const url  = `${DOWNLOAD}${designPackage}`
    const link = document.createElement("a")
    link.href     = url
    link.download = `${designName || "template"}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900">📦 My Orders</h2>
        <p className="text-gray-400 mt-1">
          {orders.length} order{orders.length !== 1 ? "s" : ""} placed
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 animate-spin"
            style={{ borderColor: "#ede9fe", borderTopColor: "#a855f7" }} />
        </div>

      ) : orders.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-violet-100"
          style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-black text-gray-700 mb-2">No orders yet</h3>
          <p className="text-gray-400 mb-6">Browse templates and make your first purchase!</p>
          <Link to="/"
            className="inline-block px-8 py-3 rounded-full font-bold text-white no-underline transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
            Browse Templates
          </Link>
        </div>

      ) : (
        <div className="space-y-5">
          {orders.map(order => (
            <div key={order._id}
              className="bg-white rounded-2xl border border-violet-100 overflow-hidden"
              style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>

              {/* ─── Order Header ─── */}
              <div
                className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-violet-50/40 transition-colors"
                onClick={() => toggleExpand(order._id)}>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff" }}>
                    📦
                  </div>
                  <div>
                    <p className="font-black text-gray-800 text-sm">
                      Order #{String(order._id).slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                      {" · "}{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {order.paymentId && (
                    <div className="hidden md:block px-2.5 py-1 rounded-lg text-xs font-mono"
                      style={{ background: "#f3e8ff", color: "#7c3aed" }}>
                      {order.paymentId.slice(0, 16)}...
                    </div>
                  )}
                  <div className="text-right">
                    <p className="font-black text-violet-700">
                      ₹{order.finalTotal?.toLocaleString("en-IN")}
                    </p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#dcfce7", color: "#166534" }}>
                      ✅ {order.status}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm ml-1">
                    {expanded === order._id ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* ─── Expanded: Table + Summary ─── */}
              {expanded === order._id && (
                <div className="border-t border-violet-50">

                  {/* ✅ TABLE */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead style={{ background: "#faf5ff" }}>
                        <tr>
                          {["#", "Template", "Price", "Download", "Rate"].map(h => (
                            <th key={h}
                              className="px-5 py-3 text-left text-xs font-bold text-violet-500 uppercase tracking-widest whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {order.items?.map((item, i) => (
                          <tr key={i}
                            className="border-t border-violet-50 hover:bg-violet-50/30 transition-colors">

                            {/* # */}
                            <td className="px-5 py-3.5 text-gray-300 text-xs">
                              {i + 1}
                            </td>

                            {/* Template */}
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-9 rounded-lg overflow-hidden border border-violet-100 flex-shrink-0">
                                  {item.templateId?.designThumbnail
                                    ? <img
                                        src={`${IMG}${item.templateId.designThumbnail}`}
                                        className="w-full h-full object-cover"
                                        alt={item.templateId?.designName}
                                      />
                                    : <div className="w-full h-full flex items-center justify-center font-black bg-violet-50 text-violet-600 text-sm">
                                        {item.templateId?.designName?.charAt(0)?.toUpperCase() || "T"}
                                      </div>
                                  }
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-gray-800 text-sm truncate max-w-[180px]">
                                    {item.templateId?.designName || "Template"}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Digital · Lifetime Access
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="px-5 py-3.5 font-black text-violet-700 whitespace-nowrap">
                              ₹{(item.price || 0).toLocaleString("en-IN")}
                            </td>

                            {/* ✅ Download zip */}
                            <td className="px-5 py-3.5">
                              {item.templateId?.designPackage ? (
                                <button
                                  onClick={() => handleDownload(
                                    item.templateId.designPackage,
                                    item.templateId.designName
                                  )}
                                  className="px-3 py-1.5 rounded-xl text-xs font-black text-white transition-all hover:scale-105 flex items-center gap-1"
                                  style={{
                                    background: "linear-gradient(135deg,#a855f7,#7c3aed)",
                                    border: "none",
                                    cursor: "pointer"
                                  }}>
                                  ⬇️ Download
                                </button>
                              ) : (
                                <span className="text-xs text-gray-300 font-semibold">
                                  Not available
                                </span>
                              )}
                            </td>

                            {/* ✅ Rate */}
                            <td className="px-5 py-3.5">
                              {item.templateId?._id ? (
                                <Link
                                  to={`/template/${item.templateId._id}`}
                                  className="px-3 py-1.5 rounded-xl text-xs font-black no-underline transition-all hover:scale-105 inline-block"
                                  style={{ background: "#fef3c7", color: "#92400e" }}>
                                  ⭐ Rate
                                </Link>
                              ) : (
                                <span className="text-xs text-gray-300">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ─── Order Summary ─── */}
                  <div className="px-5 py-4 border-t border-violet-50">
                    <div className="rounded-xl p-4 space-y-2"
                      style={{ background: "#faf5ff" }}>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Subtotal</span>
                        <span>₹{order.subtotal?.toLocaleString("en-IN")}</span>
                      </div>
                      {order.discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                          <span>
                            Discount ({order.discountCode} · {order.discountPercent}%)
                          </span>
                          <span>-₹{order.discountAmount?.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-black text-gray-900 pt-2 border-t border-violet-100">
                        <span>Total Paid</span>
                        <span className="text-violet-700">
                          ₹{order.finalTotal?.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* ✅ Payment ID */}
                    {order.paymentId && (
                      <div className="mt-3 px-4 py-2.5 rounded-xl flex items-center gap-2"
                        style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                        <span className="text-emerald-600 text-lg">✅</span>
                        <div>
                          <p className="text-xs font-bold text-emerald-700">
                            Payment Successful
                          </p>
                          <p className="text-xs text-emerald-500 font-mono mt-0.5">
                            Payment ID: {order.paymentId}
                          </p>
                          {order.razorpayOrderId && (
                            <p className="text-xs text-emerald-400 font-mono">
                              Order ID: {order.razorpayOrderId}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyOrders