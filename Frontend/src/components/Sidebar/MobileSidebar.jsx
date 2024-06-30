import { discord, support } from "../../assets/imageExport";
import "./MobileSidebar.css";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { m } from "framer-motion";

export default function MobileSidebar({ closeMenu }) {
  const location = useLocation();
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="MobileSidebarBackground"
      onClick={closeMenu}
    >
      <m.div
        initial={{ x: -400 }}
        animate={{ x: 0 }}
        exit={{ x: -400 }}
        transition={{ type: "tween" }}
        onClick={(e) => e.stopPropagation()}
        className="MobileSidebar"
      >
        <div className="Games">
          <Link
            className={`Game Coinflip ${
              location.pathname == "/" ? "Active" : "Inactive"
            }`}
            to={"/"}
          >
            <div className="TopLayer">
              <img src="" alt="Coinflip Game" />
              <p>Coinflip</p>
            </div>
            <div className="ShadowLayer">
              <img src="" alt="Coinflip Game" />
              <p>Coinflip</p>
            </div>
          </Link>
          <Link
            className={`Game Jackpot ${
              location.pathname == "/jackpot" ? "Active" : "Inactive"
            }`}
            to={"/jackpot"}
          >
            <div className="TopLayer">
              <img src="" alt="Jackpot Game" />
              <p>Jackpot</p>
            </div>
            <div className="ShadowLayer">
              <img src="" alt="Jackpot Game" />
              <p>Jackpot</p>
            </div>
          </Link>
          <Link
            className={`Game Marketplace ${
              location.pathname == "/marketplace" ? "Active" : "Inactive"
            }`}
            to={"/marketplace"}
          >
            <div className="TopLayer">
              <img src="" alt="Marketplace Game" />
              <p>Marketplace</p>
            </div>
            <div className="ShadowLayer">
              <img src="" alt="Marketplace Game" />
              <p>Marketplace</p>
            </div>
          </Link>
        </div>
        <div className="SocialLinks">
          <a
            className="Link Discord"
            href="https://discord.gg/bloxpvp"
            target="_blank"
          >
            <img src={discord} alt="Discord Logo" />
            <p>DISCORD</p>
          </a>
        </div>
      </m.div>
    </m.div>
  );
}

MobileSidebar.propTypes = {
  closeMenu: PropTypes.func,
};
