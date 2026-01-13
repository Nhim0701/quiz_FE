import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";
import { ROUTES } from "./constants";
import { ROUTES as AUTH_ROUTES } from "./modules/common/auth/constants";
import { ROUTES as DASHBOARD_ROUTES } from "./modules/user/modules/dashboard/constants";
import { ROUTES as PROFILE_ROUTES } from "./modules/user/modules/profile/constants";
import { ROUTES as TESTS_ROUTES } from "./modules/user/modules/tests/constants";
import { ROUTES as ADMIN_TESTS_ROUTES } from "./modules/admin/modules/tests/constants/";
import { ROUTES as ADMIN_CATEGORIES_ROUTES } from "./modules/admin/modules/categories/constants";

export default [
  index("modules/home.tsx"),

  // Auth modules
  layout("modules/common/auth/_layout.tsx", [
    route(AUTH_ROUTES.LOGIN, "modules/common/auth/login.tsx"),
    route(AUTH_ROUTES.REGISTER, "modules/common/auth/register.tsx"),
  ]),

  layout("modules/_layout.tsx", [
    route(DASHBOARD_ROUTES.INDEX, "modules/user/modules/dashboard/index.tsx"),

    // Tests routes
    ...prefix(TESTS_ROUTES.INDEX, [
      index("modules/user/modules/tests/index.tsx"),

      ...prefix(TESTS_ROUTES.TEST_ID, [
        index("modules/user/modules/tests/routes/index.tsx"),
        route(
          TESTS_ROUTES.TAKE(),
          "modules/user/modules/tests/routes/take.tsx"
        ),
        route(
          TESTS_ROUTES.RESULT(),
          "modules/user/modules/tests/routes/result.tsx"
        ),
      ]),
    ]),

    // Profile routes
    route(PROFILE_ROUTES.INDEX, "modules/user/modules/profile/index.tsx"),

    layout("modules/admin/_layout.tsx", [
      route(
        ADMIN_CATEGORIES_ROUTES.INDEX,
        "modules/admin/modules/categories/index.tsx"
      ),
      ...prefix(ADMIN_TESTS_ROUTES.TESTS.INDEX, [
        index("modules/admin/modules/tests/index.tsx"),
        ...prefix(ADMIN_TESTS_ROUTES.TESTS.INFO(), [
          index("modules/admin/modules/tests/routes/index.tsx"),

          // route(
          //   ADMIN_TESTS_ROUTES.TESTS.QUESTIONS.INDEX(),
          //   "modules/admin/modules/tests/routes/questions/index.tsx"
          // ),
          route(
            ADMIN_TESTS_ROUTES.TESTS.QUESTIONS.NEW(),
            "modules/admin/modules/tests/routes/questions/index.tsx"
          ),
          // route(
          //   ADMIN_TESTS_ROUTES.TESTS.QUESTIONS.EDIT(),
          //   "modules/admin/modules/tests/routes/questions/index.tsx"
          // ),
        ]),
      ]),
    ]),
  ]),
] satisfies RouteConfig;
