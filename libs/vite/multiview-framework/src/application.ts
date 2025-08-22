import type { Option } from "@phisyx/safety.js/contracts";
import type { LazyRouters, Router } from "#root/router";
import type { ComponentLayoutClass } from "#root/component";

import { None } from "@phisyx/safety.js/option";
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
		if (!this.#options.el) return Promise.reject(new Error(
			"We need an existing element in the DOM to display a view component."
		));

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

		this.#renderer.setElement(this.#options.el);

		// DOM RENDERER //

		let maybe$loader: Option<HTMLSlotElement> = None();

		if (this.#options.loader) {
			const loader = new this.#options.loader();
			const $slot = document.createElement("slot");
			$slot.name = "loader";
			$slot.append(loader.render());
			this.#options.el.appendChild($slot);
			maybe$loader.replace($slot);
		}

		await this.#renderer.render();

		if (this.#options.loader) {
			const $slot = maybe$loader.unwrap_unchecked();
			$slot.remove();
		}

		console.log(`Starting ${this.#name} v${this.#version}`);
	}
}
