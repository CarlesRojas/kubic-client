import { createContext, useContext } from "react";
import ls from "local-storage";

import { Data } from "./Data";

const API_VERSION = "api_v1";
const API_URL = "https://kubic3d.herokuapp.com/"; // "http://localhost:3100/";

export const API = createContext();
const APIProvider = (props) => {
    const { APP_NAME } = useContext(Data);

    const validateUsername = async (username) => {
        const postData = { username };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/score/validateUsername`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify(postData),
            });

            const response = await rawResponse.json();

            if ("newScoreEntry" in response) return response.newScoreEntry;

            return response;
        } catch (error) {
            return { error: "Error registering nickname" };
        }
    };

    const getUser = async (username) => {
        const postData = { username };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/score/getUser`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify(postData),
            });

            const response = await rawResponse.json();

            if ("user" in response) return response.user;

            return response;
        } catch (error) {
            return { error: "Error registering nickname" };
        }
    };

    const setScore = async (username, score) => {
        const postData = { username, score };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/score/setScore`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
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

    const getTopThree = async () => {
        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/score/setScore`, {
                method: "get",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            });

            const response = await rawResponse.json();

            return response;
        } catch (error) {
            return { error: "Error getting top three" };
        }
    };

    const getPeopleAroundYou = async (username) => {
        const postData = { username };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/score/getPeopleAroundYou`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify(postData),
            });

            const response = await rawResponse.json();

            return response;
        } catch (error) {
            return { error: "Error getting people around you" };
        }
    };

    return (
        <API.Provider
            value={{
                validateUsername,
                getUser,
                setScore,
                getTopThree,
                getPeopleAroundYou,
            }}
        >
            {props.children}
        </API.Provider>
    );
};

export default APIProvider;
