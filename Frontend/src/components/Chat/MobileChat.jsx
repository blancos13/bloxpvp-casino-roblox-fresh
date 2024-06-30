import { rules, UK, sendIcon } from "../../assets/imageExport";
import Chatbox from "./Chatbox";
import { useCallback, useEffect, useState } from "react";
import "./MobileChat.css";
import { useContext } from "react";
import { getJWT } from "../../utils/api";
import UserContext from "../../utils/UserContext";
import SocketContext from "../../utils/SocketContext";
import { toast } from "react-hot-toast";
import ChatRules from "../Popups/ChatRules";
import Giveaway from "./Giveaway";
import { m, AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import config from "../../config";

export default function MobileChat({ closeChat }) {
  const userData = useContext(UserContext);
  const socket = useContext(SocketContext);
  const [modalState, setModalState] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [giveawayPopup, setGiveawayPopup] = useState(null);

  useEffect(() => {
    fetch(`${config.api}/chat`, {
      mode: "cors",
      method: "GET",
    }).then(async (res) => {
      const data = await res.json();

      setMessages(data.messages);
      setOnlineCount(data.onlineCount);
      if (data.giveaways.newGiveaways.length > 0) {
        setGiveawayPopup(<Giveaway Information={data.giveaways} />);
      }
    });
  }, []);

  const handleInputChange = useCallback((e) => {
    setInputValue(e.target.value);
  }, []);

  const handleChatUpdate = useCallback(async (data) => {
    setMessages(data.messages);
    setOnlineCount(data.onlineCount);
  }, []);

  const handleGiveawayPopup = useCallback(async (data) => {
    if (data.newGiveaways.length >= 1) {
      setGiveawayPopup(<Giveaway Information={data} />);
    }
  }, []);

  const handleChatRulesModal = useCallback(() => {
    setModalState(<ChatRules closeModal={() => setModalState(null)} />);
  }, []);

  const handleSendMessage = useCallback(
    async (e) => {
      e.preventDefault();
      const messageBody = JSON.stringify({
        message: inputValue,
      });
      await fetch(`${config.api}/message`, {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${getJWT()}`,
        },
        mode: "cors",
        method: "POST",
        body: messageBody,
      }).then((res) => {
        if (res.status == 429) {
          toast.error("Please wait 3 seconds in between messages", {
            position: "top-right",
          });
        }
      });
      setInputValue("");
    },
    [inputValue]
  );

  const handleOnlineUpdate = useCallback((count) => {
    setOnlineCount(count);
  }, []);

  useEffect(() => {
    socket.on("CHAT_UPDATE", handleChatUpdate);
    socket.on("GIVEAWAY_UPDATE", handleGiveawayPopup);
    socket.on("ONLINE_UPDATE", handleOnlineUpdate);
    return () => {
      socket.off("CHAT_UPDATE", handleChatUpdate);
      socket.off("GIVEAWAY_UPDATE", handleGiveawayPopup);
      socket.off("ONLINE_UPDATE", handleOnlineUpdate);
    };
  }, [socket, handleGiveawayPopup, handleChatUpdate, handleOnlineUpdate]);

  return (
    <>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="MobileChatBackground"
        onClick={closeChat}
      >
        <m.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 500 }}
          transition={{ type: "tween" }}
          className="MobileChat"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="ChatInfo">
            <div className="Rules" onClick={() => handleChatRulesModal()}>
              <img src={rules} alt="Chat Rules" />
            </div>
            <div className="Chatdetails">
              <div className="Chatroom">
                <img width="20px" src={UK} alt="Country Flag" />
                <p>English Chat</p>
              </div>
              <div className="ChatStats">
                <div className="RedCount"></div>
                <p className="NumberCount">{onlineCount}</p>
              </div>
            </div>
            {giveawayPopup}
          </div>
          <div className="Messages">
            {messages.map((message) => {
              return (
                <Chatbox
                  key={message._id}
                  Information={message}
                  setModal={setModalState}
                />
              );
            })}
          </div>
          <div className="SendMessage">
            <form
              action=""
              method="post"
              autoComplete="off"
              onSubmit={(e) => handleSendMessage(e)}
            >
              <div>
                {userData && (
                  <>
                    <input
                      type="text"
                      placeholder="Say something..."
                      value={inputValue}
                      onChange={(e) => handleInputChange(e)}
                      minLength="3"
                      required
                      maxLength="100"
                    />
                    <m.img
                      whileTap={{ scale: 0.9 }}
                      src={sendIcon}
                      alt=""
                      onClick={(e) => handleSendMessage(e)}
                    />
                  </>
                )}
                {!userData && (
                  <p className="error">You must be logged in to chat</p>
                )}
              </div>
            </form>
          </div>
        </m.div>
        <AnimatePresence>{modalState && modalState}</AnimatePresence>
      </m.div>
    </>
  );
}

MobileChat.propTypes = {
  closeChat: PropTypes.func,
};
