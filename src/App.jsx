import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import RequireAuth from "./components/RequireAuth";
import Dashboard from "./pages/Dashboard";
import Companies from "./pages/Companies";
import CompanyDetail from "./pages/CompanyDetail";
import Candidates from "./pages/Candidates";
import CandidateDetail from "./pages/CandidateDetail";
import Jobs from "./pages/Jobs";
import AddJob from "./pages/AddJob";
import EditJob from "./pages/EditJob";
import JobDetail from "./pages/JobDetail";
import Applications from "./pages/Applications";
import BlogPosts from "./pages/BlogPosts";
import AllBlogs from "./pages/AllBlogs";
import EditBlog from "./pages/EditBlog";
import ProfileSettings from "./pages/settings/ProfileSettings";
import AccountSettings from "./pages/settings/AccountSettings";
import UserRoles from "./pages/settings/UserRoles";
import ChangePassword from "./pages/settings/ChangePassword";
import ThemeSettings from "./pages/settings/ThemeSettings";
import NotificationsPage from "./pages/settings/Notifications";
import SendNotification from "./pages/admin/SendNotification";
import FaqList from "./pages/support-legal/FaqList";
import TermsPage from "./pages/support-legal/TermsPage";
import PrivacyPage from "./pages/support-legal/PrivacyPage";
import AddFaq from "./pages/support-legal/AddFaq";
import EditFaq from "./pages/support-legal/EditFaq";
// ✅ Login Page
import Login from "./pages/Login";

export default function App() {
  return (
    <Routes>

      {/* ✅ Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* ✅ Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ✅ Admin Protected Routes */}
      <Route path="/admin" element={<RequireAuth> <AdminLayout /> </RequireAuth> }>
        <Route index element={<Dashboard />} />
        <Route path="companies" element={<Companies />} />
        <Route path="companies/:id" element={<CompanyDetail />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="candidates/:id" element={<CandidateDetail />} />
        <Route path="jobs" element={<Jobs />} />
        <Route path="jobs/new" element={<AddJob />} />
        <Route path="jobs/:id/edit" element={<EditJob />} />
        <Route path="jobs/:id" element={<JobDetail />} />
        <Route path="applications" element={<Applications />} />
        <Route path="/admin/add-blog" element={<BlogPosts />} />
        <Route path="/admin/all-blogs" element={<AllBlogs />} />
        <Route path="/admin/all-blogs/edit/:id" element={<EditBlog />} />
        <Route path="/admin/faqs" element={<FaqList />} />
        <Route path="/admin/faqs/add" element={<AddFaq />} />
        <Route path="/admin/faqs/:id/edit" element={<EditFaq />} />
        <Route path="/admin/terms" element={<TermsPage />} />
        <Route path="/admin/privacy" element={<PrivacyPage />} />


        {/* ✅ Remove leading /admin here */}
        <Route path="notifications/send" element={<SendNotification />} />

        {/* ✅ Settings */}
        <Route path="settings/profile" element={<ProfileSettings />} />
        <Route path="settings/account" element={<AccountSettings />} />
        <Route path="settings/roles" element={<UserRoles />} />
        <Route path="settings/password" element={<ChangePassword />} />
        <Route path="settings/theme" element={<ThemeSettings />} />
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* ✅ Catch-all fallback (Optional) */}
      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>
  );
}
