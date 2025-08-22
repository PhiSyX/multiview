export type LazyComponentLayout = () => Promise<{ default: ComponentLayoutClass }>;

export interface ComponentLayoutClass
{
	new(): ComponentLayout;
}

export interface ComponentLayout
{
	render(): HTMLElement;
}
export type ComponentRenderOutput =
	| string
	| bigint
	| number
	| boolean
	| Node
	| HTMLElement
	| Date
	| Record<string,
		| string
		| bigint
		| number
		| boolean
		| Node
		| HTMLElement
		| Date
	>;

export type LazyComponentRenderOutput = Promise<ComponentRenderOutput>;
