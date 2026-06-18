// import './App.css'
// // import UserHeader from './layouts/UserHeader'
// import About from './pages/About'
// import Home from './pages/Home'
// import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import Register from './pages/Register'
// import Login from './pages/Login'
// // import UserHome from './pages/UserHome'
// import Contact from './pages/Contact'
// import AdminDashboard from './pages/Admin/AdminDashboard'
// import ViewVendor from './pages/Admin/ViewVendor'
// import AdminLogin from './pages/Admin/AdminLogin'
// import AdminLayout from './layouts/AdminLayout'
// import AddCategory from './pages/Admin/AddCategory'
// import ViewCategories from './pages/Admin/ViewCategories'
// import ViewUsers from './pages/Admin/ViewUsers'
// // import VerifyVendor from './pages/Admin/VerifyVendor'
// import AllTemplates from './pages/Admin/AllTemplates'
// import AdminEditProfile from "./pages/Admin/AdminEditProfile"

// // VENDOR IMPORTS
// import VendorRegister from './pages/Vendor/VendorRegister'
// import VendorLogin from './pages/Vendor/VendorLogin'
// import VendorLayout from './layouts/VendorLayout'
// import VendorDashboard from './pages/Vendor/VendorDashboard'
// import UploadTemplate from './pages/Vendor/UploadTemplate'
// import MyTemplates from './pages/Vendor/MyTemplates'
// import EditTemplate from './pages/Vendor/EditTemplate'
// import VendorCartProducts from './pages/Vendor/VendorCartProducts'
// import VendorEditProfile from "./pages/Vendor/VendorEditProfile"

// import UserLayout from "./layouts/UserLayout"
// // import UserRegister from "./pages/User/UserRegister"
// // import UserLogin from "./pages/User/UserLogin"
// import UserHome from "./pages/User/UserHome"
// import TemplateDetail from "./pages/User/TemplateDetail"
// import UserCart from "./pages/User/UserCart"
// import UserEditProfile from "./pages/User/UserEditProfile"
// import VendorCategoryTemplates from './pages/Vendor/VendorCategoryTemplates'
// import VendorCategories from './pages/Vendor/VendorCategories'
// import VendorBankDetails from './pages/Vendor/VendorBankDetails'

// function App() {

//   return (
//     <BrowserRouter>
//       <Routes>

//          {/* USER ROUTES */}
//         <Route path='/' element={<UserLayout />}>
//           <Route index element={<Home />} />
//           <Route path='/about' element={<About />} />
//           <Route path='/contact' element={<Contact />} />
//           <Route path='/register' element={<Register />} />
//           <Route path='/login' element={<Login />} />
//           {/* <Route path='/userhome' element={<UserHome />} /> */}
//           {/* <Route path='/admindashboard' element={<AdminDashboard />} /> */}
//         </Route>


//         {/* ADMIN LOGIN */}
//         <Route path="/adminlogin" element={<AdminLogin />} />

//         {/* ADMIN PANEL */}
//         <Route path="/admin" element={<AdminLayout />}>
//           <Route path="dashboard" element={<AdminDashboard />} />
//           <Route path="vendors" element={<ViewVendor />} />
//           {/* <Route path="verify-vendor" element={<VerifyVendor />} /> */}
//           <Route path="users" element={<ViewUsers />} />
//           <Route path="add-category" element={<AddCategory />} />
//           <Route path="view-categories" element={<ViewCategories />} />
//           <Route path="all-templates" element={<AllTemplates />} />
//           <Route path="edit-profile"     element={<AdminEditProfile />} />
//         </Route>

//         {/* VENDOR AUTH */}
//         <Route path="/vendorregister" element={<VendorRegister />} />
//         <Route path="/vendorlogin" element={<VendorLogin />} />

