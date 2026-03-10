import { AppRoutes } from "./router/router";
import { Header } from "./components/Header";
export default function App() {
  return (
    <>
      <Header />
      <AppRoutes />
    </>
  );
}