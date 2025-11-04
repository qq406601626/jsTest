import {gsap} from 'gsap'
import ScrollTrigger from 'scrollTrigger'
import ScrollSmoother from 'scrollSmoother'
gsap.registerPlugin(ScrollTrigger,ScrollSmoother)


const skewSetter = gsap.quickTo("img", "skewY") // fast
const clamp = gsap.utils.clamp(-20, 20); // don't let the skew go beyond 20 degrees.

ScrollSmoother.create({
	wrapper: "#wrapper",
	content: "#content",
	smooth: 2,
  	speed: 1000,
	effects: true,
	onUpdate: self => skewSetter(clamp(self.getVelocity() / -50)),
	onStop: () => skewSetter(0)
});

