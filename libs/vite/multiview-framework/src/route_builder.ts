import type { Option } from "@phisyx/safety.js/contracts";
import type { LazyRenderClass, LazyTupleHandler, RenderClass, RouteHandler, TupleHandler } from "#root/route";
import type { RoutePathLiteral } from "#root/route_path";

import { StringExtension } from "@phisyx/proposals.js/lang/string";
import { None } from "@phisyx/safety.js/option";
import { Route } from "#root/route";

export class RouteBuilder
{
	#prefix: StringExtension = new StringExtension("/");
	#path: Option<RoutePathLiteral> = None();
	#handler: Option<RouteHandler> = None();
	#index = false;

	withPrefix(prefix: RoutePathLiteral | "/"): this
	{
		this.#prefix = new StringExtension(prefix);
		return this;
	}

	withPath(path: RoutePathLiteral): this
	{
		this.#path.replace(path);
		return this;
	}

	withHandler(handler: LazyRenderClass): this;
	withHandler(handler: RenderClass): this;
	withHandler<C extends { new (): I }, I, T extends LazyTupleHandler<C> = LazyTupleHandler<C>>(c: T[0], m: T[1]): this;
	withHandler<C extends { new (): I }, I, T extends TupleHandler<C> = TupleHandler<C>>(c: T[0], m: T[1]): this;
	withHandler(h: RouteHandler, m?: string): this
	{
		if (h instanceof Function && m) this.#handler.replace([h, m]);
		else this.#handler.replace(h);
		return this;
	}

	asIndex(): this
	{
		this.#index = true;
		return this;
	}

	build(): Route
	{
		if (this.#path.is_none() && this.#handler.is_none()) {
			throw new Error("RouteBuilder is not fully configured");
		}

		const routeId = crypto.randomUUID();
		const routePath = this.#prefix.trimEnd("/").push(this.#path.unwrap());
		const route = new Route(routeId, routePath.toString(), this.#handler.unwrap())
			.withIndex(this.#index)
		;

		return route;
	}
}
