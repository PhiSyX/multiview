import { signal } from "@multiview/framework-frontend";
import { br, button, div } from "@multiview/framework-frontend/dom";

export default class PagesController
{
	about()
	{
		return "About page";
	}

	counter()
	{
		const counter = signal(2);

		const increment = () => counter.replace((c) => c + 1);
		const decrement = () => counter.replace((c) => c - 1);

		const counterDouble = counter.computed((c) => c * 2);

		return div.children(
			button().text("Increment +1").on("click", increment),
			br(),
			button().text("Decrement -1").on("click", decrement),
			br(),
			br(),
			"Counter x1 : ",
			counter,
			br(),
			"Counter x2 : ",
			counterDouble,
		);
	}

	contact()
	{
		return "Contact page";
	}

	dynPage()
	{
		return "dynPage page";
	}
}
