import { div, slot } from "@multiview/framework-frontend/dom";

export default class LayoutAuth
{
	render()
	{
		return div.class("layout").class("layout:auth").children(slot());
	}
}
