import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Shell } from "./components/Shell";
import { ArchivePage } from "./pages/ArchivePage";
import { ArticlePage } from "./pages/ArticlePage";
import { Home } from "./pages/Home";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Shell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<ArchivePage />} />
          <Route path="/journal/:slug" element={<ArticlePage />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
