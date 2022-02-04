import { useCallback, useContext } from "react";
import cn from "classnames";
import SVG from "react-inlinesvg";

import useAutoResetState from "../../hooks/useAutoResetState";

import { API } from "../../contexts/API";
import { Utils } from "../../contexts/Utils";

import Logo from "../../resources/icons/tetris.svg";

export default function Settings() {
    const { logout, deleteAccount } = useContext(API);
    const { vibrate } = useContext(Utils);

    // #################################################
    //   LOGOUT
    // #################################################

    const [logoutClicked, setLogoutClicked] = useAutoResetState(false, 2000);

    const handleLogoutClicked = useCallback(() => {
        vibrate(40);

        if (logoutClicked) logout();
        else setLogoutClicked(true);
    }, [vibrate, logoutClicked, logout, setLogoutClicked]);

    // #################################################
    //   DELETE ACCOUNT
    // #################################################

    const [deleteAccountClicked, setDeleteAccountClicked] = useAutoResetState(false, 2000);

    const handleDeleteAccountClicked = useCallback(() => {
        vibrate(40);

        if (deleteAccountClicked) deleteAccount();
        else setDeleteAccountClicked(true);
    }, [vibrate, deleteAccountClicked, deleteAccount, setDeleteAccountClicked]);

    // #################################################
    //   RENDER
    // #################################################

    return (
        <div className="Settings">
            <div className="contentContainer">
                <SVG className="logo" src={Logo}></SVG>
                <h1>{"KUBIC"}</h1>

                <div className={cn("button", "middle", { low: !logoutClicked })} onClick={handleLogoutClicked}>
                    LOG OUT
                </div>

                <div className={cn("button", { low: !deleteAccountClicked })} onClick={handleDeleteAccountClicked}>
                    DELETE ACCOUNT
                </div>

                <div className={cn("message", { visible: logoutClicked && !deleteAccountClicked })}>
                    Log out of this account. Click again to confirm.
                </div>

                <div className={cn("message", { visible: deleteAccountClicked })}>
                    Your account and your high score will be deleted. Click again to confirm.
                </div>
            </div>
        </div>
    );
}
