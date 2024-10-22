import { Link } from 'react-router-dom';
import "./Navbar.css";

function Navbar() {
    return ( 
        <div className='hoverCapture'>
        <div className='navbar'>
            <Link to="/">Home</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/tracks">Track Browser</Link>
            <Link to="/trackedit">Track Editor</Link>
        </div>
        </div>
    );
}

export default Navbar;