import { useSelector } from '-redux'
import { Navigate, Outlet } from '-router-dom';

export default function PrivateRoute() {
    const {currentUser} = useSelector(state => state.user);
    return currentUser ? <Outlet/> : <Navigate to="/signin"/>
}
  