import { RoutePath, type RoutePathLiteral } from "#root/route_path";

// ---- //
// Type //
// ---- //

export type RenderClass = { new (): { render(): any } };
export type LazyRenderClass = () => Promise<{ default: RenderClass }>;

export type TupleHandler<C> = C extends { new (): infer I }
	? [cls: C, method: keyof I]
	: never;
export type LazyTupleHandler<C> = C extends { new (): infer I }
	? [cls: () => Promise<{ default: C }>, method: keyof I]
	: never;

export type RouteHandler<C = any> =
	| LazyRenderClass
	| RenderClass
	| LazyTupleHandler<C>
	| TupleHandler<C>;

export type RouteID = string;

export interface RouteLiteral<C>
{
	/**
	 * Chemin de la route
	 */
	path: RoutePathLiteral;
	/**
	 * Handle de la route
	 */
	handler: RouteHandler<C>;
	/**
	 * La route est marquée comme un index, autrement dit, elle est accessible
	 * via le chemin "/" en plus du chemin défini via `path`.
	 */
	index: boolean;
}

// -------------- //
// Implémentation //
// -------------- //

export class Route
{
	#id: RouteID;
	#path: RoutePath;
	#handler: RouteHandler;
	#index: boolean = false;

	constructor(id: RouteID, path: string, handler: RouteHandler)
	{
		this.#id = id;
		this.#path = RoutePath.fromLiteral(path);
		this.#handler = handler;
	}

	getId(): RouteID
	{
		return this.#id;
	}

	getPath(): RoutePath
	{
		return this.#path;
	}

	getHandler(): RouteHandler
	{
		return this.#handler;
	}

	withIndex(index: boolean): this
	{
		this.#index = index;
		return this;
	}

	isIndex(): boolean
	{
		return this.#index;
	}
}
