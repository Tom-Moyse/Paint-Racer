import { Link } from 'react-router-dom';
import { useUserContext } from "../../utils/UserContext";
import Navbar from '../../common/Navbar';

function HomePage() {
    const { userID } = useUserContext();

    if (userID === undefined){
        return (
            <>
                <h1 style={{margin: '1em auto'}}>Paint Racer Home Page!</h1>
                <button><Link to='/login'>Login</Link></button>
                <button><Link to='/register'>Register</Link></button>
            </>
        );
    }
    return (
        <>
            <Navbar />
            <h1 style={{margin: '1em auto'}}>Paint Racer Home Page!</h1>
            <button><Link to='/tracks'>Browse Tracks</Link></button>
            <button><Link to='/profile'>View Profile</Link></button>
            <button><Link to='/trackedit'>Create Track</Link></button>
        </>
    );
}

export default HomePage;