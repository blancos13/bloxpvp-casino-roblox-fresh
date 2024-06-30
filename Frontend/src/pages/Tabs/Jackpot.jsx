import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import Chat from "../../components/Chat/Chat";
import JackpotPage from "../../components/Jackpot/JackpotPage";
import MobileSidebar from "../../components/Sidebar/MobileSidebar";
import MobileChat from "../../components/Chat/MobileChat";
import { menu, mail, chat } from "../../assets/imageExport";
import { useCallback, useState } from "react";
import { AnimatePresence } from "framer-motion";
import "./Jackpot.css";

export default function Jackpot() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [tabOpen, setTabOpen] = useState(null);

  const handleMenuOpen = useCallback(() => {
    if (menuOpen == false) {
      setTabOpen(
        <MobileSidebar
          closeMenu={() => {
            setTabOpen(null);
            setMenuOpen(false);
          }}
        />
      );
      setMenuOpen(true);
    } else {
      setTabOpen(null);
      setMenuOpen(false);
    }
  }, [menuOpen]);

  const handleChatOpen = useCallback(() => {
    if (chatOpen == false) {
      setTabOpen(
        <MobileChat
          closeChat={() => {
            setTabOpen(null);
            setChatOpen(false);
          }}
        />
      );
      setChatOpen(true);
    } else {
      setTabOpen(null);
      setChatOpen(false);
    }
  }, [chatOpen]);
  return (
    <>
      <div className="Jackpot">
        <Sidebar />
        <Navbar />
        <Chat />
        <JackpotPage />
      </div>
      <div className="MobileNav" style={{ display: "none" }}>
        <div className="Tab" onClick={handleMenuOpen}>
          <img src={menu} alt="menu icon" />
          <p>MENU</p>
        </div>
        <a className="Tab" href="https://discord.gg/bloxpvp" target="_blank">
          <img src={mail} alt="mail icon" />
          <p>SUPPORT</p>
        </a>
        <div className="Tab" onClick={handleChatOpen}>
          <img src={chat} alt="chat icon" />
          <p>CHAT</p>
        </div>
      </div>
      <AnimatePresence>{tabOpen}</AnimatePresence>
    </>
  );
}
