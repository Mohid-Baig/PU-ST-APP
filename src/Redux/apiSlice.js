import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout, loginSuccess } from "./authslice";

const baseQuery = fetchBaseQuery({
    baseUrl: "https://uni-smart-tracker.onrender.com/api",
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token;
        if (token) {
            headers.set("Authorization", `Bearer ${token}`);
        }
        return headers;
    },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        const refreshToken = api.getState().auth.refreshToken;
        const refreshResult = await baseQuery(
            {
                url: "/auth/refresh",
                method: "POST",
                body: { refreshToken },
            },
            api,
            extraOptions
        );

        if (refreshResult.data) {
            api.dispatch(
                loginSuccess({
                    token: refreshResult.data.accessToken,
                    refreshToken: api.getState().auth.refreshToken,
                    user: api.getState().auth.user,
                })
            );

            result = await baseQuery(args, api, extraOptions);
        } else {
            api.dispatch(logout());
        }
    }

    return result;
};

export const api = createApi({
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                body: credentials,
            }),
        }),
        logout: builder.mutation({
            query: (credentials) => ({
                url: "/auth/logout",
                method: "POST",
                body: credentials,
            }),
        }),
        updateProfile: builder.mutation({
            query: (profile) => ({
                url: "/auth/update-profile",
                method: "PUT",
                body: profile,
            }),
        }),
        getProfile: builder.query({
            query: () => "/auth/profile",
        }),
        getpolls: builder.query({
            query: () => '/polls',
        }),
        getpollbyid: builder.query({
            query: (id) => `/polls/${id}`,
        }),
        getlostfound: builder.query({
            query: () => '/lostfound',
        }),
        getallissues: builder.query({
            query: () => '/report/issues/all-issues',
        }),
        issuesReportedbyme: builder.query({
            query: () => '/report/issues/reported-by-me',
        }),
        gethelpboard: builder.query({
            query: () => '/helpboard',
        }),
        getfeedback: builder.query({
            query: () => '/feedback',
        }),
        getevents: builder.query({
            query: () => '/events',
        }),
        getanonymous: builder.query({
            query: () => '/anonymous',
        }),
        postfcmtoken: builder.mutation({
            query: (token) => ({
                url: '/events/register-device',
                method: 'POST',
                body: { token },
            }),
        }),
    }),
});

export const {
    useLoginMutation,
    useLogoutMutation,
    useUpdateProfileMutation,
    useGetProfileQuery,
    useLazyGetProfileQuery,
    useGetpollsQuery,
    useGetpollbyidQuery,
    useGetlostfoundQuery,
    useGetallissuesQuery,
    useIssuesReportedbymeQuery,
    useGethelpboardQuery,
    useGetfeedbackQuery,
    useGeteventsQuery,
    useGetanonymousQuery,
    usePostfcmtokenMutation,
} = api;
