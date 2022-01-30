import { useEffect } from "react";

export default function useDoubleClick({ ref, delay = 300, onSingleClick = () => null, onDoubleClick = () => null }) {
    useEffect(() => {
        const clickRef = ref.current;
        let clickCount = 0;
        var timeout = null;

        const handleClick = (e) => {
            clearTimeout(timeout);
            clickCount += 1;

            if (clickCount === 2) {
                onDoubleClick(e);
                clickCount = 0;
            } else {
                timeout = setTimeout(() => {
                    onSingleClick(e);
                    clickCount = 0;
                }, delay);
            }
        };

        // Add event listener for click events
        clickRef.addEventListener("click", handleClick);

        // Remove event listener
        return () => {
            clickRef.removeEventListener("click", handleClick);
            if (timeout) clearTimeout(timeout);
        };
    });
}
