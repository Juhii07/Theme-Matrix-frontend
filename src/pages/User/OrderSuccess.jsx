import { useLocation, useNavigate, Link } from "react-router-dom"
import { useEffect } from "react"

const OrderSuccess = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { order, orderId } = location.state || {}

  useEffect(() => {
    if (!order) navigate("/")
  }, [])

  if (!order) return null

  return (
    <div className="max-w-2xl mx-auto px-6 py-16 text-center">

      {/* Success Icon */}
      <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
        style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
        <span className="text-4xl">✅</span>
      </div>

      <h2 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h2>
      <p className="text-gray-400 mb-2">Thank you for your purchase 🎉</p>
      <p className="text-xs text-gray-300 mb-2">
        Order ID: <span className="font-bold text-violet-400">{String(orderId)}</span>
      </p>

      {/* ✅ Payment ID */}
      {order.paymentId && (
        <p className="text-xs text-gray-300 mb-8 font-mono">
          Payment ID: <span className="font-bold text-emerald-400">{order.paymentId}</span>
        </p>
      )}

      {/* Order Items */}
      <div className="bg-white rounded-2xl p-6 border border-violet-100 text-left mb-6"
        style={{ boxShadow: "0 4px 24px rgba(109,40,217,0.08)" }}>
        <h3 className="font-black text-gray-700 mb-4 text-sm uppercase tracking-widest">
          📦 Items Purchased
        </h3>
        <div className="space-y-3 mb-4">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-violet-50 last:border-0">
              <p className="text-sm font-semibold text-gray-700">
                {item.templateId?.designName || "Template"}
              </p>
              <p className="font-black text-violet-700 text-sm">
                ₹{(item.price || 0).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-sm text-gray-400">
            <span>Subtotal</span>
            <span>₹{order.subtotal?.toLocaleString("en-IN")}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-emerald-600 font-semibold">
              <span>Discount ({order.discountCode} · {order.discountPercent}%)</span>
              <span>-₹{order.discountAmount?.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-gray-900 text-lg pt-2 border-t border-violet-100">
            <span>Total Paid</span>
            <span className="text-violet-700">₹{order.finalTotal?.toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Link to="/"
          className="px-6 py-3 rounded-xl font-bold text-violet-700 no-underline border border-violet-200 hover:bg-violet-50 transition-all"
          style={{ background: "#faf5ff" }}>
          🏠 Home
        </Link>
        <Link to="/my-orders"
          className="px-6 py-3 rounded-xl font-bold text-white no-underline transition-all hover:scale-105"
          style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
          📦 My Orders
        </Link>
      </div>
    </div>
  )
}

export default OrderSuccess