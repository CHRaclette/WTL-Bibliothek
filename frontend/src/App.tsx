import { AppRoutes } from "./router/router";
import { Header } from "./components/Header";
import {Footer} from "./components/Footer"
export default function App() {
  return (
    <>
      <Header />
      <AppRoutes />
      <Footer />
    </>
  );
}