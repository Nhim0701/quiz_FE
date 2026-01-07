import { createBrowserRouter, type RouteObject } from "react-router-dom";

// File-based routing with folders-for-organization
// Each route is organized in a folder with route.tsx inside
const routes: RouteObject[] = [
  {
    path: "/",
    lazy: async () => {
      const module = await import("./_index/route");
      return { loader: module.loader };
    },
  },
  {
    lazy: async () => {
      const module = await import("./_auth/route");
      return { Component: module.default };
    },
    children: [
      {
        path: "login",
        lazy: async () => {
          const module = await import("./_auth.login/route");
          return { Component: module.default };
        },
      },
      {
        path: "register",
        lazy: async () => {
          const module = await import("./_auth.register/route");
          return { Component: module.default };
        },
      },
    ],
  },
  {
    lazy: async () => {
      const module = await import("./app/route");
      return { Component: module.default, loader: module.loader };
    },
    children: [
      {
        index: true,
        lazy: async () => {
          const module = await import("./app._index/route");
          return { Component: module.default };
        },
      },
      {
        path: "tests",
        lazy: async () => {
          const module = await import("./app.tests/route");
          return { Component: module.default };
        },
      },
      {
        path: "profile",
        lazy: async () => {
          const module = await import("./app.profile/route");
          return { Component: module.default };
        },
      },
    ],
  },
  {
    path: "test",
    lazy: async () => {
      const module = await import("./test/route");
      return { Component: module.default, loader: module.loader };
    },
  },
  {
    path: "result",
    lazy: async () => {
      const module = await import("./result/route");
      return { Component: module.default, loader: module.loader };
    },
  },
  {
    path: "*",
    lazy: async () => {
      const module = await import("./$/route");
      return { Component: module.default };
    },
  },
];

export const router = createBrowserRouter(routes);