//         {/* VENDOR PANEL */}
//         <Route path="/vendor" element={<VendorLayout />}>
//           <Route path="dashboard" element={<VendorDashboard />} />
//           <Route path="upload" element={<UploadTemplate />} />
//           <Route path="my-templates" element={<MyTemplates />} />
//           <Route path="edit-template/:id" element={<EditTemplate />} />
//           <Route path="cart-products" element={<VendorCartProducts />} />
//           <Route path="edit-profile"  element={<VendorEditProfile />} />
//           <Route path="/vendor/categories"     element={<VendorCategories />} />
//           <Route path="/vendor/categories/:id" element={<VendorCategoryTemplates />} />
//           <Route path="/vendor/bank-details" element={<VendorBankDetails />} />
//         </Route>

//          {/* ── USER ── */}
//       {/* <Route path="/register" element={<UserRegister />} /> */}
//       {/* <Route path="/login"    element={<UserLogin />} /> */}
//       <Route path="/" element={<UserLayout />}>
//         <Route index                   element={<UserHome />} />
//         <Route path="template/:id"     element={<TemplateDetail />} />
//         <Route path="cart"             element={<UserCart />} />
//         <Route path="edit-profile"     element={<UserEditProfile />} />
//       </Route>

//       </Routes>
//     </BrowserRouter>


//   )
// }

// export default App








// // import './App.css'
// // import { BrowserRouter, Routes, Route } from 'react-router-dom'

// // // Public pages
// // import Home           from './pages/Home'
// // import About          from './pages/About'
// // import Contact        from './pages/Contact'
// // import Register       from './pages/Register'
// // import Login          from './pages/Login'

// // // Admin
// // import AdminLogin       from './pages/Admin/AdminLogin'
// // import AdminLayout      from './layouts/AdminLayout'
// // import AdminDashboard   from './pages/Admin/AdminDashboard'
// // import ViewVendor       from './pages/Admin/ViewVendor'
// // import ViewUsers        from './pages/Admin/ViewUsers'
// // import AddCategory      from './pages/Admin/AddCategory'
// // import ViewCategories   from './pages/Admin/ViewCategories'
// // import AllTemplates     from './pages/Admin/AllTemplates'
// // import AdminEditProfile from './pages/Admin/AdminEditProfile'

// // // Vendor
// // import VendorRegister         from './pages/Vendor/VendorRegister'
// // import VendorLogin            from './pages/Vendor/VendorLogin'
// // import VendorLayout           from './layouts/VendorLayout'
// // import VendorDashboard        from './pages/Vendor/VendorDashboard'
// // import UploadTemplate         from './pages/Vendor/UploadTemplate'
// // import MyTemplates            from './pages/Vendor/MyTemplates'
// // import EditTemplate           from './pages/Vendor/EditTemplate'
// // import VendorCartProducts     from './pages/Vendor/VendorCartProducts'
// // import VendorEditProfile      from './pages/Vendor/VendorEditProfile'
// // import VendorCategories       from './pages/Vendor/VendorCategories'
// // import VendorCategoryTemplates from './pages/Vendor/VendorCategoryTemplates'
// // import VendorBankDetails      from './pages/Vendor/VendorBankDetails'

// // // User
// // import UserLayout      from './layouts/UserLayout'
// // import UserHome        from './pages/User/UserHome'
// // import TemplateDetail  from './pages/User/TemplateDetail'
// // import UserCart        from './pages/User/UserCart'
// // import UserEditProfile from './pages/User/UserEditProfile'
// // import UserRegister    from './pages/User/UserRegister'
// // import UserLogin       from './pages/User/UserLogin'

// // function App() {
// //   return (
// //     <BrowserRouter>
// //       <Routes>

