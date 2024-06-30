import "./Profile.css";
import {
  backArrow,
  statistics,
  tippingCash,
  diceGradient,
  coinsGradient,
  coinsDrop,
} from "../../assets/imageExport";
import PropTypes from "prop-types";
import { m } from "framer-motion";
import config from "../../config";
import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function Profile({ closeModal, userId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    const profileBody = JSON.stringify({
      userId: userId,
    });

    fetch(`${config.api}/profile`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
      body: profileBody,
      method: "post",
    }).then(async (res) => {
      const info = await res.json();
      if (res.status == 200 || res.status == 304) {
        setData(info);
      }
    });
  }, [userId]);

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="ModalBackground"
      onClick={() => closeModal()}
    >
      {data ? (
        <m.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="Profile"
        >
          <div className="Header">
            <div className="Profile">
              <img
                src={data.thumbnail}
                alt="profile picture"
                width={96}
                height={96}
              />
              <div className="Info">
                <div className="Heading">
                  <p>{data.username}</p>
                  <div className="Level">
                    <p>LVL {numeral(Math.floor(data.level)).format("0,0")}</p>
                  </div>
                </div>
                <div className="Stats">
                  <p className="XP">
                    XP:{" "}
                    <span>
                      {numeral(data.xp).format("0,0")}/
                      {numeral(data.xpMax).format("0,0")}
                    </span>
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={data.xpMax}
                    value={data.xp}
                    id="XPRange"
                    readOnly
                    aria-readonly
                    style={{
                      background: `linear-gradient(to right, #FF7575 ${0}%, #D42626 ${
                        (data.xp / data.xpMax) * 100
                      }%, #211936 ${(data.xp / data.xpMax) * 100}%)`,
                      borderRadius: "2px",
                    }}
                  />
                  <p className="JoinDate">
                    Join Date: <span>{format(data.joinDate, "PPPp")}</span>
                  </p>
                </div>
              </div>
              <div className="Navigation" onClick={closeModal}>
                <p>Go Back</p>
                <img src={backArrow} alt="back arrow" />
              </div>
            </div>
          </div>
          <div className="Content">
            <div className="Container">
              <div className="Actions">
                <div className="Header">
                  <p>Actions</p>
                </div>
                <div className="Tip">
                  <img
                    src={tippingCash}
                    width={8}
                    height={8}
                    alt="tipping icon"
                  />
                  <p>TIP</p>
                </div>
              </div>
              <div className="Statistics">
                <div className="Header">
                  <img src={statistics} alt="statistics icon" />
                  <p>User Statistics</p>
                </div>
                <div className="Boxes">
                  <div className="Box">
                    <div className="Header">
                      <img src={diceGradient} alt="dice icon" />
                      <p>Total Bets</p>
                    </div>
                    <p>{numeral(data.totalBets).format("0,0")}</p>
                  </div>
                  <div className="Box">
                    <div className="Header">
                      <img src={diceGradient} alt="dice icon" />
                      <p>Games Won</p>
                    </div>
                    <p>{numeral(data.gamesWon).format("0,0")}</p>
                  </div>
                  <div className="Box">
                    <div className="Header">
                      <img src={coinsGradient} alt="dice icon" />
                      <p>Total Wagered</p>
                    </div>
                    <p>{numeral(data.wagered).format("0,0")} R$</p>
                  </div>
                  <div className="Box">
                    <div className="Header">
                      <img src={coinsDrop} alt="dice icon" />
                      <p>Net Profit</p>
                    </div>
                    <p>
                      {data.profit > 0 && "+"}
                      {numeral((data.profit * 1000) / 5).format("0,0")} R$
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </m.div>
      ) : (
        <div className="loadingContainer">
          <div className="loading"></div>
        </div>
      )}
    </m.div>
  );
}

Profile.propTypes = {
  closeModal: PropTypes.func,
  userId: PropTypes.string,
};
