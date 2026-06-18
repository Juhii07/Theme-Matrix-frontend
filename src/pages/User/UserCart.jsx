import { useState, useEffect } from "react"
import { Link, useNavigate, useOutletContext } from "react-router-dom"
import axios from "axios"

const IMG = "http://localhost:5000/uploads/"

const UserCart = () => {
  const context = useOutletContext()
  const cartCount    = context?.cartCount    ?? 0
  const setCartCount = context?.setCartCount ?? (() => {})

  const [cart,     setCart]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [removing, setRemoving] = useState(null)
  const [discount, setDiscount] = useState(null)

  const navigate = useNavigate()
  const H = { Authorization: `Bearer ${localStorage.getItem("userToken")}` }

  const getCart = async () => {
    try {
      const res = await axios.get("http://localhost:5000/userapi/view-cart", { headers: H })
      let cartData = []
      if (Array.isArray(res.data))           cartData = res.data
      else if (Array.isArray(res.data.cart)) cartData = res.data.cart
      else if (Array.isArray(res.data.data)) cartData = res.data.data
      setCart(cartData)
      setCartCount(cartData.length)
    } catch (e) { console.log("Cart error:", e) }
    setLoading(false)
  }

  const getActiveDiscount = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/user/active-discount",
        { headers: H }
      )
      if (res.data.discount) setDiscount(res.data.discount)
    } catch (e) { console.log("Discount error:", e) }
  }

  useEffect(() => {
    getCart()
    getActiveDiscount()
  }, [])

  const removeFromCart = async (cartItemId) => {
    setRemoving(cartItemId)
    try {
      await axios.delete(
        `http://localhost:5000/userapi/remove-cart/${cartItemId}`,
        { headers: H }
      )
      setCart(prev => {
        const updated = prev.filter(item => item._id !== cartItemId)
        setCartCount(updated.length)
        return updated
      })
      window.dispatchEvent(new Event("cartUpdated"))
    } catch (e) { console.log("Remove error:", e) }
    setRemoving(null)
  }

  const subtotal   = cart.reduce((acc, item) => acc + (item.templateId?.regularPrice || 0), 0)
  const savings    = discount ? Math.round((subtotal * discount.percentage) / 100) : 0
  const finalTotal = subtotal - savings

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900">🛒 My Cart</h2>
        <p className="text-gray-400 mt-1">{cartCount} item(s)</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 rounded-full border-4 animate-spin"
            style={{ borderColor: "#ede9fe", borderTopColor: "#a855f7" }} />
        </div>
      ) : cart.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-violet-100"
          style={{ boxShadow: "0 2px 16px rgba(109,40,217,0.06)" }}>
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-black text-gray-700 mb-2">Your cart is empty</h3>
          <p className="text-gray-400 mb-6">Discover premium templates and add them to your cart</p>
          <Link to="/"
            className="inline-block px-8 py-3 rounded-full font-bold text-white no-underline transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
            Browse Templates
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map(item => (
              <div key={item._id}
                className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-violet-100"
                style={{ boxShadow: "0 2px 12px rgba(109,40,217,0.05)" }}>

                {/* Thumbnail */}
                <div className="w-20 h-14 rounded-xl overflow-hidden border border-violet-100 flex-shrink-0">
                  {item.templateId?.designThumbnail
                    ? <img
                        src={`${IMG}${item.templateId.designThumbnail}`}
                        className="w-full h-full object-cover"
                        alt={item.templateId?.designName}
                        onError={e => {
                          e.target.parentNode.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#f5f3ff;color:#7c3aed;font-weight:900;font-size:18px">${item.templateId?.designName?.charAt(0)?.toUpperCase()}</div>`
                        }}
                      />
                    : <div className="w-full h-full flex items-center justify-center font-black text-xl bg-violet-50 text-violet-600">
                        {item.templateId?.designName?.charAt(0)?.toUpperCase()}
                      </div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-800 truncate">
                    {item.templateId?.designName || "Template"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Digital Download · Lifetime Access
                  </p>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    disabled={removing === item._id}
                    className="text-xs font-bold text-red-400 hover:text-red-600 transition-all mt-1"
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {removing === item._id ? "Removing..." : "🗑️ Remove"}
                  </button>
                </div>

                {/* Price */}
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-violet-700 text-lg">
                    ₹{(item.templateId?.regularPrice || 0).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}

            {/* Discount Banner */}
            {discount && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}>
                <span className="text-xl">🎉</span>
                <div>
                  <p className="text-sm font-black text-emerald-700">
                    {discount.percentage}% Discount Auto Applied!
                  </p>
                  <p className="text-xs text-emerald-500 mt-0.5">
                    You save ₹{savings.toLocaleString("en-IN")} on this order
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 border border-violet-100 sticky top-24"
              style={{ boxShadow: "0 4px 24px rgba(109,40,217,0.08)" }}>
              <h3 className="font-black text-gray-800 mb-4">Order Summary</h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                {discount && savings > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                    <span>Discount ({discount.percentage}%)</span>
                    <span>-₹{savings.toLocaleString("en-IN")}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between font-black text-gray-900 text-lg border-t border-violet-100 pt-3 mb-5">
                <span>Total</span>
                <span className="text-violet-700">₹{finalTotal.toLocaleString("en-IN")}</span>
              </div>

              <button
                onClick={() => navigate("/checkout", {
                  state: {
                    cart,
                    subtotal,
                    discount: discount ? { ...discount, savings } : null,
                    finalTotal
                  }
                })}
                className="w-full py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] hover:shadow-lg"
                style={{
                  background: "linear-gradient(135deg,#a855f7,#7c3aed)",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(168,85,247,0.35)"
                }}>
                💳 Proceed to Checkout
              </button>

              <p className="text-center text-xs text-gray-400 mt-3">
                🔒 Secure payment · Instant download
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserCart