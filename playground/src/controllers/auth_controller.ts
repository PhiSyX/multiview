import { button, div, form, h1, section } from "@multiview/framework-frontend/dom";

import { LabelInput } from "../templates/components/LabelInput";
import * as z from "zod";

export default class AuthController
{
	static LoginSchema = z.object({
		identifier: z.email().or(z.string().min(3)),
		password: z.string().min(8).max(64),
	});

	login()
	{
		return section.id("page-auth").class("auth").children(
			div.children(
				h1("Se connecter").class("auth-title"),

				form.post("/api/auth", { schema: AuthController.LoginSchema }).class("auth-form")
					.input( LabelInput("identifier", "Identifiant") )
					.input( LabelInput("password", "Mot de passe", { type: "current-password" }) )
					.submit(
						button.submit().text("Se connecter maintenant"),
						this.handleLogin,
					),
			)
				.css(() => import("../assets/pages/auth.css", { with: { type: "css" }}))
		);
	}

	handleLogin = (evt: SubmitEvent, payload: any) =>
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
