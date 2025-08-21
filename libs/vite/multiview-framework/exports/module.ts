import { Application } from "#root/application";
import { Router } from "#root/router";

// ---- //
// Type //
// ---- //

type CreateAppFnArgs = ConstructorParameters<typeof Application>;
type CreateRouterFnArgs = ConstructorParameters<typeof Router>;

// ------ //
// Export //
// ------ //

export type { ComponentRenderOutput } from "#root/component";

export const createApp = (...args: CreateAppFnArgs) => new Application(...args);

export const createRouter = (...args: CreateRouterFnArgs) => new Router(...args);
