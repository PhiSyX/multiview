import type { Option } from "@phisyx/safety.js/contracts";
import type { Route } from "#root/route";
import type { Router, RouterOptions } from "#root/router";

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

	add(router: Router): this
	{
		this.#routers.push(router);
		return this;
	}

	async match(urlPathRaw: string): MatchFnOutput
	{
		const urlPath = RoutePath.fromLiteral(RoutePath.normalize(urlPathRaw));

		const routes: Array<Readonly<[Router, Route]>> = this.#routers.flatMap((router) =>
			Array.from(router.getRoutes(), (route) => [router, route] as const)
		);

		return Promise.any(routes.map(async ([router, route]) => {
			if ( ! (
				await route.getPath().eq(urlPath) || (
					route.isIndex() &&
					router.getPrefix() === urlPath.full().toString()
				)
			) ) return Promise.reject("No route found");

			return {
				layout: router.getLayout(),
				route,
			};
		}));
	}
}
