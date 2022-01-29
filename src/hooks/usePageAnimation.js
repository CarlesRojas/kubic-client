import { useState, useCallback, useRef, useEffect } from "react";
import useCssOneTimeAnimation from "./useCssOneTimeAnimation";

export default function usePageAnimation({
    pagesIds,
    pagesContents,
    containerClass,
    animationSpeed,
    animateFirst,
    initialPage,
}) {
    // #################################################
    //   STATE
    // #################################################

    const [pagesVisible, setPagesVisible] = useState(pagesIds.map((_, i) => i === initialPage));
    const pagesRef = useRef({});

    const updatePagesVisible = (index, newValue) => {
        setPagesVisible((prev) => {
            const newArray = [...prev];
            if (index >= 0 && index < newArray.length) newArray[index] = newValue;
            return newArray;
        });
    };

    // #################################################
    //   NEXT & PREV
    // #################################################

    const page = useRef(initialPage);
    const animationState = useRef({
        shouldStartAnimation: false,
        goingBack: false,
        animationStarted: false,
        newIndex: -1,
    });

    const isFirstPage = useCallback(() => {
        return page.current === 0;
    }, []);

    const isLastPage = useCallback(() => {
        return page.current === pagesIds.length - 1;
    }, [pagesIds]);

    const isInBounds = useCallback(
        (index) => {
            return index >= 0 && index < pagesIds.length;
        },
        [pagesIds]
    );

    const nextPage = useCallback(() => {
        // Save the animation we want to make and instantiate the appearing stage (out of sight)
        animationState.current = {
            shouldStartAnimation: true,
            goingBack: false,
            animationStarted: false,
            newIndex: page.current + 1,
        };

        if (isLastPage()) {
            updatePagesVisible(page.current, true);
            return false;
        }

        updatePagesVisible(page.current + 1, true);
        return true;
    }, [isLastPage]);

    const prevPage = useCallback(() => {
        // Save the animation we want to make and instantiate the appearing stage (out of sight)
        animationState.current = {
            shouldStartAnimation: true,
            goingBack: true,
            animationStarted: false,
            newIndex: page.current - 1,
        };

        if (isFirstPage()) {
            updatePagesVisible(page.current, true);
            return false;
        }

        updatePagesVisible(page.current - 1, true);
        return true;
    }, [isFirstPage]);

    const setPage = useCallback(
        (index) => {
            if (page.current === index || !isInBounds(index)) return false;
            const goingBack = index < page.current;

            // Save the animation we want to make and instantiate the appearing stage (out of sight)
            animationState.current = {
                shouldStartAnimation: true,
                goingBack,
                animationStarted: false,
                newIndex: index,
            };

            updatePagesVisible(index, true);
            return true;
        },
        [isInBounds]
    );

    // #################################################
    //   ANIMATION
    // #################################################

    const [animating, trigger] = useCssOneTimeAnimation(animationSpeed);

    useEffect(() => {
        const { shouldStartAnimation, goingBack, animationStarted, newIndex } = animationState.current;
        if (animationStarted || !shouldStartAnimation) return;

        animationState.current = { ...animationState.current, animationStarted: true };

        // Add classes to animate towards the right (Go back)
        if (goingBack) {
            if (isInBounds(page.current)) pagesRef.current[page.current].classList.add("exitGoingBack");
            if (isInBounds(newIndex) && !isFirstPage()) pagesRef.current[newIndex].classList.add("enterGoingBack");
        }
        // Add classes to animate towards the left (Go next)
        else {
            if (isInBounds(page.current)) pagesRef.current[page.current].classList.add("exitGoingFordward");
            if (isInBounds(newIndex) && !isLastPage()) pagesRef.current[newIndex].classList.add("enterGoingFordward");
        }

        trigger();
    }, [pagesVisible, trigger, isFirstPage, isLastPage, isInBounds]);

    useEffect(() => {
        const { shouldStartAnimation, newIndex } = animationState.current;
        if (animating || !shouldStartAnimation) return;

        // When animation ends -> Deinstantiate the page that left
        const gonePage = page.current;
        page.current = newIndex;
        animationState.current = {
            shouldStartAnimation: false,
            goingBack: false,
            animationStarted: false,
            newIndex: -1,
        };

        updatePagesVisible(gonePage, false);
    }, [animating]);

    const firstRun = useRef(true);
    useEffect(() => {
        if (!firstRun.current) return;
        firstRun.current = false;

        if (animateFirst) pagesRef.current[initialPage].classList.add("enterGoingFordward");
        else pagesRef.current[initialPage].classList.add("center");
    }, [animateFirst, initialPage]);

    // #################################################
    //   RENDER
    // #################################################

    const renderedPages = pagesIds.map(
        (_, i) =>
            pagesVisible[i] && (
                <div
                    key={i}
                    className={containerClass}
                    style={{ pointerEvents: animating ? "none" : "all" }}
                    ref={(elem) => (pagesRef.current[i] = elem)}
                >
                    {pagesContents[i]}
                </div>
            )
    );

    return [{ renderedPages, nextPage, prevPage, setPage }];
}
