import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";
import { ROUTES } from "./constants";
import { ROUTES as AUTH_ROUTES } from "./modules/common/auth/constants";
import { ROUTES as DASHBOARD_ROUTES } from "./modules/user/dashboard/constants";
import { ROUTES as PROFILE_ROUTES } from "./modules/user/profile/constants";
import { ROUTES as TESTS_ROUTES } from "./modules/user/tests/constants";

export default [
  index("modules/home.tsx"),

  // Auth modules
  layout("modules/common/auth/_layout.tsx", [
    route(AUTH_ROUTES.LOGIN, "modules/common/auth/login.tsx"),
    route(AUTH_ROUTES.REGISTER, "modules/common/auth/register.tsx"),
  ]),

  layout("modules/_layout.tsx", [
    route(DASHBOARD_ROUTES.INDEX, "modules/user/dashboard/index.tsx"),

    // Tests routes
    ...prefix(TESTS_ROUTES.INDEX, [
      index("modules/user/tests/index.tsx"),

      ...prefix(TESTS_ROUTES.TEST_ID, [
        index("modules/user/tests/routes/$testId/index.tsx"),
        route(
          TESTS_ROUTES.TAKE(),
          "modules/user/tests/routes/$testId/take.tsx"
        ),
        route(
          TESTS_ROUTES.RESULT(),
          "modules/user/tests/routes/$testId/result.tsx"
        ),
      ]),
    ]),

    // Profile routes
    route(PROFILE_ROUTES.INDEX, "modules/user/profile/index.tsx"),

    layout("modules/admin/_layout.tsx", [
      route(ROUTES.ADMIN.CATEGORIES, "modules/admin/categories/index.tsx"),
      ...prefix(ROUTES.ADMIN.TESTS, [
        index("modules/admin/tests/index.tsx"),
        ...prefix(ROUTES.ADMIN.TEST_ID, [
          index("modules/admin/tests/$testId/index.tsx"),
        ]),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
