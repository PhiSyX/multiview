import { div, slot } from "@multiview/framework-frontend/dom";
import Navigation from "../components/Navigation";

export default class LayoutBase
{
	render()
	{
		return div.class("layout").class("layout:base")
			.children(
				Navigation(),
				slot()
			)
		;
	}
}
