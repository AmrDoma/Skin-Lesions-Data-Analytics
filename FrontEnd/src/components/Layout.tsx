import { Outlet, Link, useLocation } from "react-router-dom";
import "../index.css";
import ChatBot from "./ChatBot";
import { Toaster } from "react-hot-toast";

type RouteConfig = {
  path: string;
  title: string;
  element: React.ReactNode;
  isIndex?: boolean;
};

interface LayoutProps {
  routes: RouteConfig[];
}

function Layout({ routes }: LayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
    // Paths where the navbar should be hidden
    const hideNavbarPaths = ["/signin", "/signup", "/"];
    const shouldHideNavbar = hideNavbarPaths.includes(currentPath);
  return (
    <div className="flex flex-col min-h-screen bg-background text-text">
      <header >
        <div className="container mx-auto">
        {shouldHideNavbar ? (
          (!(currentPath === "/") )? (
            <h1 className="text-3xl font-bold text-secondary text-center">
              Skin Lesion CDSS
            </h1>
          ):null
          ) : (
            <nav className="bg-foreground shadow-md p-4">
          <ul className="flex justify-center gap-6">
            {routes.map((route) => {
              const targetPath = route.isIndex ? "/" : `/${route.path}`;
              const isActive = currentPath === targetPath;

              return (
                <li key={route.path}>
                  <Link
                    to={targetPath}
                    className={`text-secondary font-semibold hover:underline ${
                      isActive ? "border text-black px-2 py-1 rounded" : ""
                    }`}
                  >
                    {route.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        )}
        </div>
      </header>

      <main className="flex-grow container mx-auto px-0 py-8 flex justify-center items-start">
        <Outlet />
      </main>
      <Toaster position="top-right" reverseOrder={false} />

      <footer className="bg-foreground text-center p-4 text-sm">
        <p>© {new Date().getFullYear()} Skin Lesions CDSS</p>
      </footer>
      <ChatBot />
    </div>
  );
}

export default Layout;