// //         {/* ── PUBLIC — with UserHeader layout ── */}
// //         <Route path="/" element={<UserLayout />}>
// //           <Route index             element={<Home />} />
// //           <Route path="about"      element={<About />} />
// //           <Route path="contact"    element={<Contact />} />
// //           <Route path="register"   element={<Register />} />
// //           <Route path="login"      element={<Login />} />
// //           <Route path="userhome"   element={<UserHome />} />
// //           <Route path="template/:id" element={<TemplateDetail />} />
// //           <Route path="cart"         element={<UserCart />} />
// //           <Route path="edit-profile" element={<UserEditProfile />} />
// //         </Route>

// //         {/* ── USER AUTH ── */}
// //         <Route path="/userregister" element={<UserRegister />} />
// //         <Route path="/userlogin"    element={<UserLogin />} />

// //         {/* ── ADMIN LOGIN ── */}
// //         <Route path="/adminlogin" element={<AdminLogin />} />

// //         {/* ── ADMIN PANEL ── */}
// //         <Route path="/admin" element={<AdminLayout />}>
// //           <Route path="dashboard"       element={<AdminDashboard />} />
// //           <Route path="vendors"         element={<ViewVendor />} />
// //           <Route path="users"           element={<ViewUsers />} />
// //           <Route path="add-category"    element={<AddCategory />} />
// //           <Route path="view-categories" element={<ViewCategories />} />
// //           <Route path="all-templates"   element={<AllTemplates />} />
// //           <Route path="edit-profile"    element={<AdminEditProfile />} />
// //         </Route>

// //         {/* ── VENDOR AUTH ── */}
// //         <Route path="/vendorregister" element={<VendorRegister />} />
// //         <Route path="/vendorlogin"    element={<VendorLogin />} />

// //         {/* ── VENDOR PANEL ── */}
// //         <Route path="/vendor" element={<VendorLayout />}>
// //           <Route path="dashboard"          element={<VendorDashboard />} />
// //           <Route path="upload"             element={<UploadTemplate />} />
// //           <Route path="my-templates"       element={<MyTemplates />} />
// //           <Route path="edit-template/:id"  element={<EditTemplate />} />
// //           <Route path="cart-products"      element={<VendorCartProducts />} />
// //           <Route path="edit-profile"       element={<VendorEditProfile />} />
// //           <Route path="categories"         element={<VendorCategories />} />
// //           <Route path="categories/:id"     element={<VendorCategoryTemplates />} />
// //           <Route path="bank-details"       element={<VendorBankDetails />} />
// //         </Route>

// //       </Routes>
// //     </BrowserRouter>
// //   )
// // }

// // export default App






// App.jsx
import './App.css'
import About from './pages/About'
import Home from './pages/Home'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Register from './pages/Register'
import Login from './pages/Login'
import Contact from './pages/Contact'
import AdminDashboard from './pages/Admin/AdminDashboard'
import ViewVendor from './pages/Admin/ViewVendor'
import AdminLogin from './pages/Admin/AdminLogin'
import AdminLayout from './layouts/AdminLayout'
import AddCategory from './pages/Admin/AddCategory'
import ViewCategories from './pages/Admin/ViewCategories'
import ViewUsers from './pages/Admin/ViewUsers'
import AllTemplates from './pages/Admin/AllTemplates'
import AdminEditProfile from "./pages/Admin/AdminEditProfile"
import AdminDiscount from './pages/Admin/AdminDiscount'
import AdminOrders from './pages/Admin/AdminOrders'
import AdminPayments from './pages/Admin/AdminPayments'
import AdminFeedback from './pages/Admin/AdminFeedback'
import AdminForgotPassword from './pages/Admin/AdminForgotPassword'
import AdminResetPassword from './pages/Admin/AdminResetPassword'

