import AdminLayout from "@/layouts/AdminLayout";
import NewsroomLayout from "@/layouts/NewsroomLayout";
import PublicLayout from "@/layouts/PublicLayout";
import CategoriesManagementPage from "@/features/admin/categories/CategoriesManagementPage";
import AdminDashboardPage from "@/features/admin/dashboard/AdminDashboardPage";
import LibraryPage from "@/features/newsroom/library/LibraryPage";
import RolesManagementPage from "@/features/admin/roles/RolesManagementPage";
import TeamManagementPage from "@/features/admin/team/TeamManagementPage";
import LoginPage from "@/features/auth/LoginPage";
import CalendarView from "@/features/calendar/CalendarView";
import StaffArticleDetailPage from "@/features/newsroom/StaffArticleDetailPage";
import NewsroomArticlesPage from "@/features/newsroom/NewsroomArticlesPage";
import NewsroomDashboard from "@/features/newsroom/NewsroomDashboard";
import PublishingFlow from "@/features/publishing-flow/PublishingFlow";
import CategoryPage from "@/features/public-site/categories/CategoryPage";
import ArticlePage from "@/features/public-site/article-page/ArticlePage";
import ArticlesListPage from "@/features/public-site/articles/ArticlesListPage";
import AboutPage from "@/features/public-site/about/AboutPage";
import PartnersPage from "@/features/public-site/partners/PartnersPage";
import HomePage from "@/features/public-site/home/HomePage";
import NewsSectionPage from "@/features/public-site/sections/NewsSectionPage";
import { STATIC_SECTIONS } from "@/features/public-site/sections/news-sections";
import StaticPage from "@/features/public-site/static-pages/StaticPage";
import ToolsOverviewPage from "@/features/public-site/static-pages/ToolsOverviewPage";
import StandaloneToolPage from "@/features/tools/StandaloneToolPage";
import ToolsIndexPage from "@/features/tools/ToolsIndexPage";
import ProtectedRoute from "@/router/ProtectedRoute";
import RequirePermission from "@/router/RequirePermission";
import RequireSuperAdmin from "@/router/RequireSuperAdmin";
import { PERMISSIONS, ROUTES } from "@/router/routes";
import { Navigate, Route, Routes } from "react-router-dom";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<HomePage />} />
        <Route path={ROUTES.ARTICLES} element={<ArticlesListPage />} />
        <Route path={ROUTES.CATEGORY} element={<CategoryPage />} />
        {STATIC_SECTIONS.map((section) => (
          <Route
            key={section.path}
            path={section.path}
            element={<NewsSectionPage />}
          />
        ))}
        <Route path="/articles/:id" element={<ArticlePage />} />
        <Route path={ROUTES.ABOUT} element={<AboutPage />} />
        <Route path={ROUTES.PARTNERS} element={<PartnersPage />} />
        <Route
          path={ROUTES.WHO_WE_ARE}
          element={
            <StaticPage
              pageKey="who_we_are"
              title="تعرف علينا"
              fallback="<p>نعمل على تمكين الصحفيين والمجتمع من مواجهة المعلومات المضللة.</p>"
            />
          }
        />
        <Route
          path={ROUTES.CONTACT}
          element={
            <StaticPage
              pageKey="contact"
              title="تواصل معنا"
              fallback="<p>للاستفسارات والبلاغات، راسلنا عبر البريد الإلكتروني.</p>"
            />
          }
        />
        <Route
          path={ROUTES.SITE_POLICY}
          element={
            <StaticPage
              pageKey="site_policy"
              title="سياسة الموقع"
              fallback="<p>سياسة استخدام الموقع.</p>"
            />
          }
        />
        <Route
          path={ROUTES.TERMS}
          element={
            <StaticPage
              pageKey="terms"
              title="الشروط والأحكام"
              fallback="<p>شروط استخدام المنصة.</p>"
            />
          }
        />
        <Route path={ROUTES.TOOLS_OVERVIEW} element={<ToolsOverviewPage />} />
      </Route>

      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <NewsroomLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.NEWSROOM} element={<NewsroomDashboard />} />
        <Route
          path={ROUTES.NEWSROOM_ARTICLES}
          element={
            <RequirePermission permission={PERMISSIONS.VIEW_ARTICLES}>
              <NewsroomArticlesPage />
            </RequirePermission>
          }
        />
        <Route
          path={ROUTES.NEWSROOM_ARTICLE_NEW}
          element={
            <RequirePermission permission={PERMISSIONS.CREATE_ARTICLES}>
              <PublishingFlow />
            </RequirePermission>
          }
        />
        <Route
          path="/newsroom/articles/:id/edit"
          element={
            <RequirePermission permission={PERMISSIONS.EDIT_ARTICLES}>
              <PublishingFlow />
            </RequirePermission>
          }
        />
        <Route
          path="/newsroom/articles/:id"
          element={
            <RequirePermission permission={PERMISSIONS.VIEW_ARTICLES}>
              <StaffArticleDetailPage />
            </RequirePermission>
          }
        />
        <Route
          path={ROUTES.NEWSROOM_TOOLS}
          element={
            <RequirePermission permission={PERMISSIONS.ACCESS_TOOLS}>
              <ToolsIndexPage />
            </RequirePermission>
          }
        />
        <Route
          path="/newsroom/tools/:tool"
          element={
            <RequirePermission permission={PERMISSIONS.ACCESS_TOOLS}>
              <StandaloneToolPage />
            </RequirePermission>
          }
        />
        <Route
          path={ROUTES.NEWSROOM_CALENDAR}
          element={
            <RequirePermission
              permissions={[
                PERMISSIONS.VIEW_TASKS,
                PERMISSIONS.VIEW_EVENTS,
                PERMISSIONS.VIEW_ALL_CALENDAR,
                PERMISSIONS.VIEW_CALENDAR,
              ]}
            >
              <CalendarView />
            </RequirePermission>
          }
        />
        <Route
          path={ROUTES.NEWSROOM_LIBRARY}
          element={
            <RequirePermission permission={PERMISSIONS.VIEW_LIBRARY}>
              <LibraryPage />
            </RequirePermission>
          }
        />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path={ROUTES.ADMIN}
          element={
            <RequirePermission permission={PERMISSIONS.VIEW_ADMIN_DASHBOARD}>
              <AdminDashboardPage />
            </RequirePermission>
          }
        />
        <Route
          path={ROUTES.ADMIN_TEAM}
          element={
            <RequireSuperAdmin>
              <TeamManagementPage />
            </RequireSuperAdmin>
          }
        />
        <Route
          path={ROUTES.ADMIN_ROLES}
          element={
            <RequireSuperAdmin>
              <RolesManagementPage />
            </RequireSuperAdmin>
          }
        />
        <Route
          path={ROUTES.ADMIN_CATEGORIES}
          element={
            <RequirePermission permission={PERMISSIONS.VIEW_CATEGORIES}>
              <CategoriesManagementPage />
            </RequirePermission>
          }
        />
        <Route
          path={ROUTES.ADMIN_CALENDAR}
          element={<Navigate to={ROUTES.NEWSROOM_CALENDAR} replace />}
        />
        <Route
          path={ROUTES.ADMIN_LIBRARY}
          element={<Navigate to={ROUTES.NEWSROOM_LIBRARY} replace />}
        />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
    </Routes>
  );
}
