import type { Option } from "@phisyx/safety.js/contracts";
import type { ComponentClass, ComponentRenderOutput, LazyComponentLayout, LazyComponentRenderOutput } from "#root/component";
import type { LazyRenderClass, RenderClass, RouteHandler } from "#root/route";

import z from "zod";
import { None } from "@phisyx/safety.js/option";
import { Signal } from "@phisyx/proposals.js/tc39/stage1";

// ----------- //
// Énumération //
// ----------- //

export const RenderStrategy = {
	Append: Symbol("Append"),
	Swap: Symbol("Swap"),
} as const;

type RenderStrategyEnum = typeof RenderStrategy[keyof typeof RenderStrategy];

// -------------- //
// Implémentation //
// -------------- //

export class Renderer
{
	static #domSchema = z.object({
		head: z.object({
			title: z.string().optional(),
			styles: z.array(z.any()).optional(),
		}).optional(),
		body: z.any(),
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
		if (isCallable(h))
		{
			let klass: RenderClass;
			try {
				klass = (await h()).default;
			} catch {
				klass = (h as unknown as RenderClass);
			}

			return this.pureRender(
				this.#useLayout(klass.name, "render", (new klass).render()),
				this.#el,
				RenderStrategy.Append,
			);
		}
		// case : [() => import("...""), method]
		// case : [class, method]
		else if (isTuple(h))
		{
			const handler: any = h[0];
			const method: string = h[1];

			let klass = handler;
			let instance: { [k: string]: () => ComponentRenderOutput };

			try {
				if (isCallable(handler)) {
					klass = (await handler()).default;
				} else {
					klass = (await handler).default;
				}
			} catch { }

			instance = new klass;

			return this.pureRender(
				this.#useLayout(klass.name, method, instance[method].call(instance)),
				this.#el,
				RenderStrategy.Append,
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

	modify(value: any, el: HTMLElement, strategy: RenderStrategyEnum)
	{
		if (strategy === RenderStrategy.Append) {
			this.append(value, el);
		} else {
			this.swap(value, el);
		}
	}

	renderPrimitive(
		value: { toString(): string },
		el: HTMLElement,
		strategy: RenderStrategyEnum,
	)
	{
		this.modify(value.toString(), el, strategy);
	}

	async renderObject(value: object, el: HTMLElement, strategy: RenderStrategyEnum)
	{
		if (value instanceof Signal.State) {
			const handleSignal = (
				child: InstanceType<typeof Signal.State<{ toString(): string }>>
			) => {
				const toNode = (val: { toString(): string }): Text => {
					return document.createTextNode(val.toString());
				};

				let node = toNode(child.value.toString());

				child.watch((oldValue, newValue) => {
					if (oldValue.toString() === newValue.toString()) return;

					let newNode = toNode(newValue.toString());
					node.replaceWith(newNode);
					node = newNode;
				});

				return node;
			};

			this.modify(
				handleSignal(value),
				this.#el,
				RenderStrategy.Append,
			)
			return;
		}

		if (value instanceof Signal.Computed) {
			const handleSignalComputed = (
				child: InstanceType<typeof Signal.Computed<{ toString(): string }>>
			) => {
				const toNode = (val: { toString(): string }): Text => {
					return document.createTextNode(val.toString());
				};

				let node = toNode(child.value.toString());

				child.watch((newValue) => {
					const newNode = toNode(newValue.toString());
					node.replaceWith(newNode);
					node = newNode;
				});

				return node;
			};

			this.modify(
				handleSignalComputed(value),
				this.#el,
				RenderStrategy.Append,
			)
			return;
		}

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

		if ("render" in value && typeof value.render === "function") {
			await this.pureRender(value.render(), el, strategy);
			return;
		}

		if ("default" in value) {
			// FIXME: type
			await this.pureRender(value.default, el, strategy);
			return;
		}

		try {
			const dom = Renderer.#domSchema.parse(value);

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
			await this.pureRender(JSON.stringify(value), el, strategy);
			return;
		}

		console.warn("Value not supported ?", { value });
	}

	async renderDOM(value: ComponentRenderOutput, el: HTMLElement, strategy: RenderStrategyEnum)
	{
		if (isLiteralObject(value)) {
			await this.pureRender(JSON.stringify(value), el, strategy);
		} else {
			await this.pureRender(value, el, strategy);
		}
	}

	async renderPromise(value: Promise<any>, el: HTMLElement, strategy: RenderStrategyEnum)
	{
		await this.pureRender(await value, el, strategy);
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

	async renderFunction(value: Function, el: HTMLElement, strategy: RenderStrategyEnum)
	{
		const v = value();
		if (v != null) {
			await this.pureRender(v, el, strategy);
		}
	}

	async pureRender(
		value: ComponentRenderOutput | LazyComponentRenderOutput,
		el: HTMLElement,
		strategy: RenderStrategyEnum,
	)
	{
		switch(typeof value) {
			case "bigint":
			case "number":
			case "string":
				return this.renderPrimitive(value, el, strategy);

			case "function":
				return this.renderFunction(value, el, strategy);

			case "boolean":
				return this.renderPrimitive(value ? "true" : "false", el, strategy);
		}

		return this.renderObject(value, el, strategy);
	}

	#useLayout = async (
		className: string,
		method: string,
		renderedSyncOrLazy: ComponentRenderOutput | LazyComponentRenderOutput
	) => {
		let maybeLayout: Option<LazyComponentLayout> = this.#layout;

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

		if (mut_$slot) {
			await this.pureRender(rendered, mut_$slot, RenderStrategy.Swap);
		} else {
			await this.pureRender(rendered, layoutOutput, RenderStrategy.Append);
		}

		return layoutOutput;
	};
}

function isLiteralObject(value: unknown): value is object
{
	return value != null && typeof value === "object" &&
		value.constructor?.name === "Object";
}

function isCallable(h: unknown): h is LazyRenderClass
{
	return typeof h === "function"
}

function isTuple(h: unknown): h is [unknown, string]
{
	return Array.isArray(h) && typeof h[0] === "function";
}

function isLazy(r: unknown): r is LazyComponentRenderOutput
{
	return typeof r === "object" && r?.constructor?.name === "Promise"
}

function isPrimitive(v: unknown): v is  string | number | bigint | boolean
{
	return ["string", "number", "bigint", "boolean"].includes(typeof v);
}

export async function lazyComponent<P extends { [p: string]: any }>(
	fut: Promise<{
		default:
			| ( (props: P) => ComponentRenderOutput )
			| ComponentClass<P>
	}>,
	props?: P
)
{
	const v = (await fut).default;

	const isFnComponent = <P extends { [p: string]: any }>(fn: unknown):
		fn is ((props: P) => ComponentRenderOutput) => (
			typeof fn === "function" && fn instanceof Function
		);

	if (isFnComponent<P>(v)) {
		return v(props || {} as P);
	}

	const vi = new v();
	return vi.render(props || {} as P);
}
