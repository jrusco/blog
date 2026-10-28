import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ArticlePage } from "./pages/ArticlePage";
import { Home } from "./pages/Home";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/journal/:slug" element={<ArticlePage />} />
      </Routes>
    </BrowserRouter>
  );
}
