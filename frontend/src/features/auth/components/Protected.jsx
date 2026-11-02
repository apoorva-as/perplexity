import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router'
import Splash from '../../../shared/components/Splash'


const Protected = ({ children }) => {
    const user = useSelector(state => state.auth.user)
    const loading = useSelector(state => state.auth.loading)
    const location = useLocation()

    if (loading) {
        return <Splash />
    }

    if (!user) {
        // Remember where the user was headed so login can send them back.
        return <Navigate to="/login" replace state={{ from: location.pathname }} />
    }


    return children
}

export default Protected
