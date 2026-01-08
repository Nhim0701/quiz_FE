import {
  index,
  layout,
  prefix,
  route,
  type RouteConfig,
} from "@react-router/dev/routes";
import { ROUTES } from "./constants";

export default [
  index("modules/home.tsx"),

  // Auth modules
  layout("modules/auth/_layout.tsx", [
    route(ROUTES.LOGIN, "modules/auth/login.tsx"),
    route(ROUTES.REGISTER, "modules/auth/register.tsx"),
  ]),

  layout("modules/_layout.tsx", [
    route(ROUTES.DASHBOARD, "modules/dashboard/index.tsx"),

    // Tests routes
    ...prefix(ROUTES.TESTS.INDEX, [
      index("modules/tests/index.tsx"),

      ...prefix(ROUTES.TESTS.TEST_ID, [
        index("modules/tests/modules/$testId/index.tsx"),
        route(ROUTES.TESTS.TAKE(), "modules/tests/modules/$testId/take.tsx"),
        route(
          ROUTES.TESTS.RESULT(),
          "modules/tests/modules/$testId/result.tsx"
        ),
      ]),
    ]),

    // Profile routes
    ...prefix(ROUTES.PROFILE, [index("modules/profile/index.tsx")]),
  ]),
] satisfies RouteConfig;
