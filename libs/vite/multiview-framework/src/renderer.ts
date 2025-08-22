import type { Option } from "@phisyx/safety.js/contracts";
import type { ComponentRenderOutput, LazyComponentLayout, LazyComponentRenderOutput } from "#root/component";
import type { LazyRenderClass, RenderClass, RouteHandler } from "#root/route";

import vine from "@vinejs/vine";
import { None } from "@phisyx/safety.js/option";

// ----------- //
// Énumération //
// ----------- //

const DOMRenderStrategy = {
	Append: Symbol("Append"),
	Swap: Symbol("Swap"),
} as const;

// -------------- //
// Implémentation //
// -------------- //

export class Renderer
{
	static #domSchema = vine.object({
		head: vine.object({
			title: vine.string().optional(),
			styles: vine.array(vine.any()).optional(),
		}).optional(),
		body: vine.any(),
	});

	#el!: HTMLElement;
	#layout: Option<LazyComponentLayout> = None();
	#handler: Option<RouteHandler> = None();

	setElement(el: HTMLElement): void
	{
		this.#el = el;
	}

	setLayout(layout: LazyComponentLayout): void
	{
		this.#layout.replace(layout);
	}

	setHandler(handler: RouteHandler): void
	{
		this.#handler.replace(handler);
	}

	async render()
	{
		const h = this.#handler.unwrap();

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

			return this.#render(
				this.#useLayout(klass.name, "render", (new klass).render()),
				this.#el,
				DOMRenderStrategy.Append,
			);
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

			return this.#render(
				this.#useLayout(klass.name, method, instance[method].call(instance)),
				this.#el,
				DOMRenderStrategy.Append,
			);
		}

		return Promise.reject(h);
	}

	append(n: Node | string, el: HTMLElement)
	{
		el.append(n);
	}

	swap(n: Node, el: HTMLElement)
	{
		el.replaceWith(n);
	}

	modify(value: any, el: HTMLElement, strategy: symbol)
	{
		if (strategy === DOMRenderStrategy.Append) {
			this.append(value, el);
		} else {
			this.swap(value, el);
		}
	}

	renderPrimitive(
		value: { toString(): string },
		el: HTMLElement,
		strategy: symbol
	)
	{
		this.modify(value.toString(), el, strategy);
	}

	async renderObject(value: object, el: HTMLElement, strategy: symbol)
	{
		if (value instanceof Date) {
			this.modify(value.toString(), el, strategy);
			return;
		}

		if (value instanceof Node) {
			this.modify(value, el, strategy);
			return;
		}

		if (value instanceof Promise) {
			await this.renderPromise(await value, el, strategy);
			return;
		}

		try {
			const dom = await vine.validate({ schema: Renderer.#domSchema, data: value });

			if (dom.head?.title) {
				document.title = dom.head.title;
			}

			if (dom.head?.styles) {
				for (const style of dom.head.styles) {
					await this.renderStylesheet(style);
				}
			}

			await this.renderDOM(dom.body, el, strategy);
			return;
		} catch {
		}

		if (isLiteralObject(value)) {
			await this.#render(JSON.stringify(value), el, strategy);
			return
		}

		console.warn("Value not supported ?", { value });
	}

	async renderDOM(
		value: ComponentRenderOutput,
		el: HTMLElement,
		strategy: symbol
	)
	{
		if (isLiteralObject(value)) {
			await this.#render(JSON.stringify(value), el, strategy);
		} else {
			await this.#render(value, el, strategy);
		}
	}

	async renderPromise(value: Promise<any>, el: HTMLElement, strategy: symbol)
	{
		await this.#render(await value, el, strategy);
	}

	async renderStylesheet(style: string | Promise<{ default: CSSStyleSheet }>)
	{
		if (typeof style === "string") {
			let sheet = new CSSStyleSheet();
			sheet.insertRule(style);
			document.adoptedStyleSheets.push(sheet);
		} else if (style instanceof Function) {
			document.adoptedStyleSheets.push((await style()).default);
		} else {
			console.warn("Style not supported ?", { style });
		}
	}

	async #render(
		value: ComponentRenderOutput | LazyComponentRenderOutput,
		el: HTMLElement,
		strategy: symbol,
	)
	{
		switch(typeof value) {
			case "bigint":
			case "number":
			case "string":
				return this.renderPrimitive(value, el, strategy);

			case "boolean":
				return this.renderPrimitive(value ? "true" : "false", el, strategy);
		}

		return this.renderObject(value, el, strategy);
	}

	#isCallable(h: unknown): h is LazyRenderClass
	{
		return typeof h === "function"
	}

	#isTuple(h: unknown): h is [unknown, string]
	{
		return Array.isArray(h) && typeof h[0] === "function";
	}

	#isLazy(r: unknown): r is LazyComponentRenderOutput
	{
		return typeof r === "object" && r?.constructor?.name === "Promise"
	}

	#useLayout = async (
		className: string,
		method: string,
		renderedSyncOrLazy: ComponentRenderOutput | LazyComponentRenderOutput
	) => {
		let maybeLayout: Option<LazyComponentLayout> = this.#layout;

		let rendered: ComponentRenderOutput;

		if (this.#isLazy(renderedSyncOrLazy)) {
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

		if (mut_$slot) {
			await this.#render(rendered, mut_$slot, DOMRenderStrategy.Swap);
		} else {
			await this.#render(rendered, layoutOutput, DOMRenderStrategy.Append);
		}

		return layoutOutput;
	};
}

function isLiteralObject(value: unknown): value is object
{
	return value != null && typeof value === "object" &&
		value.constructor?.name === "Object";
}
