import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import Navbar from "./components/navbar";
import authService from "./services/auth";
import { login, logout } from "./store/authSlice";
import "./App.css";
import Footer from "./components/Footer";

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  const authStatus = useSelector((state) => state.auth.status);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const session = await authService.getCurrentUser();
        if (session?.data?.data) {
          dispatch(login(session.data.data));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        console.error("Authentication error:", error);
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    return () => {
      setLoading(false);
    };
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="loader"></p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" richColors closeButton theme="light" />
      <Navbar />
      <Outlet />

      <Footer />
    </>
  );
}

export default App;
