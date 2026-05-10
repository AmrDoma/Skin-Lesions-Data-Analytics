import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import SignIn from "./pages/SignInPage";
import SignUp from "./pages/SignUpPage";
import "./index.css";

// Define route configuration as a list
const routes = [
  {
    path: "/",
    element: <Dashboard />,
    title: "Dashboard",
    isIndex: true,
  },
  {
    path: "signin",
    element: <SignIn />,
    title: "Sign In",
  },
  {
    path: "signup",
    element: <SignUp />,
    title: "Sign Up",
  }
];

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout routes={routes} />}>
        {routes.map((route) =>
          route.isIndex ? (
            <Route index element={route.element} key={route.path} />
          ) : (
            <Route path={route.path} element={route.element} key={route.path} />
          )
        )}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
