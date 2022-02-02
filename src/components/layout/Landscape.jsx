import SVG from "react-inlinesvg";

import Logo from "../../resources/icons/logoColor.svg";

export default function Landscape() {
    return (
        <div className={"Landscape"}>
            <div className="contentContainer">
                <SVG className="logoColor" src={Logo}></SVG>

                <h1>{"This game only works in portrait mode."}</h1>
            </div>
        </div>
    );
}
