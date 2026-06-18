import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"

const BASE     = "http://localhost:5000"
const IMG      = `${BASE}/uploads/`
const DOWNLOAD = `${BASE}/uploads/`

const UserEditProfile = () => {
  const userId   = localStorage.getItem("userId")
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState("profile") // "profile" | "orders"

  // Profile fields
  const [name,    setName]    = useState("")
  const [email,   setEmail]   = useState("")
  const [mobile,  setMobile]  = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Password modal
  const [pwdModal,    setPwdModal]    = useState(false)
  const [currentPwd,  setCurrentPwd]  = useState("")
  const [newPwd,      setNewPwd]      = useState("")
  const [confirmPwd,  setConfirmPwd]  = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew,     setShowNew]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pwdLoading,  setPwdLoading]  = useState(false)
  const [pwdSuccess,  setPwdSuccess]  = useState(false)
  const [pwdError,    setPwdError]    = useState("")

  // Orders
  const [orders,        setOrders]        = useState([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [expanded,      setExpanded]      = useState(null)

  const H = { Authorization: `Bearer ${localStorage.getItem("userToken")}` }

  // ✅ FIX 1: Corrected endpoint from /userapi/me → /api/user/me
  const getUserData = async () => {
    try {
      const res  = await axios.get(`${BASE}/api/user/me`, { headers: H })
      const user = res.data.user || res.data
      setName(user.name   || "")
      setEmail(user.email  || "")
      setMobile(user.mobile || "")
    } catch (e) {
      console.warn("Profile fetch failed:", e?.response?.status)
      // Fallback to localStorage
      setName(localStorage.getItem("userName") || "")
    }
  }

  const getMyOrders = async () => {
    try {
      const res = await axios.get(`${BASE}/api/user/my-orders`, { headers: H })
      setOrders(Array.isArray(res.data) ? res.data : [])
    } catch (e) {
      console.log("Orders error:", e)
      if (e.response?.status === 401) navigate("/login")
    }
    setOrdersLoading(false)
  }

  useEffect(() => {
    getUserData()
    getMyOrders()
  }, [])

  // ✅ FIX 2: After update, call getUserData() to refresh displayed data
  const updateUser = async () => {
    if (!name || !email || !mobile) return alert("Fill all fields")
    setLoading(true)
    setSuccess(false)
    try {
      await axios.put(
        `${BASE}/api/user/update/${userId}`,
        { name, email, mobile },
        { headers: H }
      )
      localStorage.setItem("userName", name)
      setSuccess(true)
      await getUserData() // ✅ refresh latest data from server
    } catch (e) {
      alert(e?.response?.data?.message || "Update failed")
    }
    setLoading(false)
  }

  const changePassword = async () => {
    setPwdError("")
    if (!currentPwd || !newPwd || !confirmPwd) return setPwdError("Fill all fields")
    if (newPwd !== confirmPwd)                 return setPwdError("New passwords do not match")
    if (newPwd.length < 6)                     return setPwdError("Password must be at least 6 characters")
    setPwdLoading(true)
    setPwdSuccess(false)
    try {
      await axios.post(
        `${BASE}/api/user/change-password/${userId}`,
        { currentPassword: currentPwd, newPassword: newPwd },
        { headers: H }
      )
      setPwdSuccess(true)
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("")
      setTimeout(() => { setPwdModal(false); setPwdSuccess(false) }, 1500)
    } catch (e) {
      setPwdError(e?.response?.data?.message || "Password change failed")
    }
    setPwdLoading(false)
  }

  const closePwdModal = () => {
    setPwdModal(false)
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("")
    setPwdError(""); setPwdSuccess(false)
  }

  const handleDownload = (designPackage, designName) => {
    if (!designPackage) return alert("No file available for download")
    const link    = document.createElement("a")
    link.href     = `${DOWNLOAD}${designPackage}`
    link.download = `${designName || "template"}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const toggleExpand = (id) =>
    setExpanded(prev => prev === id ? null : id)

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="px-6 py-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Account</h1>
          <p className="text-gray-400 text-sm mt-0.5">Manage your profile and orders</p>
        </div>

        {/* Tab Bar */}
        <div className="inline-flex items-center gap-1 mb-7 p-1 rounded-2xl"
          style={{ background: "#f3e8ff" }}>
          {["profile", "orders"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="font-black text-sm transition-all"
              style={{
                padding:      "0.55rem 1.4rem",
                borderRadius: "9999px",
                border:       "none",
                cursor:       "pointer",
                background:   activeTab === tab
                                ? "linear-gradient(135deg,#a855f7,#7c3aed)"
                                : "transparent",
                color:        activeTab === tab ? "#fff" : "#6b7280",
              }}>
              {tab === "profile" ? "✏️ Edit Profile" : "📦 My Orders"}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════
            TAB: PROFILE
        ════════════════════════════════════════ */}
        {activeTab === "profile" && (
          <>
            {/* Password Modal */}
            {pwdModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={closePwdModal}>
                <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                  onClick={e => e.stopPropagation()}>

                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                        style={{ background: "#eff6ff" }}>🔒</div>
                      <div>
                        <h3 className="font-black text-gray-900 text-sm">Change Password</h3>
                        <p className="text-xs text-gray-400">Keep your account secure</p>
                      </div>
                    </div>
                    <button onClick={closePwdModal}
                      style={{ background:"none", border:"none", cursor:"pointer", fontSize:"20px", color:"#9ca3af" }}>
                      ×
                    </button>
                  </div>

                  <div className="p-6 space-y-4">
                    {pwdSuccess && (
                      <div className="text-xs font-semibold px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                        ✅ Password changed successfully!
                      </div>
                    )}
                    {pwdError && (
                      <div className="text-xs font-semibold px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
                        ❌ {pwdError}
                      </div>
                    )}

                    {[
                      { label:"Current Password",     val:currentPwd,  set:setCurrentPwd,  show:showCurrent, setShow:setShowCurrent },
                      { label:"New Password",          val:newPwd,      set:setNewPwd,      show:showNew,     setShow:setShowNew     },
                      { label:"Confirm New Password",  val:confirmPwd,  set:setConfirmPwd,  show:showConfirm, setShow:setShowConfirm },
                    ].map(({ label, val, set, show, setShow }) => (
                      <div key={label}>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                          {label}
                        </label>
                        <div className="relative">
                          <input
                            type={show ? "text" : "password"}
                            value={val}
                            onChange={e => set(e.target.value)}
                            placeholder={`Enter ${label.toLowerCase()}`}
                            className="w-full px-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white pr-16"
                            style={{ fontFamily:"inherit" }}
                          />
                          <button onClick={() => setShow(p => !p)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-violet-500"
                            style={{ background:"none", border:"none", cursor:"pointer" }}>
                            {show ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-3 pt-1">
                      <button onClick={changePassword} disabled={pwdLoading}
                        className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 disabled:opacity-60"
                        style={{ background:"linear-gradient(135deg,#a855f7,#7c3aed)", border:"none", cursor:"pointer" }}>
                        {pwdLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Updating...
                          </span>
                        ) : "Update Password"}
                      </button>
                      <button onClick={closePwdModal}
                        className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                        style={{ border:"none", cursor:"pointer" }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Layout */}
            <div className="grid lg:grid-cols-3 gap-6">

              {/* LEFT — Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl overflow-hidden border border-violet-100"
                  style={{ boxShadow:"0 2px 16px rgba(109,40,217,0.06)" }}>

                  <div className="flex flex-col items-center py-8 px-6"
                    style={{ background:"linear-gradient(135deg,#f5f3ff,#ede9fe)" }}>
                    <div className="w-20 h-20 rounded-full flex items-center justify-center font-black text-3xl text-white mb-3"
                      style={{ background:"linear-gradient(135deg,#a855f7,#7c3aed)" }}>
                      {name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                    <h3 className="font-black text-gray-900 text-lg">{name || "User"}</h3>
                    <p className="text-xs text-gray-400 mb-3">{email || "—"}</p>
                    <span className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background:"#dcfce7", color:"#15803d" }}>
                      ● ACTIVE
                    </span>
                  </div>

                  <div className="px-6 py-4 space-y-3 border-t border-violet-50">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>📞</span><span>{mobile || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>📧</span><span>{email || "—"}</span>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <button
                      className="w-full py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
                      style={{ background:"linear-gradient(135deg,#a855f7,#7c3aed)", border:"none", cursor:"pointer" }}
                      onClick={() => document.getElementById("userEditForm")
                        .scrollIntoView({ behavior:"smooth" })}>
                      ✏️ Edit Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT — Form + Security */}
              <div className="lg:col-span-2 space-y-5">

                <div id="userEditForm" className="bg-white rounded-2xl border border-violet-100"
                  style={{ boxShadow:"0 2px 16px rgba(109,40,217,0.06)" }}>
                  <div className="px-6 py-4 border-b border-violet-50">
                    <h3 className="font-black text-gray-900">👤 User Information</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Your registered account details</p>
                  </div>
                  <div className="p-6 space-y-4">

                    {success && (
                      <div className="text-xs font-semibold px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                        ✅ Profile updated successfully!
                      </div>
                    )}

                    {[
                      { label:"Full Name",      icon:"👤", val:name,   set:setName,   type:"text",  placeholder:"Your full name"      },
                      { label:"Email Address",  icon:"📧", val:email,  set:setEmail,  type:"email", placeholder:"you@email.com"        },
                      { label:"Phone Number",   icon:"📞", val:mobile, set:setMobile, type:"text",  placeholder:"+91 98765 43210"      },
                    ].map(({ label, icon, val, set, type, placeholder }) => (
                      <div key={label}>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                          {label}
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
                          <input type={type} value={val} onChange={e => set(e.target.value)}
                            placeholder={placeholder}
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white"
                            style={{ fontFamily:"inherit" }} />
                        </div>
                      </div>
                    ))}

                    <button onClick={updateUser} disabled={loading}
                      className="w-full font-black rounded-xl py-3 text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background:"linear-gradient(135deg,#a855f7,#7c3aed)", border:"none", cursor:"pointer", boxShadow:"0 4px 16px rgba(168,85,247,0.35)" }}>
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving...
                        </span>
                      ) : "💾 Save Changes"}
                    </button>
                  </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-2xl border border-violet-100"
                  style={{ boxShadow:"0 2px 16px rgba(109,40,217,0.06)" }}>
                  <div className="px-6 py-4 border-b border-violet-50">
                    <h3 className="font-black text-gray-900">🔐 Security</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Manage your account security</p>
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
                        style={{ background:"#f3f4f6" }}>🔒</div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Password</p>
                        <p className="text-xs text-gray-400">Keep your account secure</p>
                      </div>
                    </div>
                    <button onClick={() => setPwdModal(true)}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-violet-600 transition-all hover:bg-violet-50"
                      style={{ border:"none", cursor:"pointer", background:"none" }}>
                      Update
                    </button>
                  </div>
                </div>

              </div>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════
            TAB: MY ORDERS
        ════════════════════════════════════════ */}
        {activeTab === "orders" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-black text-gray-900">📦 My Orders</h2>
              <p className="text-gray-400 text-sm mt-1">
                {orders.length} order{orders.length !== 1 ? "s" : ""} placed
              </p>
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 rounded-full border-4 animate-spin"
                  style={{ borderColor:"#ede9fe", borderTopColor:"#a855f7" }} />
              </div>

            ) : orders.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-violet-100"
                style={{ boxShadow:"0 2px 16px rgba(109,40,217,0.06)" }}>
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-black text-gray-700 mb-2">No orders yet</h3>
                <p className="text-gray-400 mb-6">Browse templates and make your first purchase!</p>
                <Link to="/"
                  className="inline-block px-8 py-3 rounded-full font-bold text-white no-underline transition-all hover:scale-105"
                  style={{ background:"linear-gradient(135deg,#a855f7,#7c3aed)" }}>
                  Browse Templates
                </Link>
              </div>

            ) : (
              <div className="space-y-5">
                {orders.map(order => (
                  <div key={order._id}
                    className="bg-white rounded-2xl border border-violet-100 overflow-hidden"
                    style={{ boxShadow:"0 2px 16px rgba(109,40,217,0.06)" }}>

                    {/* Order Header */}
                    <div
                      className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-violet-50/40 transition-colors"
                      onClick={() => toggleExpand(order._id)}>

                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0"
                          style={{ background:"linear-gradient(135deg,#a855f7,#7c3aed)", color:"#fff" }}>
                          📦
                        </div>
                        <div>
                          <p className="font-black text-gray-800 text-sm">
                            Order #{String(order._id).slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day:"numeric", month:"long", year:"numeric"
                            })}
                            {" · "}{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {order.paymentId && (
                          <div className="hidden md:block px-2.5 py-1 rounded-lg text-xs font-mono"
                            style={{ background:"#f3e8ff", color:"#7c3aed" }}>
                            {order.paymentId.slice(0, 16)}...
                          </div>
                        )}
                        <div className="text-right">
                          <p className="font-black text-violet-700">
                            ₹{order.finalTotal?.toLocaleString("en-IN")}
                          </p>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background:"#dcfce7", color:"#166534" }}>
                            ✅ {order.status}
                          </span>
                        </div>
                        <span className="text-gray-400 text-sm ml-1">
                          {expanded === order._id ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {expanded === order._id && (
                      <div className="border-t border-violet-50">

                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead style={{ background:"#faf5ff" }}>
                              <tr>
                                {["#","Template","Price","Download","Rate"].map(h => (
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

                                  <td className="px-5 py-3.5 text-gray-300 text-xs">{i + 1}</td>

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
                                        <p className="text-xs text-gray-400">Digital · Lifetime Access</p>
                                      </div>
                                    </div>
                                  </td>

                                  <td className="px-5 py-3.5 font-black text-violet-700 whitespace-nowrap">
                                    ₹{(item.price || 0).toLocaleString("en-IN")}
                                  </td>

                                  <td className="px-5 py-3.5">
                                    {item.templateId?.designPackage ? (
                                      <button
                                        onClick={() => handleDownload(
                                          item.templateId.designPackage,
                                          item.templateId.designName
                                        )}
                                        className="px-3 py-1.5 rounded-xl text-xs font-black text-white transition-all hover:scale-105 flex items-center gap-1"
                                        style={{ background:"linear-gradient(135deg,#a855f7,#7c3aed)", border:"none", cursor:"pointer" }}>
                                        ⬇️ Download
                                      </button>
                                    ) : (
                                      <span className="text-xs text-gray-300 font-semibold">Not available</span>
                                    )}
                                  </td>

                                  <td className="px-5 py-3.5">
                                    {item.templateId?._id ? (
                                      <Link
                                        to={`/template/${item.templateId._id}`}
                                        className="px-3 py-1.5 rounded-xl text-xs font-black no-underline transition-all hover:scale-105 inline-block"
                                        style={{ background:"#fef3c7", color:"#92400e" }}>
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

                        {/* Order Summary */}
                        <div className="px-5 py-4 border-t border-violet-50">
                          <div className="rounded-xl p-4 space-y-2" style={{ background:"#faf5ff" }}>
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>Subtotal</span>
                              <span>₹{order.subtotal?.toLocaleString("en-IN")}</span>
                            </div>
                            {order.discountAmount > 0 && (
                              <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                                <span>Discount ({order.discountCode} · {order.discountPercent}%)</span>
                                <span>-₹{order.discountAmount?.toLocaleString("en-IN")}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-black text-gray-900 pt-2 border-t border-violet-100">
                              <span>Total Paid</span>
                              <span className="text-violet-700">₹{order.finalTotal?.toLocaleString("en-IN")}</span>
                            </div>
                          </div>

                          {order.paymentId && (
                            <div className="mt-3 px-4 py-2.5 rounded-xl flex items-center gap-2"
                              style={{ background:"#f0fdf4", border:"1px solid #bbf7d0" }}>
                              <span className="text-emerald-600 text-lg">✅</span>
                              <div>
                                <p className="text-xs font-bold text-emerald-700">Payment Successful</p>
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
        )}

      </div>
    </div>
  )
}

export default UserEditProfile