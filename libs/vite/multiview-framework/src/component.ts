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
	| HTMLElement;

export type LazyComponentRenderOutput = Promise<ComponentRenderOutput>;
