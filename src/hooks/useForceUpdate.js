import { useState } from "react";

export default function useForceUpdate() {
    const [, setValue] = useState(0);
    return () => setValue((value) => ++value);
}

// HOW TO USE:
// Declare
// const forceUpdate = useForceUpdate();
// Force Update
// forceUpdate();
