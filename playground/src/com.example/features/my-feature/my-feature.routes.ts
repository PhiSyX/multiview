import { createRouter } from "@multiview/framework-frontend";

export default [
	createRouter({ prefix: "/my-feature" })
		.addRoute("/", () => import("./my-feature.view")),
];
