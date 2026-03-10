import { Routes, Route } from "react-router-dom";
import BooksPage from "../pages/BooksPage";
import AdminPage from "../pages/AdminPage";
import BookDetailsPage from "../pages/BooksDetail"
import { HomePage } from "../pages/HomePage";

export function AppRoutes() {
  return (
    <Routes>
        <Route path="/" element={<HomePage />} />
      <Route path="/books" element={<BooksPage />} />
      <Route path="/Admin" element={<AdminPage />} />
      <Route path="/books/:id" element={<BookDetailsPage />} />
    </Routes>
  );
}