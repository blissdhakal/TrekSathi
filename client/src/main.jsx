import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App";
import { store } from "./store/store";
import Details from "./Pages/Details";
import SignupPage from "./Pages/Signup";
import Login from "./Pages/Login";
import Social from "./Pages/Social";
import Protected from "./components/Protected";
import TrekItinerary from "./Pages/TrekItinerary";
import GroupFormation from "./Pages/GroupFormation";
import "./index.css";
import UsersHomePage from "./Pages/UsersHomePage";
import ChatBot from "./components/ChatBot";
import UserProfile from "./Pages/UserProfile";
import JoinGroups from "./Pages/JoinGroups";
import { ThemeProvider } from "./components/theme-provider";

import GroupChat from "./Pages/GroupChat";

import Home from "./Pages/Landing/Home";
import Journal from "./Pages/Journal";

const publicRoutes = [
  {
    path: "/",
    element: (
      <Protected authentication={false} redirectPath="/usershomepage">
        <Home />
      </Protected>
    ),
  },
];

const authRoutes = [
  {
    path: "/login",
    element: (
      <Protected authentication={false} redirectPath="/usershomepage">
        <Login />
      </Protected>
    ),
  },
  {
    path: "/signup",
    element: (
      <Protected authentication={false} redirectPath="/usershomepage">
        <SignupPage />
      </Protected>
    ),
  },
];

const protectedRoutes = [
  {
    path: "/details/:slug",
    element: (
      <Protected authentication={true}>
        <Details />
      </Protected>
    ),
  },
  {
    path: "/userprofile",
    element: (
      <Protected authentication={true}>
        <UserProfile />
      </Protected>
    ),
  },
  {
    path: "/journal",
    element: (
      <Protected authentication={true}>
        <Journal />
      </Protected>
    ),
  },
  {
    path: "/groupformation",
    element: (
      <Protected authentication={true}>
        <GroupFormation />
      </Protected>
    ),
  },
  {
    path: "/social",
    element: (
      <Protected authentication={true}>
        <Social />
      </Protected>
    ),
  },
  {
    path: "/usershomepage",
    element: (
      <Protected authentication={true}>
        <UsersHomePage />
      </Protected>
    ),
  },
  {
    path: "/chatbot",
    element: (
      <Protected authentication={true}>
        <ChatBot />
      </Protected>
    ),
  },
  {
    path: "/group",
    element: (
      <Protected authentication={true}>
        <GroupFormation />
      </Protected>
    ),
  },
  {
    path: "/trekitinerary/:slug",
    element: (
      <Protected authentication={true}>
        <TrekItinerary />
      </Protected>
    ),
  },
  {
    path: "/joingroups",
    element: (
      <Protected authentication={true}>
        <JoinGroups />
      </Protected>
    ),
  },
  {
    path: "/GroupChat",
    element: (
      <Protected authentication={true}>
        <GroupChat />
      </Protected>
    ),
  },
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [...publicRoutes, ...authRoutes, ...protectedRoutes],
  },
]);

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
