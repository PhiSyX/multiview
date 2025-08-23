import { div } from "@multiview/framework-frontend/dom";

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
			body: div
				// ID
				.id("my-id")
				// classes
				.class("my-class")
				.class({ hello: true, world: false, hello_world: () => true })
				// attrs
				.attr("role", "main")
				.attrs({ align: "center" })
				// dataset
				.dataset({ name: "John Doe" })
				// style
				.style("color", "red")
				.style({ background: "yellow" })
				// content
				.text("Click here")
				.children(
					div.text("hey").style("color", "blue")
				)
				// events
				.on("dblclick", (evt) => {
					console.log("dblclick");
				})
				.once("click", (evt) => {
					console.log("click");
				})
		};
	}
}
