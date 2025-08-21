export default class LayoutAuth
{
	render()
	{
		const $div = document.createElement("div");
		$div.classList.add("layout", "layout:auth");
		$div.append(document.createElement("slot"));
		return $div;
	}
}
