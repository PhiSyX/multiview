import { lazyComponent } from "@multiview/framework-frontend";

export default class PagesController
{
	about()
	{
		return "About page";
	}

	counter()
	{
		return lazyComponent(import("../templates/components/Counter"), {
			base: 2,
		});
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
