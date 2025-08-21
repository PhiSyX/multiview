export default class LayoutBase
{
	render()
	{
		const $div = document.createElement("div");
		$div.classList.add("layout", "layout:base");
		$div.append(document.createElement("slot"));
		return $div;
	}
}
