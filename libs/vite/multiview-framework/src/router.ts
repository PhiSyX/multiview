import type { Option } from "@phisyx/safety.js/contracts";
import type { LazyComponentLayout } from "#root/component";
import type {
	LazyRenderClass, RenderClass,
	RouteHandler, RouteID, RouteLiteral,
	TupleHandler, LazyTupleHandler
} from "#root/route";
import type { RoutePathLiteral } from "#root/route_path";

import { None } from "@phisyx/safety.js/option";
import { Route } from "#root/route"
import { RouteBuilder } from "#root/route_builder";
import { RoutePath } from "#root/route_path";

// ---- //
// Type //
// ---- //

export type LazyRouters = () => Promise<{ default: Array<Router> }>;

export interface RouterOptions
{
	layout?: LazyComponentLayout;
	prefix?: `/${string}` | "/";
}

// -------------- //
// Implémentation //
// -------------- //

export class Router
{
	#prefix: NonNullable<RouterOptions["prefix"]> = "/";
	#layout: Option<NonNullable<RouterOptions["layout"]>> = None();
	#routes: Map<RouteID, Route> = new Map();

	constructor(options?: RouterOptions)
	{
		if (options?.layout) {
			this.#layout.replace(options.layout);
		}

		if (options?.prefix) {
			this.#prefix = options.prefix;
		}
	}

	getPrefix(): NonNullable<RouterOptions["prefix"]>
	{
		return this.#prefix;
	}

	hasPrefix(): boolean
	{
		return this.#prefix.length > 0;
	}

	getLayout(): Option<NonNullable<RouterOptions["layout"]>>
	{
		return this.#layout;
	}

	getRoutes(): MapIterator<Route>
	{
		return this.#routes.values();
	}

	/**
	 * Ajoute une route au routeur.
	 *
	 * @param route objet literal `RouteLiteral` ou builder `RouteBuilder`
	 */
	addRoute<C>(route: RouteLiteral<C> | RouteBuilder): this;

	/**
	 * Ajoute une route au routeur.
	 *
	 * @param path chemin de la route
	 * @param handler classe ayant une méthode `render`.
	 */
	addRoute(path: RoutePathLiteral, handler: RenderClass): this;

	/**
	 * Ajoute une route au routeur.
	 *
	 * @param path chemin de la route
	 * @param handler import dynamique contenant un export `default`
	 * comportant une classe avec une méthode `render`.
	 */
	addRoute(path: RoutePathLiteral, handler: LazyRenderClass): this;

	/**
	 * Ajoute une route au routeur.
	 *
	 * @param path chemin de la route
	 * @param handler tuple contenant en 1ère position) une classe ayant en
	 * la méthode de la 2ème position du tuple.
	 */
	addRoute<C>(path: RoutePathLiteral, handler: TupleHandler<C>): this;

	/**
	 * Ajoute une route au routeur.
	 *
	 * @param path chemin de la route
	 * @param handler tuple contenant en 1ère position) un import dynamique
	 * contenant un export `default` comportant une classe ayant en la méthode
	 * de la 2ème position du tuple.
	 */
	addRoute<C>(path: RoutePathLiteral, handler: LazyTupleHandler<C>): this;

	addRoute<C>(path: RoutePath, handler: LazyRenderClass): this;
	addRoute<C>(path: RoutePath, handler: RenderClass): this;
	addRoute<C>(path: RoutePath, handler: LazyTupleHandler<C>): this;
	addRoute<C>(path: RoutePath, handler: TupleHandler<C>): this;

	addRoute<C = any>(
		rp: RouteBuilder | RoutePath | RouteLiteral<C> | RoutePathLiteral,
		handler?: RouteHandler<C>
	): this
	{
		let rb = new RouteBuilder().withPrefix(this.#prefix);

		if (handler) {
			rb = rb.withHandler(handler);
		}

		if (rp instanceof RoutePath) {
			rb = rb.withPath(rp);
		} else if (rp instanceof RouteBuilder) {
			rb = rp;
		} else if (typeof rp === "object") {
			rb = rb.withPath(rp.path).withHandler(rp.handler);

			if (rp.index) {
				rb = rb.asIndex();
			}
		} else if (handler) {
			rb = rb.withPath(rp);
		}

		const route = rb.build();

		this.#routes.set(route.getId(), route);

		return this;
	}
}
