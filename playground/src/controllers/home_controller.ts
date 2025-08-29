import HomePage from "../templates/pages/home";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default class HomeController
{
	async render()
	{
		await sleep(1500);
		return HomePage;
	}
}
