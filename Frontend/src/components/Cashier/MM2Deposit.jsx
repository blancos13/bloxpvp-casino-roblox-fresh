import PropTypes from "prop-types";
import "./MM2Deposit.css";
import { logoGradient, backArrow } from "../../assets/imageExport";
import { useState, useEffect } from "react";
import { m } from "framer-motion";
import config from "../../config";

export default function MM2DepositModal({ closeModal, changeModal }) {
  const [bots, setBots] = useState([]);

  useEffect(() => {
    fetch(`${config.api}/cashier/bots/mm2`, {
      method: "GET",
    }).then(async (req) => {
      if (req.status == 200) {
        const foundBots = await req.json();
        setBots(foundBots);
      } else {
        console.error("Error retrieving MM2 bots");
      }
    });
  }, []);

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="ModalBackground"
      onClick={closeModal}
    >
      <m.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="MM2Modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="Nav">
          <div className="Title">
            <img src={logoGradient} alt="bloxpvp logo" />
            <p>Bots</p>
          </div>
          <m.div
            whileHover={{ opacity: 0.7 }}
            className="Navigate"
            onClick={changeModal}
          >
            <p>Go Back</p>
            <img src={backArrow} alt="" />
          </m.div>
        </div>
        <div className="Content">
          <div className="BotsContainer">
            <div className="Bots">
              {bots.map((bot) => {
                return (
                  <div key={bot._id} className="Bot">
                    <div className="Info">
                      <img src={bot.thumbnail} alt="" className="Pfp" />
                      <p className="Name">{bot.username}</p>
                      <div
                        className={
                          bot.status == "Online" ? "Online" : "Offline"
                        }
                      >
                        <div
                          className={
                            bot.status == "Online" ? "Online" : "Offline"
                          }
                        ></div>
                      </div>
                    </div>
                    <m.a
                      whileHover={{ opacity: 0.7 }}
                      whileTap={{ scale: 0.95 }}
                      href={bot.privateServer}
                      target="_blank"
                      className="Join"
                    >
                      <p>Join</p>
                    </m.a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </m.div>
    </m.div>
  );
}

MM2DepositModal.propTypes = {
  closeModal: PropTypes.func,
  changeModal: PropTypes.func,
};
