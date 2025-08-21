export class LoaderText
{
	render()
	{
		const $div = document.createElement("div");
		$div.textContent = "Chargement...";
		return $div;
	}
}
