import { createBrowserRouter, type RouteObject } from "react-router-dom";

// File-based routing with folders-for-organization
// Each route is organized in a folder with route.tsx inside

/**
 * Creates a lazy route loader function
 * Automatically includes Component and/or loader if they exist in the module
 */
const createLazyRoute = (importPath: string) => {
  return async () => {
    const module = await import(importPath);
    const result: {
      Component?: typeof module.default;
      loader?: typeof module.loader;
    } = {};

    if (module.default) {
      result.Component = module.default;
    }

    if (module.loader) {
      result.loader = module.loader;
    }

    return result;
  };
};

const routes: RouteObject[] = [
  {
    path: "/",
    lazy: createLazyRoute("./_index/route"),
  },
  {
    lazy: createLazyRoute("./_auth/route"),
    children: [
      {
        path: "login",
        lazy: createLazyRoute("./_auth.login/route"),
      },
      {
        path: "register",
        lazy: createLazyRoute("./_auth.register/route"),
      },
    ],
  },
  {
    lazy: createLazyRoute("./app/route"),
    children: [
      {
        index: true,
        lazy: createLazyRoute("./app._index/route"),
      },
      {
        path: "tests",
        lazy: createLazyRoute("./app.tests/route"),
      },
      {
        path: "profile",
        lazy: createLazyRoute("./app.profile/route"),
      },
    ],
  },
  {
    path: "test",
    lazy: createLazyRoute("./test/route"),
  },
  {
    path: "result",
    lazy: createLazyRoute("./result/route"),
  },
  {
    path: "*",
    lazy: createLazyRoute("./$/route"),
  },
];

export const router = createBrowserRouter(routes);
