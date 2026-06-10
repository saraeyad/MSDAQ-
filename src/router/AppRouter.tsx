import MainLayout from "@/layout";
import PublicLayout from "@/layout/public-layout";
import ProtectedRoute from "@/router/ProtectedRoute";
import RoleRoute from "@/router/RoleRoute";
import { ROUTES } from "@/router/routes";
import {
  AdminDashboard,
  AdminDiscussionModeration,
  JournalistRequestDetail,
  JournalistRequestsList,
} from "@/views/admin";
import { ArticleDetail, ArticlesList } from "@/views/articles";
import { Login, Register } from "@/views/auth";
import { CredibilityChecker } from "@/views/credibility";
import { DiscussionBoard } from "@/views/discussion";
import { Home } from "@/views/home";
import { ImageVerificationPublic } from "@/views/tools/image-verification";
import { SmartEditorPublic } from "@/views/tools/smart-editor";
import {
  JournalistArchive,
  JournalistDashboard,
  SmartEditor,
} from "@/views/journalist";
import { JournalistApply } from "@/views/journalist-requests";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import i18n from "../i18n";

function I18nGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(i18n.isInitialized);

  useEffect(() => {
    if (i18n.isInitialized) {
      document.dir = i18n.dir(i18n.language);
      setReady(true);
      return;
    }

    const onReady = () => {
      document.dir = i18n.dir(i18n.language);
      setReady(true);
    };

    i18n.on("initialized", onReady);
    return () => {
      i18n.off("initialized", onReady);
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
}

function AppRoutes() {
  const { i18n: i18nInstance } = useTranslation();

  return (
    <>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path={ROUTES.HOME} element={<Home />} />
          <Route path={ROUTES.ARTICLES} element={<ArticlesList />} />
          <Route path={ROUTES.DISCUSSION} element={<DiscussionBoard />} />
          <Route path={ROUTES.CREDIBILITY} element={<CredibilityChecker />} />
          <Route path={ROUTES.SMART_EDITOR_DEMO} element={<SmartEditorPublic />} />
          <Route path={ROUTES.IMAGE_VERIFICATION} element={<ImageVerificationPublic />} />
          <Route path="/articles/:id" element={<ArticleDetail />} />
        </Route>

        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />

        <Route
          path={ROUTES.JOURNALIST_APPLY}
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["normal_user"]}>
                <JournalistApply />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["admin"]}>
                <MainLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route
            path="journalist-requests"
            element={<JournalistRequestsList />}
          />
          <Route
            path="journalist-requests/:id"
            element={<JournalistRequestDetail />}
          />
          <Route path="discussion" element={<AdminDiscussionModeration />} />
        </Route>

        <Route
          path="/journalist"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["journalist"]}>
                <MainLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<JournalistDashboard />} />
          <Route path="editor" element={<SmartEditor />} />
          <Route path="archive" element={<JournalistArchive />} />
        </Route>
      </Routes>
      <Toaster position="top-center" dir={i18nInstance.dir()} />
    </>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <I18nGate>
        <AppRoutes />
      </I18nGate>
    </BrowserRouter>
  );
}
