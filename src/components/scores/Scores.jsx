import { useCallback, useContext, useState, useEffect } from "react";
import SVG from "react-inlinesvg";
import ls from "local-storage";

import HighScore from "./HighScore";

import { API } from "../../contexts/API";
import { Utils } from "../../contexts/Utils";
import { Data } from "../../contexts/Data";

import Logo from "../../resources/icons/tetris.svg";

export default function Scores() {
    const { getTopTen } = useContext(API);
    const { vibrate } = useContext(Utils);
    const { APP_NAME } = useContext(Data);

    const [topTen, setTopTen] = useState([]);
    const [error, setError] = useState(false);

    const loadData = useCallback(async () => {
        const response = await getTopTen();

        if ("error" in response) return setError(response.error);

        const topTenArray = response.topTen;
        const currentUsername = ls.get(`${APP_NAME}_username`);
        const currentScore = ls.get(`${APP_NAME}_score`);

        let found = false;

        for (let i = 0; i < topTenArray.length; i++) {
            const { username } = topTenArray[i];
            if (currentUsername === username) {
                found = true;
                break;
            }
        }

        if (!found)
            topTenArray[topTenArray.length - 1] = {
                username: currentUsername,
                highestScore: currentScore,
                pos: response.userPosition,
            };

        setTopTen(response.topTen);
    }, [getTopTen, APP_NAME]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="Scores">
            <div className="title">World Ranking</div>

            {error && (
                <div className="contentContainer">
                    <p>{"Error loading the data"}</p>

                    <div
                        className="button low"
                        onClick={() => {
                            vibrate(40);
                            loadData();
                        }}
                    >
                        RETRY
                    </div>
                </div>
            )}

            {topTen.length <= 0 && !error && (
                <div className="loading">
                    <SVG className="icon rotateQuarters infinite" src={Logo}></SVG>
                </div>
            )}

            <div className="ranking">
                {!error && topTen.length > 0 && topTen.map((data, i) => <HighScore data={data} key={i} position={i} />)}
            </div>
        </div>
    );
}
