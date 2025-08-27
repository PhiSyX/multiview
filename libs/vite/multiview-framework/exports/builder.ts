import type { ZodAny } from "zod";
import type { RoutePathLiteral } from "#root/route_path";

import z from "zod";
import { RouteBuilder } from "#root/route_builder";
import { RoutePath, RoutePathSegment } from "#root/route_path";

// ---- //
// Type //
// ---- //

type PathFnArgs = Array<RoutePathLiteral | RoutePathSegment>;

interface ParamFnOptions
{
	schema?: ZodAny
}

type ParamFnVarName = string;

type ParamEnumFnList = Parameters<typeof z.enum>[0];

// ------ //
// Export //
// ------ //

export const createRouteBuilder = () => new RouteBuilder();

export const path = (...paths: PathFnArgs) => new RoutePath(paths.map(
	(pathOrSegment) => {
		if (pathOrSegment instanceof RoutePathSegment) {
			return pathOrSegment;
		}
		return RoutePathSegment.from(pathOrSegment);
	}
));

export const param = (varName: ParamFnVarName, options?: ParamFnOptions) =>
	RoutePathSegment.from(
		`/{${varName}}`,
		options?.schema
	);

export const paramStr = (varName: ParamFnVarName) =>
	param(varName, { schema: z.string() as unknown as ZodAny });

export const paramEnum = (varName: ParamFnVarName, list: ParamEnumFnList) =>
	param(varName, { schema: z.enum(list) as unknown as ZodAny });

export const paramInt = (varName: ParamFnVarName) =>
	param(varName, { schema: z.int() as unknown as ZodAny });

export const paramNumber = (varName: ParamFnVarName) =>
	param(varName, { schema: z.number() as unknown as ZodAny });

export const paramFloat = (varName: ParamFnVarName) =>
	param(varName, { schema: z.float32() as unknown as ZodAny });

export const paramDouble = (varName: ParamFnVarName) =>
	param(varName, { schema: z.float64() as unknown as ZodAny });

/** Alias of paramStr */
export const paramString = paramStr;
/** Alias of paramInt */
export const paramInteger = paramInt;
