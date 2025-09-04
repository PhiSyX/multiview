import { a, header, nav, ul } from "@multiview/framework-frontend/dom";

export default function Navigation()
{
	const listItems = [
		a.href("/").text("Accueil"),
		// Autre liens ...
	];

	return header.children(
		nav.children(
			ul(listItems)
				.li(a.href("/auth/login").text("Login"))
		)
	);
}
