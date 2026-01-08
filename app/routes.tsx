import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";

export default [
  index("modules/home.tsx"),

  // Auth modules
  layout("modules/auth/_layout.tsx", [
    route("/login", "modules/auth/login/index.tsx"),
    route("/register", "modules/auth/register/index.tsx"),
  ]),

  layout("modules/_layout.tsx", [
    route("/dashboard", "modules/dashboard/index.tsx"),

    // Tests routes
    ...prefix("/tests", [
      index("modules/tests/index.tsx"),
      ...prefix("/:testId", [
        index("modules/tests/modules/$testId/index.tsx"),
        route("/result", "modules/tests/modules/$testId/result.tsx"),
      ]),
    ]),

    // Profile routes
    ...prefix("/profile", [route("/", "modules/profile/index.tsx")]),
  ]),
] satisfies RouteConfig;
