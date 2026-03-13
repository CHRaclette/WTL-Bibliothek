import { Routes, Route } from "react-router-dom";
import BooksPage from "../pages/BooksPage";
import AdminPage from "../pages/Admin/AdminPage";
import BookDetailsPage from "../pages/BooksDetail"
import { HomePage } from "../pages/HomePage";
import {LoginPage} from "../pages/Auth/LoginPage";
import { AdminRoute } from "./AdminRoutes";
import AdminBooksPage from "../pages/Admin/BooksAdmin";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/Home" element={<HomePage />} />
        <Route path="/" element={<LoginPage />} />
      <Route path="/books" element={<BooksPage />} />
      <Route path="/Admin" element={<AdminPage />} />
      <Route path="/books/:id" element={<BookDetailsPage />} />
      <Route path="/admin/books" element={<AdminRoute><AdminBooksPage /></AdminRoute>}
      />
    </Routes>
  );
}