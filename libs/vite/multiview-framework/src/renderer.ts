import type { ComponentRenderOutput, LazyComponentLayout, LazyComponentRenderOutput } from "#root/component";
import type { LazyRenderClass, RenderClass, RouteHandler } from "#root/route";
import type { Option } from "@phisyx/safety.js/contracts";

import { None } from "@phisyx/safety.js/option";

// -------------- //
// Implémentation //
// -------------- //

export class Renderer
{
	#layout: Option<LazyComponentLayout> = None();
	#handler: Option<RouteHandler> = None();

	setLayout(layout: LazyComponentLayout): void
	{
		this.#layout.replace(layout);
	}

	setHandler(handler: RouteHandler): void
	{
		this.#handler.replace(handler);
	}

	async render(): Promise<ComponentRenderOutput>
	{
		const h = this.#handler.unwrap();
		const l = useLayout(this.#layout);

		// case : () => import("...").default   ( LazyRenderClass )
		// case : class { }                     ( RenderClass )
		if (this.#isCallable(h))
		{
			let klass: RenderClass;
			try {
				klass = (await h()).default;
			} catch {
				klass = (h as unknown as RenderClass);
			}

			return l(klass.name, "render", (new klass).render());
		}
		// case : [() => import("...""), method]
		// case : [class, method]
		else if (this.#isTuple(h))
		{
			const handler: any = h[0];
			const method: string = h[1];

			let klass = handler;
			let instance: { [k: string]: () => ComponentRenderOutput };

			try {
				if (this.#isCallable(handler)) {
					klass = (await handler()).default;
				} else {
					klass = (await handler).default;
				}
			} catch { }

			instance = new klass;

			return l(klass.name, method, instance[method].call(instance));
		}

		return Promise.reject(h);
	}

	#isCallable(h: unknown): h is LazyRenderClass
	{
		return typeof h === "function"
	}

	#isTuple(h: unknown): h is [unknown, string]
	{
		return Array.isArray(h) && typeof h[0] === "function";
	}
}

function isLazy (r: unknown): r is LazyComponentRenderOutput
{
	return typeof r === "object" && r?.constructor?.name === "Promise"
}

const useLayout = (maybeLayout: Option<LazyComponentLayout>) => async (
	className: string,
	method: string,
	renderedSyncOrLazy: ComponentRenderOutput | LazyComponentRenderOutput
) => {
	let rendered: ComponentRenderOutput;

	if (isLazy(renderedSyncOrLazy)) {
		rendered = await renderedSyncOrLazy;
	} else {
		rendered = renderedSyncOrLazy;
	}

	if (rendered == null) return Promise.reject(
		new Error(`Your render function (${className}#${method}) returns a null/undefined value.`)
	);

	if (maybeLayout.is_none()) {
		return rendered;
	}

	const layoutClass = await (maybeLayout.unwrap())();

	const layoutInstance = new layoutClass.default();
	const layoutOutput = layoutInstance.render();

	let mut_$slot = layoutOutput.querySelector("slot");

	if (mut_$slot)
	{
		if (rendered instanceof Node) {
			mut_$slot.replaceWith(rendered);
		} else {
			mut_$slot.replaceWith(rendered.toString());
		}
	} else {
		layoutOutput.append(rendered as Node);
	}

	return layoutOutput;
};
