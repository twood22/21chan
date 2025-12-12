import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ScrollToTop } from "./components/ScrollToTop";

import HomePage from "./pages/HomePage";
import BoardPage from "./pages/BoardPage";
import ThreadPage from "./pages/ThreadPage";
import { NIP19Page } from "./pages/NIP19Page";
import NotFound from "./pages/NotFound";

export function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* 21chan routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/:boardId" element={<BoardPage />} />
        <Route path="/:boardId/catalog" element={<BoardPage />} />
        <Route path="/:boardId/thread/:threadId" element={<ThreadPage />} />
        {/* NIP-19 route for npub1, note1, naddr1, nevent1, nprofile1 */}
        <Route path="/n/:nip19" element={<NIP19Page />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
export default AppRouter;