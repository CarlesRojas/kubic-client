import cn from "classnames";
import SVG from "react-inlinesvg";
import useGlobalState from "../../hooks/useGlobalState";

import LoadingIcon from "../../resources/icons/loading.svg";

export default function Loading() {
    const [visible] = useGlobalState("loadingVisible");

    return (
        <div className={cn("Loading", { visible })}>
            <SVG className={cn("icon", "spin", "infinite")} src={LoadingIcon} />
        </div>
    );
}
