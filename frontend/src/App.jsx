import Navbar from "./components/common/Navbar";
import AdminSidebar from "./components/admin/AdminSidebar";
import { useAuth } from "./context/AuthContext";
import Footer from "./components/common/Footer";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-cream-900 dark:bg-navy-100 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {user?.role === "admin" ? (
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 ml-0 md:ml-64 pb-32 pt-6 min-h-screen">
            <AppRoutes />
          </main>
        </div>
      ) : (
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pb-32">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      )}
    </div>
  );
};

export default App;