import VendorRegister from './pages/Vendor/VendorRegister'
import VendorLogin from './pages/Vendor/VendorLogin'
import VendorLayout from './layouts/VendorLayout'
import VendorDashboard from './pages/Vendor/VendorDashboard'
import UploadTemplate from './pages/Vendor/UploadTemplate'
import MyTemplates from './pages/Vendor/MyTemplates'
import EditTemplate from './pages/Vendor/EditTemplate'
import VendorCartProducts from './pages/Vendor/VendorCartProducts'
import VendorEditProfile from "./pages/Vendor/VendorEditProfile"
import VendorCategoryTemplates from './pages/Vendor/VendorCategoryTemplates'
import VendorCategories from './pages/Vendor/VendorCategories'
import VendorBankDetails from './pages/Vendor/VendorBankDetails'
import VendorOrders from './pages/Vendor/VendorOrders'
import VendorPayments from './pages/Vendor/VendorPayments'
import VendorFeedback from './pages/Vendor/VendorFeedback'
import VendorForgotPassword from './pages/Vendor/VendorForgotPassword'
import VendorResetPassword from './pages/Vendor/VendorResetPassword'

import UserLayout from "./layouts/UserLayout"
import UserHome from "./pages/User/UserHome"
import TemplateDetail from "./pages/User/TemplateDetail"
import UserCart from "./pages/User/UserCart"
import UserEditProfile from "./pages/User/UserEditProfile"
import Checkout from './pages/User/Checkout'
import OrderSuccess from './pages/User/OrderSuccess'
import BecomeVendor from './pages/User/BecomeVendor'
import AllTemplate from './pages/User/AllTemplate'
import MyOrders from './pages/User/MyOrders'
import MyTemplate from './pages/User/MyTemplate'
import ForgotPassword from './pages/User/ForgotPassword'
import ResetPassword from './pages/User/ResetPassword'


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ✅ ONE single UserLayout block — all user pages here */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/" element={<UserLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
          <Route path="userhome" element={<UserHome />} />
          <Route path="template/:id" element={<TemplateDetail />} />
          <Route path="cart" element={<UserCart />} />      {/* ✅ inside UserLayout */}
          <Route path="edit-profile" element={<UserEditProfile />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="become-vendor" element={<BecomeVendor />} />
          <Route path="all-templates" element={<AllTemplate />} />
          <Route path="my-orders" element={<MyOrders />} />
          <Route path="my-template" element={<MyTemplate />} />
        </Route>

        {/* ADMIN LOGIN */}
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
        <Route path="/admin/reset-password/:token" element={<AdminResetPassword />} />

        {/* ADMIN PANEL */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="vendors" element={<ViewVendor />} />
          <Route path="users" element={<ViewUsers />} />
          <Route path="add-category" element={<AddCategory />} />
          <Route path="view-categories" element={<ViewCategories />} />
          <Route path="all-templates" element={<AllTemplates />} />
          <Route path="edit-profile" element={<AdminEditProfile />} />
          <Route path="/admin/discounts" element={<AdminDiscount />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="feedback" element={<AdminFeedback />} />
        </Route>

        {/* VENDOR AUTH */}
        <Route path="/vendorregister" element={<VendorRegister />} />
        <Route path="/vendorlogin" element={<VendorLogin />} />
        <Route path="/vendor/forgot-password" element={<VendorForgotPassword />} />
        <Route path="/vendor/reset-password/:token" element={<VendorResetPassword />} />

        {/* VENDOR PANEL */}
        <Route path="/vendor" element={<VendorLayout />}>
          <Route path="dashboard" element={<VendorDashboard />} />
          <Route path="upload" element={<UploadTemplate />} />
          <Route path="my-templates" element={<MyTemplates />} />
          <Route path="edit-template/:id" element={<EditTemplate />} />
          <Route path="cart-products" element={<VendorCartProducts />} />
          <Route path="edit-profile" element={<VendorEditProfile />} />
          <Route path="categories" element={<VendorCategories />} />
          <Route path="categories/:id" element={<VendorCategoryTemplates />} />
          <Route path="bank-details" element={<VendorBankDetails />} />
          <Route path="/vendor/orders" element={<VendorOrders />} />
          <Route path="/vendor/payments" element={<VendorPayments />} />
          <Route path="feedback" element={<VendorFeedback />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App