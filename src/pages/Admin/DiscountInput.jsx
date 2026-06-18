import { useState } from "react"
import axios from "axios"

const DiscountInput = ({ cartTotal, onDiscountApplied, onDiscountRemoved }) => {
  const [code, setCode]         = useState("")
  const [applied, setApplied]   = useState(null) // { code, percentage, savings }
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  const H = { Authorization: `Bearer ${localStorage.getItem("userToken")}` }

  const handleApply = async () => {
    if (!code.trim()) return setError("Please enter a discount code")
    setLoading(true)
    setError("")
    try {
      const res = await axios.post(
        "http://localhost:5000/api/user/discount/validate",
        { code },
        { headers: H }
      )
      const savings = Math.round((cartTotal * res.data.percentage) / 100)
      const discountData = {
        code:       res.data.code,
        percentage: res.data.percentage,
        savings
      }
      setApplied(discountData)
      onDiscountApplied(discountData) // send to parent
    } catch (e) {
      setError(e.response?.data?.message || "Invalid discount code")
    }
    setLoading(false)
  }

  const handleRemove = () => {
    setApplied(null)
    setCode("")
    setError("")
    onDiscountRemoved() // tell parent discount removed
  }

  return (
    <div className="rounded-2xl border border-violet-100 p-4 bg-white"
      style={{ boxShadow: "0 2px 12px rgba(109,40,217,0.05)" }}>

      <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
        🏷️ Discount Code
      </p>

      {!applied ? (
        <>
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 rounded-xl border border-violet-100 text-sm font-bold uppercase focus:outline-none focus:border-violet-400"
              placeholder="Enter code e.g. SAVE20"
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setError("") }}
              onKeyDown={e => e.key === "Enter" && handleApply()}
            />
            <button
              onClick={handleApply}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-black text-white transition-all"
              style={{ background: loading ? "#c4b5fd" : "#7c3aed", minWidth: 80 }}>
              {loading ? "..." : "Apply"}
            </button>
          </div>
          {error && (
            <p className="text-xs text-red-500 font-semibold mt-2">{error}</p>
          )}
        </>
      ) : (
        <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
          style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
          <div>
            <p className="text-xs font-black text-emerald-700">
              ✅ {applied.code} — {applied.percentage}% OFF applied!
            </p>
            <p className="text-xs text-emerald-500 mt-0.5">
              You save ₹{applied.savings.toLocaleString("en-IN")}
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors">
            Remove
          </button>
        </div>
      )}
    </div>
  )
}

export default DiscountInput