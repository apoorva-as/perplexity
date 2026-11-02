import { useDispatch } from "react-redux";
import { register, login, getMe, logout } from "../service/auth.api";
import { setUser, setLoading, setError } from "../auth.slice";
import { setChats, setCurrentChatId, setError as setChatError } from "../../chat/chat.slice";

// The API returns either { message } or express-validator's { errors: [{ msg }] }.
const getErrorMessage = (error, fallback) =>
    error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || fallback


export function useAuth() {


    const dispatch = useDispatch()

    async function handleRegister({ username, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await register({ username, password })
            dispatch(setUser(data.user))
            return true
        } catch (error) {
            dispatch(setError(getErrorMessage(error, "Registration failed")))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogin({ username, password }) {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await login({ username, password })
            dispatch(setUser(data.user))
            return true
        } catch (err) {
            dispatch(setError(getErrorMessage(err, "Login failed")))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleGetMe() {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await getMe()
            dispatch(setUser(data.user))
        } catch (err) {
            // 401 means not logged in, not an error
            if (err.response?.status !== 401) {
                dispatch(setError(getErrorMessage(err, "Failed to fetch user data")))
            }
        } finally {
            dispatch(setLoading(false))
        }
    }

    async function handleLogout() {
        try {
            await logout()
        } catch (err) {
            // The cookie may still be set, so stay signed in and show the error in the dashboard toast.
            dispatch(setChatError(getErrorMessage(err, "Logout failed. Please try again.")))
            return false
        }
        // Drop this account's data so the next user starts clean.
        dispatch(setChats({}))
        dispatch(setCurrentChatId(null))
        dispatch(setChatError(null))
        dispatch(setUser(null))
        return true
    }

    function clearError() {
        dispatch(setError(null))
    }

    return {
        handleRegister,
        handleLogin,
        handleGetMe,
        handleLogout,
        clearError,
    }

}
