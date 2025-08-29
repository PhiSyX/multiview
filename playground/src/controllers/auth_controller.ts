import { lazyComponent } from "@multiview/framework-frontend";

import * as z from "zod";

export default class AuthController
{
	static LoginSchema = z.object({
		identifier: z.email().or(z.string().min(3)),
		password: z.string().min(8).max(64),
	});

	login()
	{
		return lazyComponent(import("../templates/pages/auth/login"), {
			schema: AuthController.LoginSchema,
			onSubmit: this.handleLogin,
		});
	}

	handleLogin = (evt: SubmitEvent, payload: { identifier: string; password: string; }) =>
	{
		console.log({ evt, payload });
	};

	logout()
	{
		return "Logout";
	}

	register()
	{
		return "Register";
	}
}
