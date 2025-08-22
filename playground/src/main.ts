import { createApp, createRouter } from "@multiview/framework-frontend";
import { path, param } from "@multiview/framework-frontend/builder";

import projectPackage from "../package.json" with { assert: "json" };

import { LoaderText } from "./templates/components/LoaderText";

const LayoutBase = () => import("./templates/layouts/LayoutBase");
const LayoutAuth = () => import("./templates/layouts/LayoutAuth");

const PagesController = () => import("./controllers/pages_controller");
const AuthController = () => import("./controllers/auth_controller");

const baseRouter = createRouter({ layout: LayoutBase })
	.addRoute("/", () => import("./controllers/home_controller"))
	.addRoute("/about", [PagesController, "about"])
	.addRoute("/contact", [PagesController, "contact"])
	.addRoute(path("/pages", param("page")), [PagesController, "dynPage"])
;

const authRouter = createRouter({ prefix: "/auth", layout: LayoutAuth })
	.addRoute({
		path: "/login",
		handler: [AuthController, "login"],
		index: true, // forward to `/:prefix`
	})
	.addRoute("/logout", [AuthController, "logout"])
	.addRoute("/register", [AuthController, "register"])
;

const app = createApp(projectPackage.name, projectPackage.version, {
	el: document.querySelector("#app"),
	loader: LoaderText,
})
	.router(baseRouter)
	.router(authRouter)
	// Lazy Router, eg: from an external package
	.router(() => import("./com.example/features/my-feature/my-feature.routes"))
;

await app.start();
