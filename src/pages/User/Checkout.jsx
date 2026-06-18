import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"

const IMG = "http://localhost:5000/uploads/"

const Checkout = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const {
    cart     = [],
    subtotal = 0,
    discount = null,
  } = location.state || {}

  const [placing,      setPlacing]      = useState(false)
  const [autoDiscount, setAutoDiscount] = useState(discount)

  const H = { Authorization: `Bearer ${localStorage.getItem("userToken")}` }

  // ✅ Auto fetch discount if not passed from cart
  useEffect(() => {
    const getActiveDiscount = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/user/active-discount",
          { headers: H }
        )
        if (res.data.discount) {
          const savings = Math.round((subtotal * res.data.discount.percentage) / 100)
          setAutoDiscount({ ...res.data.discount, savings })
        }
      } catch (e) { console.log("Discount error:", e) }
    }
    if (!discount) getActiveDiscount()
  }, [])

  const savings  = autoDiscount?.savings || 0
  const finalAmt = subtotal - savings

  // ✅ Razorpay Payment
  const handlePayment = async () => {
    if (cart.length === 0) return
    setPlacing(true)
    try {
      // Step 1 — Create Razorpay order
      const { data: rzpOrder } = await axios.post(
        "http://localhost:5000/api/payment/create-order",
        { amount: finalAmt }
      )

      // Step 2 — Open Razorpay checkout
      const options = {
        key:         "rzp_test_Sa4wX16uFDur3B",
        amount:      rzpOrder.amount,
        currency:    "INR",
        order_id:    rzpOrder.id,
        name:        "ThemeMatrix",
        description: "Template Purchase",
        theme:       { color: "#7c3aed" },

        handler: async function (response) {
          try {
            // Step 3 — Verify payment
            await axios.post(
              "http://localhost:5000/api/payment/verify-payment",
              response
            )

            // Step 4 — Place order with paymentId
            const res = await axios.post(
              "http://localhost:5000/api/user/place-order",
              {
                subtotal,
                discountCode:    autoDiscount?.code        || null,
                discountPercent: autoDiscount?.percentage  || 0,
                discountAmount:  savings,
                finalTotal:      finalAmt,
                paymentId:       response.razorpay_payment_id,   // ✅ log
                razorpayOrderId: response.razorpay_order_id,     // ✅ log
              },
              { headers: H }
            )

            // Step 5 — Go to success page
            navigate("/order-success", {
              state: {
                order:   res.data.order,
                orderId: res.data.orderId
              }
            })
          } catch (e) {
            console.log("Order error:", e)
            alert("Payment verified but order failed. Please contact support.")
          }
        },

        modal: {
          ondismiss: () => {
            setPlacing(false)
            alert("Payment cancelled")
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.open()

    } catch (error) {
      console.log("Payment error:", error)
      alert("Payment Failed. Please try again.")
      setPlacing(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-xl font-black text-gray-700 mb-2">No items to checkout</h3>
        <button onClick={() => navigate("/cart")}
          className="mt-4 px-6 py-2.5 rounded-xl font-bold text-white"
          style={{ background: "#7c3aed", border: "none", cursor: "pointer" }}>
          Go to Cart
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900">💳 Checkout</h2>
        <p className="text-gray-400 mt-1">Review your order and confirm</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ─── Left ─── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Order Items */}
          <div className="bg-white rounded-2xl p-5 border border-violet-100"
            style={{ boxShadow: "0 2px 12px rgba(109,40,217,0.05)" }}>
            <h3 className="font-black text-gray-800 mb-4 text-sm uppercase tracking-widest">
              📦 Order Items ({cart.length})
            </h3>
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item._id}
                  className="flex items-center gap-3 py-3 border-b border-violet-50 last:border-0">
                  <div className="w-14 h-10 rounded-lg overflow-hidden border border-violet-100 flex-shrink-0">
                    {item.templateId?.designThumbnail
                      ? <img src={`${IMG}${item.templateId.designThumbnail}`}
                          className="w-full h-full object-cover"
                          alt={item.templateId?.designName} />
                      : <div className="w-full h-full flex items-center justify-center font-black bg-violet-50 text-violet-600">
                          {item.templateId?.designName?.charAt(0)?.toUpperCase()}
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">
                      {item.templateId?.designName || "Template"}
                    </p>
                    <p className="text-xs text-gray-400">Digital Download · Lifetime Access</p>
                  </div>
                  <p className="font-black text-violet-700">
                    ₹{(item.templateId?.regularPrice || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Discount Banner */}
          {autoDiscount && savings > 0 && (
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
              style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
              <span className="text-2xl">🎉</span>
              <div>
                <p className="text-sm font-black text-emerald-700">
                  {autoDiscount.percentage}% Discount Auto Applied!
                </p>
                <p className="text-xs text-emerald-500 mt-0.5">
                  You save ₹{savings.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-white rounded-2xl p-5 border border-violet-100"
            style={{ boxShadow: "0 2px 12px rgba(109,40,217,0.05)" }}>
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
              💳 Payment Method
            </p>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2"
              style={{ borderColor: "#7c3aed", background: "#faf5ff" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "#7c3aed" }}>
                <span className="text-white text-sm">💳</span>
              </div>
              <div>
                <p className="text-sm font-black text-gray-800">Razorpay</p>
                <p className="text-xs text-gray-400">Secure payment via Razorpay</p>
              </div>
              <span className="ml-auto w-4 h-4 rounded-full border-4 flex-shrink-0"
                style={{ borderColor: "#7c3aed", background: "#fff" }} />
            </div>
          </div>
        </div>

        {/* ─── Right — Summary ─── */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-5 border border-violet-100 sticky top-24"
            style={{ boxShadow: "0 4px 24px rgba(109,40,217,0.08)" }}>
            <h3 className="font-black text-gray-800 mb-4">Order Summary</h3>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal ({cart.length} items)</span>
                <span>₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              {autoDiscount && savings > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                  <span>Discount ({autoDiscount.percentage}%)</span>
                  <span>-₹{savings.toLocaleString("en-IN")}</span>
                </div>
              )}
            </div>

            <div className="flex justify-between font-black text-gray-900 text-lg border-t border-violet-100 pt-3 mb-5">
              <span>Total</span>
              <span className="text-violet-700">₹{finalAmt.toLocaleString("en-IN")}</span>
            </div>

            {/* ✅ Pay with Razorpay */}
            <button
              onClick={handlePayment}
              disabled={placing}
              className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] hover:shadow-lg"
              style={{
                background: placing ? "#c4b5fd" : "linear-gradient(135deg,#a855f7,#7c3aed)",
                border: "none",
                cursor: placing ? "not-allowed" : "pointer",
                boxShadow: "0 4px 20px rgba(168,85,247,0.35)"
              }}>
              {placing ? "Opening Payment..." : "💳 Pay ₹" + finalAmt.toLocaleString("en-IN")}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              🔒 Secured by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout