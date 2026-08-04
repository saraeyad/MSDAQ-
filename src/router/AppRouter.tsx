import { AppRoutes } from "@/router/AppRoutes";
import { ScrollToTop } from "@/router/ScrollToTop";
import { BrowserRouter } from "react-router-dom";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}
