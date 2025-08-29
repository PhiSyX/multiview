import type { ZodObject } from "zod";

import { button, div, form, h1, section } from "@multiview/framework-frontend/dom";

import { LabelInput } from "../../components/LabelInput";

interface LoginPageProps
{
	schema: ZodObject;
	onSubmit: (e: SubmitEvent, payload: any) => void;
}

export default function LoginPage(props: LoginPageProps)
{
	return section.id("page-auth").class("auth").children(
		div.children(
			h1("Se connecter").class("auth-title"),

			form.post("/api/auth", { schema: props.schema }).class("auth-form")
				.input( LabelInput("identifier", "Identifiant") )
				.input( LabelInput("password", "Mot de passe", { type: "current-password" }) )
				.submit(
					button.submit().text("Se connecter maintenant"),
					props.onSubmit,
				),
		)
			.css(() => import("../../../assets/pages/auth.css", { with: { type: "css" }}))
	);
}
