import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("about", "about/about.tsx"),
    route("users", "users/users.tsx"),
    route("users/:userId", "users/user.tsx"),
] satisfies RouteConfig;
