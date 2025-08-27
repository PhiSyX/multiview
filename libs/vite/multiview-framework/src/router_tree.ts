import type { Option } from "@phisyx/safety.js/contracts";
import type { Route } from "#root/route";
import type { LazyRouters, Router, RouterOptions } from "#root/router";

import { RoutePath } from "#root/route_path";

// ---- //
// Type //
// ---- //

type MatchFnOutput = Promise<
	{
		layout: Option<NonNullable<RouterOptions["layout"]>>;
		route: Route;
	}
>;

// -------------- //
// Implémentation //
// -------------- //

export class RouterTree
{
	#routers: Array<Router> = [];
	#lazyRouters: Array<LazyRouters> = [];

	add(lazyRouters: LazyRouters): this;
	add(router: Router): this;
	add(routerOrLazy: LazyRouters | Router): this
	{
		if (typeof routerOrLazy === "function") {
			this.#lazyRouters.push(routerOrLazy);
		} else {
			this.#routers.push(routerOrLazy);
		}
		return this;
	}

	async match(urlPathRaw: string): MatchFnOutput
	{
		this.#routers.push(
			...(await Promise.all(this.#lazyRouters.map(
				async (modRouter) => (await modRouter()).default
			))).flat()
		);

		this.#lazyRouters = [];

		const urlPath = RoutePath.fromLiteral(RoutePath.normalize(urlPathRaw));

		const routes: Array<Readonly<[Router, Route]>> = this.#routers.flatMap((router) =>
			Array.from(router.getRoutes(), (route) => [router, route] as const)
		);

		const r = routes.find(([router, route]) => {
			return route.getPath().eq(urlPath) || (
				route.isIndex() &&
				router.getPrefix() === urlPath.full().toString()
			);
		});

		if (!r) {
			return Promise.reject("No route found");
		};

		const [router, route] = r;

		return {
			layout: router.getLayout(),
			route,
		};
	}
}
