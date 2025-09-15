import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const instance = axios.create({
    baseURL: "https://uni-smart-tracker.onrender.com/api",
    timeout: 120000,
});

instance.interceptors.request.use(async config => {
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
        `[API Request] ${config.method?.toUpperCase()} → ${config.baseURL}${config.url}`,
        config.data ? `\nPayload: ${JSON.stringify(config.data)}` : ""
    );
    return config;
});

instance.interceptors.response.use(
    response => {
        console.log(
            `[API Response] ✅ ${response.status} → ${response.config.url}`
        );
        return response;
    },
    async error => {
        if (error.response) {
            console.log(
                `[API Error] ❌ ${error.response.status} → ${error.config.url}`,
                error.response.data
            );
        } else {
            console.log("[API Error] ❌ Network/Timeout:", error.message);
        }

        if (error.response?.status === 401) {
            await AsyncStorage.removeItem("access_token");
        }
        return Promise.reject(error);
    }
);

export default instance;