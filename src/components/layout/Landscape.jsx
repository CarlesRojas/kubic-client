import SVG from "react-inlinesvg";

import Logo from "../../resources/icons/tetris.svg";

export default function Landscape() {
    return (
        <div className={"Landscape"}>
            <div className="contentContainer">
                <SVG className="logo" src={Logo}></SVG>
                <h1>KUBIC</h1>

                <p>{"This game only works in portrait mode."}</p>
            </div>
        </div>
    );
}
