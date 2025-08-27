import type  {HTMLFormElementMethod, SubmitListener } from "@phisyx/proposals.js/whatwg/types";
import { HTMLFormElementExtension, HTMLButtonElementExtension } from "@phisyx/proposals.js/whatwg/html";

import * as z from "zod";

export * from "@phisyx/proposals.js/whatwg/html";
export type * from "@phisyx/proposals.js/whatwg/types";

/** Extension of HTMLFormElementExtension */
type FormElementParams = [action: string, options?: { schema?: z.ZodObject }];

interface FormElementHackyDecorator<
	H extends typeof HTMLFormElementExtension = typeof HTMLFormElementExtension,
	I = HTMLFormElementExtension
>
{
	(...args: ConstructorParameters<H>): I;
	get(...args: FormElementParams): I;
	delete(...args: FormElementParams): I;
	patch(...args: FormElementParams): I;
	put(...args: FormElementParams): I;
	post(...args: FormElementParams): I;
}

function makeFormElementExtension(
	formExt: typeof HTMLFormElementExtension
): FormElementHackyDecorator
{
	// @ts-expect-error : to fixed
	let make = (...args: any) => new formExt(...args);

	for (const ty of ["get", "delete", "patch", "put", "post"] as const) {
		// @ts-expect-error : to fixed
		make[ty] = (...args: any) => make(ty, ...args);
	}

	// @ts-expect-error : to fixed
	return make;
}

class MV_HTMLFormElementExtension extends HTMLFormElementExtension {
	#options?: { schema?: z.ZodObject };

	constructor(method: HTMLFormElementMethod, ...args: FormElementParams)
	{
		super(method, args[0]);
		this.#options = args[1];
	}

	submit(
		component: HTMLButtonElementExtension,
		listener?: SubmitListener,
		options?: { forceType?: boolean; },
	): this
	{
		const handleSubmit = (evt: SubmitEvent, data: Record<string, any>) => {
			try {
				const payload = this.#options?.schema?.parse(data);
				listener?.(evt, payload || {});
			} catch (e) { if (e instanceof z.ZodError) {
				const { fieldErrors } = e.flatten();
				console.error(fieldErrors);
			} }
		};

		return super.submit(component, handleSubmit, options);
	}
}

export const form = makeFormElementExtension(MV_HTMLFormElementExtension);
