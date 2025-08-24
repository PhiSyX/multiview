import type { HTMLInputElementType } from "@multiview/framework-frontend/dom";

import { div, input, label, HTMLFormInputComponentContract } from "@multiview/framework-frontend/dom";

const DEFAULT_LABEL_SUFFIX: string = " : ";

type LabelInputProps = {
	label: string;
	labelSuffix?: boolean | string;
	name: string;
	id?: string;
	type?: HTMLInputElementType;
};

class LabelInputComponent extends HTMLFormInputComponentContract
{
	#props: LabelInputProps;

	constructor(props: LabelInputProps)
	{
		super();
		this.#props = props;
	}

	// --------------- //
	// Getter | Setter //
	// --------------- //

	private get labelSuffix()
	{
		if (this.#props.labelSuffix === true) {
			return DEFAULT_LABEL_SUFFIX;
		}

		if (typeof this.#props.labelSuffix === "string") {
			return this.#props.labelSuffix;
		}

		return "";
	}

	private get id()
	{
		return this.#props.id || this.#props.name;
	}

	private get type()
	{
		return this.#props.type || "text";
	}

	// ------- //
	// Méthode // -> Events
	// ------- //

	onInput = (evt: Event) => {
		console.log(this.relatedForm, {evt});
	};

	// ------- //
	// Méthode //
	// ------- //

	render()
	{
		return div.children(
			label(this.#props.label + this.labelSuffix).for(this.id),
			input(this.#props.name, this.type).id(this.id),
		);
	}
}

export function LabelInput(
	name: LabelInputProps["name"],
	label: LabelInputProps["label"],
	propsExtra?: Omit<LabelInputProps, "name" | "label">,
) {
	const props: LabelInputProps = { name, label, ...propsExtra, };
	return new LabelInputComponent(props);
}
