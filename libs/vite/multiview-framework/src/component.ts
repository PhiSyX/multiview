import { Signal } from "@phisyx/proposals.js/tc39/stage1";
import type { HTMLElementExtension } from "@phisyx/proposals.js/whatwg/html";

// ---- //
// Type //
// ---- //

export type LazyComponentLayout =
	| (() => Promise<{ default: ComponentLayoutClass }>);

export interface ComponentLayoutClass
{
	new(): ComponentLayout;
}

export interface ComponentLayout
{
	render(): HTMLElement | HTMLElementExtension<keyof HTMLElementTagNameMap>;
}

export interface ComponentClass<P>
{
	new(): Component<P>;
}

export interface Component<P>
{
	render(props?: P): ComponentRenderOutput;
}

export type ComponentRenderOutput =
	| string
	| bigint
	| number
	| boolean
	| HTMLElementExtension<keyof HTMLElementTagNameMap>
	| HTMLElement
	| Node
	| InstanceType<typeof Signal.State<any>>
	| Date
	| Function
	| Record<string,
		| string
		| bigint
		| number
		| boolean
		| HTMLElementExtension<keyof HTMLElementTagNameMap>
		| HTMLElement
		| Node
		| InstanceType<typeof Signal.State<any>>
		| Date
		| Function
	>;

export type LazyComponentRenderOutput = Promise<ComponentRenderOutput>;
