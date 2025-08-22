import type { LazyRouters, Router } from "#root/router";
import type { ComponentLayoutClass } from "#root/component";

import { Renderer } from "#root/renderer";
import { RouterTree } from "#root/router_tree";

// ---- //
// Type //
// ---- //

export interface ApplicationOptions
{
	el: HTMLElement | null;
	loader?: ComponentLayoutClass
}

// -------------- //
// Implémentation //
// -------------- //

export class Application
{
	/**
	 * Nom de l'application
	 */
	#name: string;

	/**
	 * Version de l'application.
	 */
	#version: string;

	/**
	 * Options de l'application
	 */
	#options: ApplicationOptions;

	/**
	 * Router de l'application
	 */
	#routerTree: RouterTree = new RouterTree();

	#renderer: Renderer = new Renderer();

	/**
	 * Constructeur de l'application
	 */
	constructor(name: string, version: string, options: ApplicationOptions)
	{
		this.#name = name;
		this.#version = version;
		this.#options = options;
	}

	/**
	 * Ajoute un routeur à l'arbre de routeurs.
	 */
	router(lazyRouters: LazyRouters): this;
	router(router: Router): this;
	router(routerOrLazy: LazyRouters | Router): this
	{
		this.#routerTree.add(routerOrLazy);
		return this;
	}

	/**
	 * Démarre l'application
	 */
	async start(): Promise<void>
	{
		const { pathname: userURLPathname } = window.location;

		const { layout, route } = await this.#routerTree.match(userURLPathname).catch(
			() => Promise.reject(new Error(
				"The application does not contain any routes containing the URL" +
				` path '${userURLPathname}'.`
			))
		);
		if (layout.is_some()) {
			this.#renderer.setLayout(layout.unwrap());
		}

		this.#renderer.setHandler(route.getHandler());

		// DOM RENDERER //

		if (this.#options.loader) {
			const loader = new this.#options.loader();
			this.#options.el?.append(loader.render());
		}

		const output = await this.#renderer.render();

		if (this.#options.loader) {
			this.#options.el?.lastElementChild?.remove();
		}

		switch (typeof output) {
			case "bigint":
			case "number":
			case "string":
			{
				this.#options.el?.append(output.toString());
			} return;

			case "boolean":
			{
				this.#options.el?.append(output ? 'true' : 'false');
			} return;
		}

		if (output instanceof Node) {
			this.#options.el?.append(output);
		} else {
			this.#options.el?.append(JSON.stringify(output));
		}

		console.log(`Starting ${this.#name} v${this.#version}`);
	}
}
