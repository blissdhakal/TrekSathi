import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Home,
  Book,
  LogIn,
  LogOut,
  Menu,
  X,
  MessageCircle,
  UserPlus,
  Sun,
  Moon,
  Bell,
  User,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";

import authService from "@/services/auth";
import profileService from "@/services/profile"; // Import profile service
import { logout } from "@/store/authSlice";

const Navbar = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const location = useLocation();
  const authStatus = useSelector((state) => state.auth.status);
  const user = useSelector((state) => state.auth.userData);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileImage, setProfileImage] = useState(null); // State for profile image

  // Monitor scroll position to add shadow/blur effects on scroll
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch user profile image when authenticated
  useEffect(() => {
    const fetchProfileData = async () => {
      if (authStatus) {
        try {
          const profileData = await profileService.getProfileDetails();
          if (profileData?.profilePicture?.url) {
            setProfileImage(profileData.profilePicture.url);
          }
        } catch (error) {
          console.error("Failed to load profile image:", error);
        }
      }
    };

    fetchProfileData();
  }, [authStatus]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      dispatch(logout());
      setProfileImage(null); // Clear profile image
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setIsOpen(false);
  };

  const navItems = [
    {
      name: "Home",
      slug: "/",
      icon: <Home className="h-4 w-4" />,
    },
    {
      name: "My Journal",
      slug: "/journal",
      icon: <Book className="h-4 w-4" />,
    },
    {
      name: "Join Group",
      slug: "/joingroups",
      icon: <UserPlus className="h-4 w-4" />,
    },
    {
      name: "Group Chat",
      slug: "/groupchat",
      icon: <MessageCircle className="h-4 w-4" />,
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.fullName) {
      const nameParts = user.fullName.split(" ");
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase();
      }
      return user.fullName.substring(0, 2).toUpperCase();
    }
    return "TS";
  };

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "border-b bg-background/45 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-8 h-8 rounded-md flex items-center justify-center text-white font-bold">
            TS
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 group-hover:from-indigo-600 group-hover:to-purple-700 transition-all">
            TrekSathi
          </span>
        </Link>

        {/* Desktop Navigation */}
        {authStatus && (
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.slug}
                to={item.slug}
                className={cn(
                  "flex items-center justify-center mx-auto space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all relative group",
                  location.pathname === item.slug
                    ? "text-primary "
                    : "text-muted-foreground "
                )}
              >
                <div className="flex flex-col">
                  <span className="flex items-center">
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </span>

                  {/* Animated underline effect */}
                  <span
                    className={cn(
                      " h-[2px] bg-primary mt-2 rounded-full transition-all duration-300",
                      location.pathname === item.slug
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    )}
                  ></span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Authentication Section */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            {!authStatus ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleNavigation("/login")}
                  className="border-primary/20 hover:bg-primary/5"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
                <Button
                  onClick={() => handleNavigation("/signup")}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white transition-all duration-300"
                >
                  Sign up
                </Button>
              </>
            ) : (
              <>
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="rounded-full p-0 h-10 w-10 overflow-hidden border-2 border-primary/10 hover:border-primary/30 transition-all"
                    >
                      <Avatar>
                        <AvatarImage
                          src={profileImage}
                          alt={user?.fullName || "User"}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleNavigation("/userprofile")}
                    >
                      <User className="h-4 w-4 mr-2" /> Profile
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-500 focus:text-red-500"
                    >
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-full">
                {isOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[300px]">
              <SheetHeader className="">
                {authStatus && (
                  <div className="mb-6 flex items-center gap-4 pb-4 border-b">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={profileImage}
                        alt={user?.fullName || "User"}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-start flex-col">
                      <span className="font-medium">
                        {user?.fullName || "User"}
                      </span>
                      <span className="text-xs text-muted-foreground truncate max-w-[180px]">
                        {user?.email || "user@example.com"}
                      </span>
                    </div>
                  </div>
                )}
              </SheetHeader>

              <div className="flex flex-col h-[85vh] ">
                <div className="flex-grow flex flex-col space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.slug}
                      to={item.slug}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-md text-sm font-medium transition-all",
                        location.pathname === item.slug
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        {item.icon}
                        {item.name}
                      </span>
                    </Link>
                  ))}
                </div>

                <div className="pt-4 space-y-3 border-t">
                  {!authStatus ? (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button
                        variant="outline"
                        className="w-full justify-center"
                        onClick={() => handleNavigation("/login")}
                      >
                        Login
                      </Button>
                      <Button
                        className="w-full justify-center bg-gradient-to-r from-indigo-500 to-purple-600"
                        onClick={() => handleNavigation("/signup")}
                      >
                        Sign up
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full justify-start border-red-200 text-red-500 hover:bg-red-50/50 hover:text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
