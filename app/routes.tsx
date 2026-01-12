import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";
import { ROUTES } from "./constants";
import { ROUTES as AUTH_ROUTES } from "./modules/common/auth/constants";

export default [
  index("modules/home.tsx"),

  // Auth modules
  layout("modules/common/auth/_layout.tsx", [
    route(AUTH_ROUTES.LOGIN, "modules/common/auth/login.tsx"),
    route(AUTH_ROUTES.REGISTER, "modules/common/auth/register.tsx"),
  ]),

  layout("modules/_layout.tsx", [
    route(ROUTES.DASHBOARD, "modules/user/dashboard/index.tsx"),

    // Tests routes
    ...prefix(ROUTES.TESTS.INDEX, [
      index("modules/user/tests/index.tsx"),

      ...prefix(ROUTES.TESTS.TEST_ID, [
        index("modules/user/tests/modules/$testId/index.tsx"),
        route(
          ROUTES.TESTS.TAKE(),
          "modules/user/tests/modules/$testId/take.tsx"
        ),
        route(
          ROUTES.TESTS.RESULT(),
          "modules/user/tests/modules/$testId/result.tsx"
        ),
      ]),
    ]),

    // Profile routes
    ...prefix(ROUTES.PROFILE, [index("modules/user/profile/index.tsx")]),

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
