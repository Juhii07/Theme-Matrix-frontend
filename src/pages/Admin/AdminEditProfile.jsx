import { useState, useEffect } from "react"
import axios from "axios"

const AdminEditProfile = () => {
  const adminId = localStorage.getItem("adminId")
  const [name,        setName]        = useState("")
  const [email,       setEmail]       = useState("")
  const [mobile,      setMobile]      = useState("")
  const [loading,     setLoading]     = useState(false)
  const [success,     setSuccess]     = useState(false)

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

  const H = { Authorization: `Bearer ${localStorage.getItem("token")}` }

  const getAdminData = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/adminapi/me`,
        { headers: H }
      )
      const admin = res.data.admin || res.data
      setName(admin.name   || "")
      setEmail(admin.email  || "")
      setMobile(admin.mobile || "")
    } catch (e) {
      setName(localStorage.getItem("adminName") || "")
    }
  }

  useEffect(() => { getAdminData() }, [])

  const updateAdmin = async () => {
    if (!name || !email || !mobile) return alert("Fill all fields")
    setLoading(true); setSuccess(false)
    try {
      const res = await axios.post(
        `http://localhost:5000/adminapi/update/${adminId}`,
        { name, email, mobile },
        { headers: H }
      )
      console.log("Admin Updated:", res.data)
      localStorage.setItem("adminName", name)
      setSuccess(true)
    } catch (e) { console.log(e); alert("Update failed") }
    setLoading(false)
  }

  const changePassword = async () => {
    setPwdError("")
    if (!currentPwd || !newPwd || !confirmPwd) return setPwdError("Fill all fields")
    if (newPwd !== confirmPwd) return setPwdError("New passwords do not match")
    if (newPwd.length < 6) return setPwdError("Password must be at least 6 characters")
    setPwdLoading(true); setPwdSuccess(false)
    try {
      await axios.post(
        `http://localhost:5000/adminapi/change-password/${adminId}`,
        { currentPassword: currentPwd, newPassword: newPwd },
        { headers: H }
      )
      setPwdSuccess(true)
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("")
      setTimeout(() => { setPwdModal(false); setPwdSuccess(false) }, 1500)
    } catch (e) {
      console.log(e)
      setPwdError(e?.response?.data?.message || "Password change failed")
    }
    setPwdLoading(false)
  }

  const closePwdModal = () => {
    setPwdModal(false)
    setCurrentPwd(""); setNewPwd(""); setConfirmPwd("")
    setPwdError(""); setPwdSuccess(false)
  }

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-xl font-black text-gray-900 tracking-tight">✏️ Edit Profile</h2>
        <p className="text-sm text-gray-400 mt-0.5">Update your admin account details</p>
      </div>

      {/* ── Change Password Modal ── */}
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
                style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#9ca3af" }}>
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

              {/* Current Password */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPwd}
                    onChange={e => setCurrentPwd(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-blue-400 focus:bg-white pr-16"
                    style={{ fontFamily: "inherit" }}
                  />
                  <button onClick={() => setShowCurrent(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-500"
                    style={{ background: "none", border: "none", cursor: "pointer" }}>
                    {showCurrent ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPwd}
                    onChange={e => setNewPwd(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-blue-400 focus:bg-white pr-16"
                    style={{ fontFamily: "inherit" }}
                  />
                  <button onClick={() => setShowNew(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-500"
                    style={{ background: "none", border: "none", cursor: "pointer" }}>
                    {showNew ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPwd}
                    onChange={e => setConfirmPwd(e.target.value)}
                    placeholder="Enter confirm new password"
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-blue-400 focus:bg-white pr-16"
                    style={{ fontFamily: "inherit" }}
                  />
                  <button onClick={() => setShowConfirm(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-500"
                    style={{ background: "none", border: "none", cursor: "pointer" }}>
                    {showConfirm ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={changePassword} disabled={pwdLoading}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all hover:scale-105 disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", border: "none", cursor: "pointer" }}>
                  {pwdLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </span>
                  ) : "Update Password"}
                </button>
                <button onClick={closePwdModal}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
                  style={{ border: "none", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT — Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl overflow-hidden border border-violet-100"
            style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>

            {/* Avatar */}
            <div className="flex flex-col items-center py-8 px-6"
              style={{ background: "linear-gradient(135deg,#f5f3ff,#ede9fe)" }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center font-black text-3xl text-white mb-3"
                style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
                {name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <h3 className="font-black text-gray-900 text-lg">{name || "Administrator"}</h3>
              <p className="text-xs text-gray-400 mb-3">{email || "—"}</p>
              <span className="px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "#dcfce7", color: "#15803d" }}>
                ● ACTIVE
              </span>
            </div>

            {/* Contact Info */}
            <div className="px-6 py-4 space-y-3 border-t border-violet-50">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>📞</span>
                <span>{mobile || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>📧</span>
                <span>{email || "—"}</span>
              </div>
            </div>

            {/* ✅ Only Edit Profile button — Change Password REMOVED from here */}
            <div className="px-6 pb-6">
              <button
                className="w-full py-2.5 rounded-xl font-bold text-white text-sm transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer" }}
                onClick={() => document.getElementById("editForm").scrollIntoView({ behavior: "smooth" })}>
                ✏️ Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — Form + Security */}
        <div className="lg:col-span-2 space-y-5">

          {/* Admin Information Form */}
          <div id="editForm" className="bg-white rounded-2xl border border-violet-100"
            style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
            <div className="px-6 py-4 border-b border-violet-50">
              <h3 className="font-black text-gray-900">👤 Admin Information</h3>
              <p className="text-xs text-gray-400 mt-0.5">Your registered admin details</p>
            </div>
            <div className="p-6 space-y-4">

              {success && (
                <div className="text-xs font-semibold px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                  ✅ Profile updated successfully!
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Administrator name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white"
                    style={{ fontFamily: "inherit" }} />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="admin@themematrix.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white"
                    style={{ fontFamily: "inherit" }} />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📞</span>
                  <input type="text" value={mobile} onChange={e => setMobile(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white"
                    style={{ fontFamily: "inherit" }} />
                </div>
              </div>

              <button onClick={updateAdmin} disabled={loading}
                className="w-full font-black rounded-xl py-3 text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(168,85,247,0.35)" }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : "💾 Save Changes"}
              </button>
            </div>
          </div>

          {/* ✅ Security Section — Change Password only here */}
          <div className="bg-white rounded-2xl border border-violet-100"
            style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
            <div className="px-6 py-4 border-b border-violet-50">
              <h3 className="font-black text-gray-900">🔐 Security</h3>
              <p className="text-xs text-gray-400 mt-0.5">Manage your account security</p>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: "#f3f4f6" }}>🔒</div>
                <div>
                  <p className="text-sm font-bold text-gray-800">Password</p>
                  <p className="text-xs text-gray-400">Keep your account secure</p>
                </div>
              </div>
              {/* ✅ Only one Change Password trigger */}
              <button onClick={() => setPwdModal(true)}
                className="px-4 py-2 rounded-lg text-xs font-bold text-blue-600 transition-all hover:bg-blue-50"
                style={{ border: "none", cursor: "pointer", background: "none" }}>
                Update
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default AdminEditProfile