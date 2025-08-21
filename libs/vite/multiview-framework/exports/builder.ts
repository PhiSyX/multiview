import type { VineAny } from "@vinejs/vine";
import type { RoutePathLiteral } from "#root/route_path";

import vine from "@vinejs/vine";
import { RouteBuilder } from "#root/route_builder";
import { RoutePath, RoutePathSegment } from "#root/route_path";

// ---- //
// Type //
// ---- //

type PathFnArgs = Array<RoutePathLiteral | RoutePathSegment>;

interface ParamFnOptions
{
	schema?: VineAny
}

type ParamFnVarName = string;

type ParamEnumFnList = Parameters<typeof vine.enum>["0"];

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
	param(varName, { schema: vine.string() });

export const paramEnum = (varName: ParamFnVarName, list: ParamEnumFnList) =>
	param(varName, { schema: vine.enum(list) });

export const paramInt = (varName: ParamFnVarName) =>
	param(varName, { schema: vine.number().withoutDecimals() });

export const paramNumber = (varName: ParamFnVarName) =>
	param(varName, { schema: vine.number() });

export const paramFloat = (varName: ParamFnVarName, precision: number = 2) =>
	param(varName, { schema: vine.number().decimal(precision) });

export const paramDouble = (varName: ParamFnVarName, precision: number = 4) =>
	param(varName, { schema: vine.number().decimal(precision) });

/** Alias of paramStr */
export const paramString = paramStr;
/** Alias of paramInt */
export const paramInteger = paramInt;
