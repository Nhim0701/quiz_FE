import { index, layout, prefix, route } from "@react-router/dev/routes";
import { ROUTES as AUTH_ROUTES } from "./modules/common/auth/constants";
import { ROUTES as DASHBOARD_ROUTES } from "./modules/user/modules/dashboard/constants";
import { ROUTES as PROFILE_ROUTES } from "./modules/user/modules/profile/constants";
import { ROUTES as TESTS_ROUTES } from "./modules/user/modules/tests/constants";
import { ROUTES as ADMIN_TESTS_ROUTES } from "./modules/admin/modules/tests/constants/";
import { ROUTES as ADMIN_CATEGORIES_ROUTES } from "./modules/admin/modules/categories/constants";
import { ROUTES as ADMIN_QUESTIONS_ROUTES } from "./modules/admin/modules/questions/constants";
import { ROUTES as ADMIN_ROLES_ROUTES } from "./modules/admin/modules/roles/constants";
import { ROUTES as ADMIN_PERMISSIONS_ROUTES } from "./modules/admin/modules/permissions/constants";
import { ROUTES as ADMIN_USERS_ROUTES } from "./modules/admin/modules/users/constants";
import { ROUTES as ADMIN_NAMESPACES_ROUTES } from "./modules/admin/modules/namespaces/constants";

export default [
  index("modules/home.tsx"),

  // Auth modules
  layout("modules/common/auth/_layout.tsx", [
    route(AUTH_ROUTES.LOGIN, "modules/common/auth/login.tsx"),
    route(AUTH_ROUTES.REGISTER, "modules/common/auth/register.tsx"),
    route(AUTH_ROUTES.CHECK_EMAIL, "modules/common/auth/check-email.tsx"),
    route(AUTH_ROUTES.ACTIVATE, "modules/common/auth/activate.tsx"),
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
          TESTS_ROUTES.RESULT_BY_SUBMISSION(),
          "modules/user/modules/tests/routes/result.tsx", { id: "withSubmissionId" }
        ),
        route(
          TESTS_ROUTES.RESULT(),
          "modules/user/modules/tests/routes/result.tsx", { id: "withoutSubmissionId" }
        ),
      ]),
    ]),

    // Profile routes
    route(PROFILE_ROUTES.INDEX, "modules/user/modules/profile/index.tsx"),

    // Admin routes
    layout("modules/admin/_layout.tsx", [
      // Categories routes
      route(
        ADMIN_CATEGORIES_ROUTES.INDEX,
        "modules/admin/modules/categories/index.tsx"
      ),

      // Tests routes
      route(ADMIN_TESTS_ROUTES.INDEX, "modules/admin/modules/tests/index.tsx"),

      // Questions routes
      route(
        ADMIN_QUESTIONS_ROUTES.INDEX,
        "modules/admin/modules/questions/index.tsx"
      ),
      route(
        ADMIN_QUESTIONS_ROUTES.VIEW(":questionId"),
        "modules/admin/modules/questions/routes/view.tsx"
      ),

      // Users routes
      route(ADMIN_USERS_ROUTES.INDEX, "modules/admin/modules/users/index.tsx"),

      // Roles routes
      route(ADMIN_ROLES_ROUTES.INDEX, "modules/admin/modules/roles/index.tsx"),
      // Permissions routes
      route(
        ADMIN_PERMISSIONS_ROUTES.INDEX,
        "modules/admin/modules/permissions/index.tsx"
      ),

      // Namespaces routes
      route(
        ADMIN_NAMESPACES_ROUTES.INDEX,
        "modules/admin/modules/namespaces/index.tsx"
      ),

      // Edit routes
    ]),
  ]),
  route("/edit", "modules/admin/modules/edit/index.tsx"),
];
