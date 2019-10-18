export default {
	functional: true,
	render(createElement, { props, data, children })
	{
		let delay = props.delay || 250;
		let tag = props.tag || "div";
		let animation = props.animation || "entranceFromRight";

		if(props.fromTop != undefined) animation = 'entranceFromTop'
		if(props.fromRight != undefined) animation = 'entranceFromRight'
		if(props.fromBottom != undefined) animation = 'entranceFromBottom'
		if(props.fromLeft != undefined) animation = 'entranceFromLeft'

		if (children) {
			children.forEach((child, index) => {
				if (!child.data) return;
				child.data.staticStyle = {
					opacity: 0,
					animationFillMode: "forwards",
					animationDelay: index * delay + "ms"
				};
				child.data.staticClass += " " + animation;
			});
		}
		return createElement(tag,{class: data.staticClass},children);
	}
};
