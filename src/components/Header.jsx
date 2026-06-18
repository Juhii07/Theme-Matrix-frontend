import { useState, useEffect } from "react"
import { Link, Outlet, useNavigate } from "react-router-dom"
import axios from "axios"
import UserFooter from "./UserFooter"

const UserHeader = () => {
  const navigate = useNavigate()
  const userName = localStorage.getItem("userName")

  const [search, setSearch] = useState("")
  const [cartCount, setCartCount] = useState(0)

  const getCartCount = async () => {
    const token = localStorage.getItem("userToken")
    if (!token) return

    try {
      const res = await axios.get(
        "http://localhost:5000/userapi/view-cart",
        { headers: { Authorization: `Bearer ${token}` } }
      )

      let items = []
      if (Array.isArray(res.data)) items = res.data
      else if (res.data && Array.isArray(res.data.cart)) items = res.data.cart
      else if (res.data && Array.isArray(res.data.data)) items = res.data.data

      setCartCount(items.length)  // ✅ set real count

    } catch (e) {
      console.log("Cart count error:", e)
      setCartCount(0)
    }
  }

  useEffect(() => {
    getCartCount()  // ✅ fetch once on mount — NO interval polling

    const handleCartUpdate = () => getCartCount()
    window.addEventListener("cartUpdated", handleCartUpdate)  // ✅ add to cart
    window.addEventListener("focus", handleCartUpdate)         // ✅ tab switch

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate)
      window.removeEventListener("focus", handleCartUpdate)
    }
  }, [])

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/?search=${encodeURIComponent(search.trim())}`)
    }
  }

  const logout = () => {
    localStorage.clear()
    setCartCount(0)
    navigate("/login")
  }

  return (
    <>
      {/* ===== TOP BAR ===== */}
      <div style={{
        background: "#111827",
        color: "#fff",
        fontSize: "12px",
        padding: "8px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", gap: 24 }}>
          <span>📧 support@themematrix.com</span>
          <span>📞 +91 97265 60648</span>
        </div>
        <span style={{ fontWeight: 600 }}>
          Premium UI Kits & Templates Marketplace
        </span>
        <div style={{ display: "flex", gap: 16 }}>
          <a href="#" style={{ color: "#d1d5db", textDecoration: "none" }}>Facebook</a>
          <a href="#" style={{ color: "#d1d5db", textDecoration: "none" }}>Instagram</a>
          <a href="#" style={{ color: "#d1d5db", textDecoration: "none" }}>Twitter</a>
        </div>
      </div>

      {/* ===== MAIN NAVBAR ===== */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 no-underline flex-shrink-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
              style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)", color: "#fff" }}>
              TM
            </div>
            <span className="text-xl font-black text-gray-800">
              Theme<span className="text-violet-600">Matrix</span>
            </span>
          </Link>

          {/* NAV LINKS */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/"
              className="no-underline text-gray-600 font-semibold hover:text-violet-600 transition-colors text-sm">
              Home
            </Link>
            <Link to="/about"
              className="no-underline text-gray-600 font-semibold hover:text-violet-600 transition-colors text-sm">
              About
            </Link>
            <Link to="/contact"
              className="no-underline text-gray-600 font-semibold hover:text-violet-600 transition-colors text-sm">
              Contact
            </Link>
          </div>

          {/* SEARCH */}
          <div className="hidden lg:flex items-center border border-gray-200 rounded-full px-3 py-1.5 gap-2 bg-gray-50">
            <span className="text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchSubmit}
              className="outline-none text-sm bg-transparent w-36 text-gray-600"
            />
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">

            {/* ✅ CART ICON WITH LIVE BADGE */}
            <Link to="/cart" className="no-underline"
              style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
              <span style={{ fontSize: "26px" }}>🛒</span>
              <span style={{
                position: "absolute",
                top: "-8px",
                right: "-10px",
                background: "#7c3aed",
                color: "#fff",
                borderRadius: "50%",
                minWidth: "20px",
                height: "20px",
                fontSize: "11px",
                fontWeight: "900",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                boxShadow: "0 2px 6px rgba(124,58,237,0.4)"
              }}>
                {cartCount}  {/* ✅ live count */}
              </span>
            </Link>

            {/* USER + LOGOUT */}
            {userName ? (
              <div className="flex items-center gap-3">
                <span className="hidden md:flex items-center gap-1 text-sm font-semibold text-gray-700">
                  👤 {userName}
                </span>
                <button onClick={logout}
                  className="px-4 py-2 rounded-full text-sm font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg,#a855f7,#7c3aed)",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(168,85,247,0.35)"
                  }}>
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login"
                className="px-4 py-2 rounded-full text-sm font-bold text-white no-underline"
                style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ✅ PASS cartCount & getCartCount as props to all child pages via Outlet context */}
      <main className="min-h-screen bg-gray-50">
        <Outlet context={{ cartCount, setCartCount, getCartCount }} />
      </main>

      <UserFooter />
    </>
  )
}

export default UserHeader