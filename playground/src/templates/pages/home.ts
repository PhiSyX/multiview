import { br, div, span } from '@multiview/framework-frontend/dom';
import Counter from '../components/Counter';

export default function HomePage()
{
	return {
		head: {
			title: "Home",
			styles: [
				() => import('../../assets/dyn.css', { with: { type: "css" }}),
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
				"\n", // alias of br()
				"a\nb\n",

				"hello ",
				span.text("world").style("color", "red"),
				br(),

				div.children(
					// Async Component
					Counter({ base: 2 }),
				)
					.style({
						"background": "blue",
						"color": "yellow",
					})
			)
			// events
			.on("dblclick", (evt) => {
				console.log("dblclick");
			})
			.once("click", (evt) => {
				console.log("click");
			})
	}
}
