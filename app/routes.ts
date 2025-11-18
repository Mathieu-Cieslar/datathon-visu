import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("simulateur", "routes/simulateur.tsx"),
  route("analytics", "routes/analytics.tsx"),
  route("dpe", "routes/dpe.tsx"),
] satisfies RouteConfig;
