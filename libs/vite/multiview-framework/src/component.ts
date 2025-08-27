import type { HTMLElementExtension } from "@phisyx/proposals.js/whatwg/html";

// ---- //
// Type //
// ---- //

export type LazyComponentLayout = () => Promise<{ default: ComponentLayoutClass }>;

export interface ComponentLayoutClass
{
	new(): ComponentLayout;
}

export interface ComponentLayout
{
	render(): HTMLElement | HTMLElementExtension<keyof HTMLElementTagNameMap>;
}
export type ComponentRenderOutput =
	| string
	| bigint
	| number
	| boolean
	| HTMLElementExtension<keyof HTMLElementTagNameMap>
	| HTMLElement
	| Node
	| Date
	| Function
	| Record<string,
		| string
		| bigint
		| number
		| boolean
		| HTMLElementExtension<keyof HTMLElementTagNameMap>
		| Node
		| HTMLElement
		| Date
		| Function
	>;

export type LazyComponentRenderOutput = Promise<ComponentRenderOutput>;
