import PublicLayout from "@/layouts/PublicLayout";
import HomePage from "@/features/public-site/home/HomePage";
import { STATIC_SECTIONS } from "@/features/public-site/sections/news-sections";
import { PageLoading } from "@/components/loading-spinner";
import ProtectedRoute from "@/router/ProtectedRoute";
import RequirePermission from "@/router/RequirePermission";
import RequireSuperAdmin from "@/router/RequireSuperAdmin";
import { PERMISSIONS, ROUTES } from "@/router/routes";
import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const AdminLayout = lazy(() => import("@/layouts/AdminLayout"));
const NewsroomLayout = lazy(() => import("@/layouts/NewsroomLayout"));
const CategoriesManagementPage = lazy(
  () => import("@/features/admin/categories/CategoriesManagementPage"),
);
const AdminAnalyticsPage = lazy(
  () => import("@/features/admin/analytics/AdminAnalyticsPage"),
);
const AdminDashboardPage = lazy(
  () => import("@/features/admin/dashboard/AdminDashboardPage"),
);
const LibraryPage = lazy(
  () => import("@/features/newsroom/library/LibraryPage"),
);
const PlatformFeedbackPage = lazy(
  () => import("@/features/platform-feedback/PlatformFeedbackPage"),
);
const ContentRatingsPage = lazy(
  () => import("@/features/trust-index/pages/ContentRatingsPage"),
);
const TrustIndexPlatformPage = lazy(
  () => import("@/features/trust-index/pages/TrustIndexPlatformPage"),
);
const RolesManagementPage = lazy(
  () => import("@/features/admin/roles/RolesManagementPage"),
);
const RoleEditPage = lazy(() => import("@/features/admin/roles/RoleEditPage"));
const TeamManagementPage = lazy(
  () => import("@/features/admin/team/TeamManagementPage"),
);
const LoginPage = lazy(() => import("@/features/auth/LoginPage"));
const CalendarPage = lazy(() => import("@/features/calendar/CalendarPage"));
const StaffArticleDetailPage = lazy(
  () => import("@/features/newsroom/articles/StaffArticleDetailPage"),
);
const NewsroomArticlesPage = lazy(
  () => import("@/features/newsroom/articles/NewsroomArticlesPage"),
);
const PublishingFlow = lazy(
  () => import("@/features/publishing-flow/PublishingFlow"),
);
const CategoryPage = lazy(
  () => import("@/features/public-site/categories/CategoryPage"),
);
const ArticlePage = lazy(
  () => import("@/features/public-site/article-page/ArticlePage"),
);
const ArticlesListPage = lazy(
  () => import("@/features/public-site/articles/ArticlesListPage"),
);
const AboutPage = lazy(() => import("@/features/public-site/about/AboutPage"));
const PartnersPage = lazy(
  () => import("@/features/public-site/partners/PartnersPage"),
);
const NewsSectionPage = lazy(
  () => import("@/features/public-site/sections/NewsSectionPage"),
);
const StaticPage = lazy(
  () => import("@/features/public-site/static-pages/StaticPage"),
);
const ToolsOverviewPage = lazy(
  () => import("@/features/public-site/static-pages/ToolsOverviewPage"),
);
const StandaloneToolPage = lazy(
  () => import("@/features/tools/StandaloneToolPage"),
);
const ToolsIndexPage = lazy(() => import("@/features/tools/ToolsIndexPage"));

function RouteFallback() {
  return <PageLoading className="min-h-[50vh]" />;
}

export function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
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
          <Route path={ROUTES.ARTICLE} element={<ArticlePage />} />
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
          <Route
            path={ROUTES.NEWSROOM}
            element={<Navigate to={ROUTES.NEWSROOM_ARTICLES} replace />}
          />
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
            path={ROUTES.NEWSROOM_ARTICLE_EDIT}
            element={
              <RequirePermission permission={PERMISSIONS.EDIT_ARTICLES}>
                <PublishingFlow />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.NEWSROOM_ARTICLE_VIEW}
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
            path={ROUTES.NEWSROOM_TOOL}
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
                ]}
              >
                <CalendarPage />
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
          <Route
            path={ROUTES.NEWSROOM_TRUST_INDEX}
            element={
              <RequirePermission permission={PERMISSIONS.VIEW_TRUST_INDEX}>
                <TrustIndexPlatformPage />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.NEWSROOM_CONTENT_RATINGS}
            element={
              <RequirePermission permission={PERMISSIONS.VIEW_TRUST_INDEX}>
                <ContentRatingsPage />
              </RequirePermission>
            }
          />
          <Route
            path={ROUTES.NEWSROOM_PLATFORM_FEEDBACK}
            element={
              <RequirePermission permission={PERMISSIONS.VIEW_PLATFORM_FEEDBACK}>
                <PlatformFeedbackPage />
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
            path={ROUTES.ADMIN_ANALYTICS}
            element={
              <RequirePermission permission={PERMISSIONS.VIEW_ADMIN_DASHBOARD}>
                <AdminAnalyticsPage />
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
            path={ROUTES.ADMIN_ROLE_EDIT}
            element={
              <RequireSuperAdmin>
                <RoleEditPage />
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
    </Suspense>
  );
}
