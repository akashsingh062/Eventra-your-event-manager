import Navbar from "./components/common/Navbar";
import AdminSidebar from "./components/admin/AdminSidebar";
import { useAuth } from "./context/AuthContext";
import Footer from "./components/common/Footer";
import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      {user?.role === "admin" ? (
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 ml-64 pb-32 pt-16">
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
