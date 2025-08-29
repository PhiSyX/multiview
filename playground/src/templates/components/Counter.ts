import { signal } from "@multiview/framework-frontend";
import { br, button, div } from "@multiview/framework-frontend/dom";

interface CounterProps
{
	base: number;
}

export default function Counter(props: CounterProps = {base: 1})
{
	const counter = signal(props.base);
	const counterDouble = counter.computed((c) => c * 2);

	const increment = () => counter.replace((c) => c + 1);
	const decrement = () => counter.replace((c) => c - 1);

	return div.children(
		button().text("Increment +1").on("click", increment),
		br(),
		button().text("Decrement -1").on("click", decrement),
		br(),
		br(),
		"Counter x1 : ",
		counter,
		br(),
		"Counter x2 : ",
		counterDouble,
	);
}
