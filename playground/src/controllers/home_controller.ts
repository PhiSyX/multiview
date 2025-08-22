const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default class HomeController
{
	async render()
	{
		await sleep(1500);

		return {
			head: {
				title: "Home",
				styles: [
					() => import('../assets/dyn.css', { with: { type: "css" }}),
				],
			},
			body: new Date,
		};
	}
}
