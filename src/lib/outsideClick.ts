import { useRef, useEffect } from "react"

export const useOutsideClick = <T extends HTMLElement>(
	callback: () => void,
	excludeRef?: React.RefObject<HTMLElement | null>
) => {
	const ref = useRef<T>(null);

	useEffect(() => {
		const handleClick = (event: MouseEvent | TouchEvent) => {
			const target = event.target as HTMLElement;

			const clickedInsideModal = ref.current?.contains(target);

			const clickedExclude = excludeRef?.current?.contains(target);

			if (ref.current && !clickedInsideModal && !clickedExclude) {
				const isCalendarClick = target.closest('#datepicker-portal');

				if (!isCalendarClick) {
					callback();
				}
			}
		};

		document.addEventListener("mousedown", handleClick, true);
		document.addEventListener("touchstart", handleClick, true);

		return () => {
			document.removeEventListener("mousedown", handleClick, true);
			document.removeEventListener("touchstart", handleClick, true);
		};
	}, [callback, excludeRef]);

	return ref;
};
