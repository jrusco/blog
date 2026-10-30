import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { ArchivePage } from "./pages/ArchivePage";
import { Home } from "./pages/Home";
import { NotFound } from "./pages/NotFound";

const ArticlePage = lazy(() => import("./pages/ArticlePage").then((module) => ({ default: module.ArticlePage })));

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Shell>
        <Suspense fallback={<div className="min-h-dvh" />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/archive" element={<ArchivePage />} />
            <Route path="/journal/:slug" element={<ArticlePage />} />
            <Route path="*" element={<NotFound kind="route" />} />
          </Routes>
        </Suspense>
      </Shell>
    </BrowserRouter>
  );
}
