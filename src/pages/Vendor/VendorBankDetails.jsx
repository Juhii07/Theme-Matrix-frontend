import { useState, useEffect } from "react"
import axios from "axios"

const VendorBankDetails = () => {
  const [accountHolder,  setAccountHolder]  = useState("")
  const [accountNumber,  setAccountNumber]  = useState("")
  const [confirmAccount, setConfirmAccount] = useState("")
  const [ifscCode,       setIfscCode]       = useState("")
  const [bankName,       setBankName]       = useState("")
  const [branchName,     setBranchName]     = useState("")
  const [upiId,          setUpiId]          = useState("")
  const [panCard,        setPanCard]        = useState("")
  const [loading,        setLoading]        = useState(false)
  const [fetching,       setFetching]       = useState(true)
  const [success,        setSuccess]        = useState(false)
  const [error,          setError]          = useState("")
  const H = { Authorization: `Bearer ${localStorage.getItem("vendorToken")}` }

  // GET http://localhost:5000/vendorapi/bank-details
  const getBankDetails = async () => {
    try {
      const res = await axios.get("http://localhost:5000/vendorapi/bank-details", { headers: H })
      const b   = res.data.bankDetails || res.data
      if (b) {
        setAccountHolder(b.accountHolder || "")
        setAccountNumber(b.accountNumber || "")
        setConfirmAccount(b.accountNumber || "")
        setIfscCode(b.ifscCode    || "")
        setBankName(b.bankName    || "")
        setBranchName(b.branchName || "")
        setUpiId(b.upiId          || "")
        setPanCard(b.panCard      || "")
      }
    } catch (e) { console.log(e) }
    setFetching(false)
  }

  useEffect(() => { getBankDetails() }, [])

  // POST http://localhost:5000/vendorapi/bank-details
  const saveBankDetails = async () => {
    setError("")
    if (!accountHolder || !accountNumber || !ifscCode || !bankName) {
      return setError("Please fill all required fields")
    }
    if (accountNumber !== confirmAccount) {
      return setError("Account numbers do not match")
    }
    setLoading(true); setSuccess(false)
    try {
      await axios.post(
        "http://localhost:5000/vendorapi/bank-details",
        { accountHolder, accountNumber, ifscCode, bankName, branchName, upiId, panCard },
        { headers: H }
      )
      setSuccess(true)
    } catch (e) {
      console.log(e)
      setError(e?.response?.data?.message || "Failed to save bank details")
    }
    setLoading(false)
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-xl font-black text-gray-900">🏦 Bank Details</h2>
        <p className="text-sm text-gray-400 mt-0.5">Your payment and withdrawal information</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* LEFT — Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl overflow-hidden border border-violet-100"
            style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>

            {/* Banner */}
            <div className="px-6 py-8 flex flex-col items-center text-center"
              style={{ background: "linear-gradient(135deg,#f5f3ff,#ede9fe)" }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-3"
                style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
                🏦
              </div>
              <h3 className="font-black text-gray-900">Payment Info</h3>
              <p className="text-xs text-gray-400 mt-1">Used for template sales payouts</p>
            </div>

            {/* Summary */}
            <div className="p-5 space-y-3">
              {[
                ["🏛️ Bank",    bankName      || "—"],
                ["👤 Holder",  accountHolder || "—"],
                ["🔢 Account", accountNumber ? `****${accountNumber.slice(-4)}` : "—"],
                ["📍 IFSC",    ifscCode      || "—"],
                ["📱 UPI",     upiId         || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 font-semibold">{label}</span>
                  <span className="text-xs font-bold text-gray-700">{value}</span>
                </div>
              ))}
            </div>

            {/* Security note */}
            <div className="mx-5 mb-5 px-4 py-3 rounded-xl text-xs font-semibold"
              style={{ background: "#f0fdf4", color: "#15803d" }}>
              🔒 Your bank details are encrypted and secure
            </div>
          </div>
        </div>

        {/* RIGHT — Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-violet-100"
            style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>

            <div className="px-6 py-4 border-b border-violet-50">
              <h3 className="font-black text-gray-900">🏛️ Bank Account Details</h3>
              <p className="text-xs text-gray-400 mt-0.5">Fields marked with * are required</p>
            </div>

            <div className="p-6 space-y-4">

              {success && (
                <div className="text-xs font-semibold px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                  ✅ Bank details saved successfully!
                </div>
              )}
              {error && (
                <div className="text-xs font-semibold px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600">
                  ❌ {error}
                </div>
              )}

              {/* Account Holder */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Account Holder Name *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                  <input type="text" value={accountHolder}
                    onChange={e => setAccountHolder(e.target.value)}
                    placeholder="Full name as per bank account"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white"
                    style={{ fontFamily: "inherit" }} />
                </div>
              </div>

              {/* Bank Name + Branch */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Bank Name *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🏛️</span>
                    <input type="text" value={bankName}
                      onChange={e => setBankName(e.target.value)}
                      placeholder="e.g. SBI, HDFC"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white"
                      style={{ fontFamily: "inherit" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Branch Name
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
                    <input type="text" value={branchName}
                      onChange={e => setBranchName(e.target.value)}
                      placeholder="e.g. Mumbai Main"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white"
                      style={{ fontFamily: "inherit" }} />
                  </div>
                </div>
              </div>

              {/* Account Number */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Account Number *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔢</span>
                  <input type="text" value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white"
                    style={{ fontFamily: "inherit" }} />
                </div>
              </div>

              {/* Confirm Account Number */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Confirm Account Number *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔢</span>
                  <input type="text" value={confirmAccount}
                    onChange={e => setConfirmAccount(e.target.value)}
                    placeholder="Re-enter account number"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border-2 bg-gray-50 focus:bg-white ${
                      confirmAccount && accountNumber !== confirmAccount
                        ? "border-red-300 focus:border-red-400"
                        : "border-gray-200 focus:border-violet-400"
                    }`}
                    style={{ fontFamily: "inherit" }} />
                  {confirmAccount && accountNumber !== confirmAccount && (
                    <p className="text-xs text-red-500 mt-1 font-semibold">
                      ⚠️ Account numbers do not match
                    </p>
                  )}
                </div>
              </div>

              {/* IFSC Code */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  IFSC Code *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📋</span>
                  <input type="text" value={ifscCode}
                    onChange={e => setIfscCode(e.target.value.toUpperCase())}
                    placeholder="e.g. SBIN0001234"
                    maxLength={11}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white uppercase"
                    style={{ fontFamily: "inherit" }} />
                </div>
              </div>

              {/* UPI + PAN */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    UPI ID
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📱</span>
                    <input type="text" value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      placeholder="name@upi"
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white"
                      style={{ fontFamily: "inherit" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    PAN Card
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🪪</span>
                    <input type="text" value={panCard}
                      onChange={e => setPanCard(e.target.value.toUpperCase())}
                      placeholder="e.g. ABCDE1234F"
                      maxLength={10}
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none border-2 border-gray-200 bg-gray-50 focus:border-violet-400 focus:bg-white uppercase"
                      style={{ fontFamily: "inherit" }} />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button onClick={saveBankDetails} disabled={loading}
                className="w-full font-black rounded-xl py-3 text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 mt-2"
                style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(168,85,247,0.35)" }}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : "💾 Save Bank Details"}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VendorBankDetails