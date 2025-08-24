import { div, slot } from "@multiview/framework-frontend/dom";

export default class LayoutBase
{
	render()
	{
		return div.class("layout").class("layout:base").children(slot());
	}
}
