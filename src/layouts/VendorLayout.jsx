import { useState } from "react"
import { Outlet, useLocation } from "react-router-dom"
import VendorSidebar from "../components/Vendor/VendorSidebar"
import VendorHeader from "../components/Vendor/VendorHeader"
import VendorFooter from "../components/Vendor/VendorFooter"

const pageTitles = {
  "/vendor/dashboard": "Dashboard",
  "/vendor/upload": "Upload Template",
  "/vendor/my-templates": "My Templates",
  "/vendor/categories": "Categories",
  "/vendor/cart-products": "Cart Products",
  "/vendor/edit-profile": "Edit Profile",
  "/vendor/bank-details": "Bank Details",
}

const VendorLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { pathname } = useLocation()

  // ✅ updated title detection — handles categories/:id and edit-template/:id
  const title =
    pageTitles[pathname] ||
    (pathname.includes("edit-template") ? "Edit Template" :
      pathname.includes("categories") ? "Category Templates" :
        "Vendor Panel")
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#f8f5ff" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap'); *{ font-family:'Plus Jakarta Sans',sans-serif; }`}</style>

      {/* Sidebar */}
      <VendorSidebar open={sidebarOpen} />

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Header */}
        <VendorHeader
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          title={title}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <VendorFooter />

      </div>
    </div>
  )
}

export default VendorLayout