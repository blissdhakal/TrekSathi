import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Mail, Flag } from "lucide-react";
import { PiMountainsDuotone } from "react-icons/pi";
import authService from "@/services/auth";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { login as authLogin } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

const BackgroundPattern = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 opacity-5">
      {[...Array(20)].map((_, i) => (
        <React.Fragment key={i}>
          <PiMountainsDuotone
            className="absolute animate-float opacity-20 text-blue-300"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              transform: `scale(${0.5 + Math.random() * 0.5}) rotate(${
                Math.random() * 30 - 15
              }deg)`,
            }}
          />
        </React.Fragment>
      ))}
    </div>
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const login = async (data) => {
    try {
      const session = await authService.login(data);
      const userData = {
        _id: session.data.loggedInUser._id,
        fullName: session.data.loggedInUser.fullName,
        email: session.data.loggedInUser.email,
      };
      if (session?.data) {
        dispatch(authLogin(userData));
        navigate("/classroom");
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100 flex items-center justify-center p-4 relative overflow-hidden">
      <BackgroundPattern />

      <Card className="w-full max-w-md relative backdrop-blur-sm bg-white/90 border-2 border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-500">
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
          <PiMountainsDuotone className="h-16 w-16 text-[#6366f1] animate-bounce" />
        </div>

        <CardHeader className="space-y-1 pt-8">
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-sky-400 to-blue-300 bg-clip-text text-[#6366f1]">
            Welcome Back
          </CardTitle>
          <p className="text-sm text-center text-gray-600">
            Continue your journey to new heights
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(login)} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-4 h-4 w-4 text-[#6366f1]" />
                <Input
                  type="email"
                  id="email"
                  placeholder="Email Address"
                  className="pl-10 h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                      message: "Please enter a valid email address",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

          
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-4 h-4 w-4 text-[#6366f1]" />
                <Input
                  type="password"
                  id="password"
                  placeholder="Password"
                  className="pl-10 h-12 border-slate-200 focus:border-sky-400 focus:ring-sky-400"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

           
            <Button
              type="submit"
              className="w-full h-12 bg-[#6366f1] hover:from-sky-500 hover:to-blue-400 text-white font-medium rounded-lg transition-all duration-300"
            >
              Embark
              <Flag className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">New to the journey? </span>
            <br />
            <button
              onClick={() => navigate("/signup")}
              className="text-[#6366f1] hover:text-sky-600 font-medium transition-colors duration-300"
            >
              Join the Expedition (Signup)
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
