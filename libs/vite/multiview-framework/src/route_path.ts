import type { VineAny } from "@vinejs/vine";
import type { Option } from "@phisyx/safety.js/contracts";

import vine from "@vinejs/vine";
import { StringExtension } from "@phisyx/proposals.js/lang/string";
import { toOption } from "@phisyx/safety.js/option";

// ---- //
// Type //
// ---- //

export type RoutePathLiteral = `/${string}`;

// -------------- //
// Implémentation //
// -------------- //

export class RoutePath
{
	static normalize = (path: string) => {
		if (path === "/") return path;
		return new StringExtension(path).trimEnd("/").toString();
	};

	static fromLiteral = (path: string) => new RoutePath(
		path.split(/(\/[\w{}]*)/).filter(Boolean)
			.map((segment) => RoutePathSegment.from(segment))
	);

	#segments: Array<RoutePathSegment> = [];

	constructor(segments: Array<RoutePathSegment>)
	{
		this.#segments = segments;
	}

	prepend(segment: string): void;
	prepend(segment: StringExtension): void;
	prepend(segment: RoutePathSegment): void;
	prepend(segment: string | StringExtension | RoutePathSegment): void
	{
		if (segment instanceof StringExtension || typeof segment === "string") {
			this.#segments.unshift(new RoutePathSegment(segment.toString()));
		} else {
			this.#segments.unshift(segment);
		}
	}

	first(options:  { unsafe: true    }): RoutePathSegment;
	first(options?: { unsafe: false   }):                    Option<RoutePathSegment>;
	first(options?: { unsafe: boolean }): RoutePathSegment | Option<RoutePathSegment>
	{
		const maybe = toOption(this.#segments.at(0));
		if (options?.unsafe) return maybe.unwrap_unchecked();
		return maybe;
	}

	at(n: number): Option<RoutePathSegment>
	{
		return toOption(this.#segments.at(n));
	}

	full(): StringExtension
	{
		return new StringExtension(
			this.#segments.map((s) => s.segment).join("")
		);
	}

	private toRegExp(): RegExp
	{
		return new RegExp(new StringExtension("")
			.push('^')
			.push(this.#segments.map((s) => {
				if (s.isDynamic) return `\/(?<${s.dynSegment}>.+)`;
				return s.segment;
			}))
			.push('$')
			.toString()
		);
	}

	private dynParams()
	{
		return Object.fromEntries(
			this.#segments
				.filter((s) => s.isDynamic)
				.map((s) => [s.dynSegment, s.addDynSegment.bind(s)])
		);
	}

	async eq(other: RoutePath): Promise<boolean>
	{
		const simple = () => this.full().toString() === other.full().toString();

		const adv = async () => {
			const maybeParamsValues = other.full().matchGroups(this.toRegExp());

			if (maybeParamsValues.is_none()) {
				return false;
			}

			const paramsValues = maybeParamsValues.unwrap();
			const dynParams = this.dynParams();

			for (const [param, value] of Object.entries(paramsValues))
			{
				if (!dynParams[param]) {
					 return false;
				}

				await dynParams[param](value);
			}

			return true;
		};

		return simple() || await adv();
	}

	toString()
	{
		return this.full();
	}
}

export class RoutePathSegment
{
	static from = (seg: string, schema?: VineAny) => new RoutePathSegment(seg, schema);

	#segment: string;
	#schema: VineAny = vine.any();
	#dynValues: Set<string> = new Set();

	constructor(segment: string, schema?: VineAny)
	{
		this.#segment = segment;

		if (schema) {
			this.#schema = schema;
		}
	}

	get isDynamic(): boolean
	{
		return this.#segment.startsWith("/{") && this.#segment.endsWith('}');
	}

	get segment(): string
	{
		return this.#segment;
	}

	get dynSegment(): string
	{
		const startPos = this.#segment.indexOf('{') + 1;
		const endPos = this.#segment.indexOf('}');
		return this.#segment.slice(startPos, endPos);
	}

	async addDynSegment($1: string)
	{
		const data = await vine.validate({ schema: this.#schema, data: $1 });
		this.#dynValues.add(data);
	}

	eq($1: string): boolean
	{
		return this.#segment === $1;
	}

	contains($1: string): boolean
	{
		return this.#segment.includes($1);
	}
}
