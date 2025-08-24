import { button, div, form, h1, section } from "@multiview/framework-frontend/dom";

import { LabelInput } from "../templates/components/LabelInput";

export default class AuthController
{
	login()
	{
		return section.id("page-auth").class("auth").children(
			div.children(
				h1("Se connecter").class("auth-title"),
				form.post("/api/auth").class("auth-form")
					.input( LabelInput("identifier", "Identifiant") )
					.input( LabelInput("password", "Mot de passe", { type: "password" }) )
					.submit(
						button.submit().text("Se connecter maintenant"),
						this.handleLogin,
					)
			)
		);
	}

	handleLogin = (evt: SubmitEvent, payload: any) =>
	{
		evt.preventDefault();
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
