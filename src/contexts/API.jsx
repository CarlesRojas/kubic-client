import { createContext, useContext } from "react";
import ls from "local-storage";

import { Data } from "./Data";
import { Events } from "./Events";

const API_VERSION = "api_v1";
const API_URL = "https://kubic3d.herokuapp.com/"; // "http://localhost:3100/";

export const API = createContext();
const APIProvider = (props) => {
    const { APP_NAME, token } = useContext(Data);
    const { emit } = useContext(Events);

    const loginOrRegister = async (username, password) => {
        const postData = { username, password };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/loginOrRegister`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify(postData),
            });

            const response = await rawResponse.json();

            // Save token
            if ("token" in response) {
                token.current = response.token;
                ls.set(`${APP_NAME}_token`, response.token);
            }

            return response;
        } catch (error) {
            return { error: "Login or Register error" };
        }
    };

    const getUserInfo = async () => {
        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/getUserInfo`, {
                method: "get",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
            });

            const response = await rawResponse.json();

            // Save new user
            if ("error" in response) {
                ls.clear();
                return false;
            }

            ls.set(`${APP_NAME}_username`, response.username);
            ls.set(`${APP_NAME}_score`, response.highestScore);
            ls.set(`${APP_NAME}_tutorialStatus`, response.tutorialDone);

            return true;
        } catch (error) {
            ls.clear();
            return false;
        }
    };

    const setHighScore = async (score) => {
        const postData = { score };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/setHighScore`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
                body: JSON.stringify(postData),
            });

            const response = await rawResponse.json();

            if (!("error" in response)) ls.set(`${APP_NAME}_score`, score);

            return response;
        } catch (error) {
            return { error: "Error setting score" };
        }
    };

    const getTopTen = async () => {
        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/getTopTen`, {
                method: "get",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
            });

            const response = await rawResponse.json();

            return response;
        } catch (error) {
            return { error: "Error getting top three" };
        }
    };

    const setTutorialStatus = async (tutorialDone) => {
        const postData = { tutorialDone };

        if (!tutorialDone) {
            ls.set(`${APP_NAME}_tutorialStatus`, tutorialDone);
            return { success: "" };
        }

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/setTutorialStatus`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
                body: JSON.stringify(postData),
            });

            const response = await rawResponse.json();

            if (!("error" in response)) ls.set(`${APP_NAME}_tutorialStatus`, tutorialDone);

            return response;
        } catch (error) {
            return { error: "Error setting tutorial status" };
        }
    };

    const logout = () => {
        ls.clear();
        token.current = null;
        emit("refreshApp");
    };

    const deleteAccount = async () => {
        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/deleteAccount`, {
                method: "get",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    token: token.current,
                },
            });

            const response = await rawResponse.json();

            // Logout
            if ("success" in response) logout();

            return response;
        } catch (error) {
            return { error: "Error getting people around you" };
        }
    };

    return (
        <API.Provider
            value={{
                loginOrRegister,
                getUserInfo,
                setHighScore,
                getTopTen,
                setTutorialStatus,
                logout,
                deleteAccount,
            }}
        >
            {props.children}
        </API.Provider>
    );
};

export default APIProvider;
