import "./Navbar.css";
import {
  discordBox,
  twitterBox,
  robux,
  notificationBell,
  logout,
  longLogo,
  coloredLogo,
  dollarsNav,
} from "../../assets/imageExport";
import { useContext, useCallback, useState, useEffect } from "react";
import UserContext from "../../utils/UserContext";
//import Login from "../Account/Login";
import Withdraw from "../Cashier/Withdraw";
import Deposit from "../Cashier/Deposit";
import FAQ from "../Popups/FAQ";
import TOS from "../Popups/TOS";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import SocketContext from "../../utils/SocketContext";
import Cookies from "js-cookie";
import { AnimatePresence, m } from "framer-motion";
//import Register from "../Account/Register";
import Profile from "../Popups/Profile";
import ForgotPassword from "../Popups/ForgotPassword";
import ConnectRoblox from "../Account/ConnectRoblox";
export default function Navbar() {
  const location = useLocation();
  const userData = useContext(UserContext);
  const [modalState, setModalState] = useState(null);
  const [userBalance, setUserBalance] = useState(0);
  const [balanceInteger, setBalanceInteger] = useState("0");
  const [balanceDecimal, setBalanceDecimal] = useState("00");
  const socket = useContext(SocketContext);


  const handleLoginModal = useCallback(() => {
    setModalState(
      <ConnectRoblox
        closeModal={() => setModalState(null)}
        changeModal={() =>
          setModalState(
            <ForgotPassword closeModal={() => setModalState(null)} />
          )
        }
      />
    );
  }, []);

  const handleDepositModal = useCallback(() => {
    setModalState(
      <Deposit
        closeModal={() => setModalState(null)}
        changeModal={setModalState}
      />
    );
  }, []);

  const handleWithdraw = useCallback(() => {
    setModalState(
      <Withdraw
        closeModal={() => setModalState(null)}
        renderModal={setModalState}
      />
    );
  }, []);

  const handleLogout = useCallback(() => {
    Cookies.remove("jwt", { path: "" });
    window.location.reload();
  }, []);

  useEffect(() => {
    if (userData?.robloxId) {
      const balanceDivided = userData.balance.toString().split(".");
      if (balanceDivided.length < 2) {
        setBalanceInteger(balanceDivided[0]);
        setBalanceDecimal("00");
      } else {
        setBalanceInteger(balanceDivided[0]);
        setBalanceDecimal(balanceDivided[1]);
      }
      if (userData?.robloxId) {
        setUserBalance(userData.balance);
      }
    }
  }, [userData]);

  return (
    <>
      <div className="Navbar">
        <img src={longLogo} alt="Long Form Logo" className="Logo" />
        <div className="Content">
          <div className="InfoLinks">
            <div className="Link Purple Raffle">
              <p>1K Raffle</p>
            </div>
            <div className="Link Purple Event">
              <p>EVENT</p>
            </div>
            <div className="ImportantLinks">
              <div className="Affiliates Link">
                <p>Affiliates</p>
              </div>
              <div className="Responsibility Link">
                <p>Game Responsibly</p>
              </div>
              <div className="Fairness Link">
                <p>Fairness</p>
              </div>
            </div>
            <div
              className="Link FAQ"
              onClick={() =>
                setModalState(<FAQ closeModal={() => setModalState(null)} />)
              }
            >
              <p>FAQ</p>
            </div>
            <div
              className="Link TOS"
              onClick={() =>
                setModalState(<TOS closeModal={() => setModalState(null)} />)
              }
            >
              <p>Terms Of Service</p>
            </div>
            <div className="Link Claims">
              <p>Claims</p>
            </div>
            <div className="SocialLinks">
              <a href="https://twitter.com/bloxpvp1" target="_blank">
                <img src={twitterBox} alt="Twitter" className="Twitter" />
              </a>
              <a href="https://discord.gg/bloxpvp" target="_blank">
                <img src={discordBox} alt="Discord" className="Discord" />
              </a>
            </div>
          </div>
          <div className="NavLinks">
            <img
              src={coloredLogo}
              style={{ display: "none" }}
              alt="bloxpvp logo"
              className="Logo"
            />
            <div className="GameLinks">
              <Link
                className={`GameLink Coinflip ${
                  location.pathname == "/" ? "Active" : "Inactive"
                }`}
                to={"/"}
              >
                <img src="" alt="" />
                <p>Coinflip</p>
              </Link>
              <Link
                className={`GameLink Jackpot ${
                  location.pathname == "/jackpot" ? "Active" : "Inactive"
                }`}
                to={"/jackpot"}
              >
                <img src="" alt="" />
                <p>Jackpot</p>
              </Link>
              <Link
                className={`GameLink Marketplace ${
                  location.pathname == "/marketplace" ? "Active" : "Inactive"
                }`}
                to={"/marketplace"}
              >
                <img src="" alt="" />
                <p>Marketplace</p>
              </Link>
            </div>
            {userData && (
              <div className="Wallet">
                <div className="Balance">
                  <div className="ImageContainer">
                    <img
                      src={`${dollarsNav}`}
                      className="foregroundImage"
                      alt="Item"
                    />
                    <img
                      src={`${dollarsNav}`}
                      className="backgroundImage"
                      alt="Item"
                    />
                  </div>
                  <span className="Integers">
                    {balanceInteger}
                    <span className="Decimals">
                      .{balanceDecimal.substring(0, 2)}
                    </span>
                  </span>
                </div>
                <div className="Deposit" onClick={handleDepositModal}>
                  <p>Deposit</p>
                </div>
                <div
                  className="Cashier"
                  onClick={() => handleWithdraw()}
                  style={{ display: "none" }}
                >
                  <p>Wallet</p>
                </div>
              </div>
            )}
            {userData && (
              <div className="Profile">
                <div className="Money">
                  <div className="Withdraw" onClick={() => handleWithdraw()}>
                    <p>Withdraw</p>
                  </div>
                  <div className="Notifications Notification">
                    <img src={notificationBell} alt="Notification Bell" />
                  </div>
                </div>
                <div className="User">
                  <m.img
                    src={userData.thumbnail}
                    alt="profile picture"
                    onClick={() => {
                      setModalState(
                        <Profile
                          closeModal={() => setModalState(null)}
                          userId={userData.robloxId}
                        />
                      );
                    }}
                  />
                  <div className="ProfileInfo">
                    <p className="Username">{userData.username}</p>
                    <p className="Level">Level {Math.floor(userData.level)}</p>
                  </div>
                  <div className="Logout" onClick={handleLogout}>
                    <img src={logout} alt="Logout" />
                  </div>
                </div>
              </div>
            )}
            {!userData && (
              <div className="auth-buttons">
                <div className="Login" onClick={handleLoginModal}>
                  <p>Login</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <AnimatePresence>{modalState && modalState}</AnimatePresence>
    </>
  );
}
