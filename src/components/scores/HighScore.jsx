import { useContext } from "react";
import ls from "local-storage";
import SVG from "react-inlinesvg";
import cn from "classnames";

import ScoresIcon from "../../resources/icons/scores.svg";

import { Data } from "../../contexts/Data";

export default function HighScore({ data, position }) {
    const { APP_NAME } = useContext(Data);

    const { username, highestScore, pos } = data;

    const currentUsername = ls.get(`${APP_NAME}_username`);

    return (
        <div
            className={cn(
                "HighScore",
                { me: currentUsername === username },
                { first: position === 0, second: position === 1, third: position === 2 }
            )}
        >
            {position < 3 ? (
                <SVG className={"trophy"} src={ScoresIcon}></SVG>
            ) : (
                <div className="number">{(pos || position) + 1}</div>
            )}

            <p className="username">{username}</p>
            <p className="score">{highestScore}</p>
        </div>
    );
}
