import { div, slot } from "@multiview/framework-frontend/dom";
import Navigation from "../components/Navigation";

export default class LayoutAuth
{
	render()
	{
		return div.class("layout").class("layout:auth").children(
			Navigation(),
			slot()
		);
	}
}
