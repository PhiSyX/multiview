import { br, div, span, tab } from "@multiview/framework-frontend/dom";

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
				.attrs({ tabIndex: "-1" })
				// dataset
				.dataset({ name: "John Doe" })
				// style
				.style("color", "blue")
				.style({ background: "yellow" })
				// content
				.text("Click here")
				.children(
					2,
					"\n",
					"\thello",
					br(),
					tab(8),
					span.text("world").style("color", "red"),
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
