import {
    discord,
    support
} from '../../assets/imageExport'
import './Sidebar.css'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

export default function Sidebar () {
    const location = useLocation();
    return (
        <div className="Sidebar">
            <div className="Games">
                <Link className={`Game Coinflip ${location.pathname == '/' ? 'Active' : 'Inactive'}`} to={'/'}>
                    <div className="TopLayer">
                        <img src='' alt="Coinflip Game" />
                        <p>Coinflip</p>
                    </div>
                    <div className="ShadowLayer">
                        <img src='' alt="Coinflip Game" />
                        <p>Coinflip</p>
                    </div>
                </Link>
                <Link className={`Game Jackpot ${location.pathname == '/jackpot' ? 'Active' : 'Inactive'}`} to={'/jackpot'}>
                    <div className="TopLayer">
                        <img src='' alt="Jackpot Game" />
                        <p>Jackpot</p>
                    </div>
                    <div className="ShadowLayer">
                        <img src='' alt="Jackpot Game" />
                        <p>Jackpot</p>
                    </div>
                </Link>
                <Link className={`Game Marketplace ${location.pathname == '/marketplace' ? 'Active' : 'Inactive'}`} to={'/marketplace'}>
                    <div className="TopLayer">
                        <img src='' alt="Marketplace Game" />
                        <p>Marketplace</p>
                    </div>
                    <div className="ShadowLayer">
                        <img src='' alt="Marketplace Game" />
                        <p>Marketplace</p>
                    </div>
                </Link>
            </div>
            <div className="SocialLinks">
                <a className="Link Discord" href='https://discord.gg/bloxpvp' target='_blank'>
                    <img src={discord} alt="Discord Logo" />
                    <p>DISCORD</p>
                </a>
                <div className="Link Support">
                    <img src={support} alt="Support Logo" />
                    <p>SUPPORT</p>
                </div>
            </div>
        </div>
    )
}