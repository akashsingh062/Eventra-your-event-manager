import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("token") || null
  );
  const [loading, setLoading] = useState(true);

  // Load user on refresh
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/api/auth/profile");
        setUser(data);
        console.log("LOADED USER:", data);
      } catch (error) {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Login
  const login = async (credentials) => {
    try {
      const { data } = await api.post("/api/auth/login", credentials);
      const { token, ...userData } = data;
      localStorage.setItem("token", token);
      setToken(token);
      setUser(userData);
      toast.success("Logged in successfully");
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed"
      );
      return false;
    }
  };

  // Register
  const register = async (formData) => {
    try {
      const { data } = await api.post("/api/auth/register", formData);
      const { token, ...userData } = data;
      localStorage.setItem("token", token);
      setToken(token);
      setUser(userData);
      toast.success("Account created successfully");
      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Registration failed"
      );
      return false;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    toast.info("Logged out");
  };
  

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);