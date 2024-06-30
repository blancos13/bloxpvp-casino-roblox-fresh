import "./CoinflipView.css";
import { useState, useCallback, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import SocketContext from "../../../utils/SocketContext";
import {
  logo,
  anonymous,
  verification,
  copy,
  backArrow,
} from "../../../assets/imageExport";
import { getJWT } from "../../../utils/api";
import { format } from "date-fns";
import HeadsVideo from "../../../assets/videos/heads.mp4";
import TailsVideo from "../../../assets/videos/tails.mp4";
import { m, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

export default function CoinflipViewing({ Information, closeModal }) {
  const [isLoading, setIsLoading] = useState(false);
  const socket = useContext(SocketContext);
  const [winnerDisplay, setWinnerDisplay] = useState(null);
  const [gameInfo, setGameInfo] = useState(Information);
  const [fairnessModal, setFairnessModal] = useState(false);

  const handleCoinflipUpdate = useCallback(
    async (data) => {
      data._id == Information._id ? setGameInfo(data) : "";
    },
    [Information]
  );

  const handleProvablyFairPopup = useCallback(() => {
    if (fairnessModal == false) {
      setFairnessModal(true);
    } else {
      setFairnessModal(false);
    }
  }, [fairnessModal]);

  useEffect(() => {
    setTimeout(() => {
      if (gameInfo.winnerCoin != null) {
        if (gameInfo.winnerCoin == gameInfo.ownerCoin) {
          setWinnerDisplay("winnerOne");
        } else {
          setWinnerDisplay("winnerTwo");
        }
      }
    }, 3750);
  }, [gameInfo]);

  useEffect(() => {
    socket.on("COINFLIP_FINISHED", handleCoinflipUpdate);
    return () => {
      socket.off("COINFLIP_FINISHED", handleCoinflipUpdate);
    };
  }, [socket, handleCoinflipUpdate]);

  return (
    <>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="ModalBackground"
        onClick={() => closeModal()}
      >
        {isLoading && (
          <div className="loadingContainer">
            <div className="loading"></div>
          </div>
        )}
        <AnimatePresence>
          {fairnessModal && (
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ModalBackground"
              onClick={(e) => {
                e.stopPropagation();
                handleProvablyFairPopup();
              }}
            >
              <m.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="FairnessModal"
              >
                <h2>Game Fairness</h2>
                <div className="Info">
                  <div className="DataContainer">
                    <h3>Hashed Server Seed</h3>
                    <div className="Text">
                      <p>{gameInfo.hashedServerSeed}</p>
                      <img
                        src={copy}
                        alt="copy icon"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            gameInfo.hashedServerSeed
                          );
                          toast.success("Hashed Server Seed Copied");
                        }}
                      />
                    </div>
                  </div>
                  <div className="DataContainer">
                    <h3>Server Seed</h3>
                    <div className="Text">
                      <p>
                        {gameInfo.serverSeed == null
                          ? "Unavailable"
                          : gameInfo.serverSeed}
                      </p>
                      <img
                        src={copy}
                        alt="copy icon"
                        onClick={() => {
                          if (gameInfo.serverSeed != null) {
                            navigator.clipboard.writeText(
                              gameInfo.hashedServerSeed
                            );
                            toast.success("Server Seed Copied");
                          }
                        }}
                      />
                    </div>
                  </div>
                  <div className="DataContainer">
                    <h3>Client Seed</h3>
                    <div className="Text">
                      <p>
                        {gameInfo.clientSeed == null
                          ? "Unavailable"
                          : gameInfo.clientSeed}
                      </p>
                      <img
                        src={copy}
                        alt="copy icon"
                        onClick={() => {
                          if (gameInfo.clientSeed != null) {
                            navigator.clipboard.writeText(gameInfo.clientSeed);
                            toast.success("Client Seed Copied");
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
                <p>
                  Click
                  <a
                    href="https://onecompiler.com/javascript/429yzg93c"
                    target="_blank"
                  >
                    {" "}
                    here{" "}
                  </a>
                  for more information & a visual representation.
                </p>
                <m.div
                  whileHover={{ opacity: 0.7 }}
                  className="Navigate"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProvablyFairPopup();
                  }}
                >
                  <p>Go Back</p>
                  <img src={backArrow} alt="back arrow icon" />
                </m.div>
              </m.div>
            </m.div>
          )}
        </AnimatePresence>
        <m.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="ViewingModal"
          onClick={(e) => e.stopPropagation()}
        >
          <img src={logo} alt="BLOXPVP Logo" />
          <div className="Players">
            <div
              className={`PlayerOne ${
                winnerDisplay == null
                  ? ""
                  : winnerDisplay == "winnerOne"
                  ? "WinnerState"
                  : "LoserState"
              }`}
            >
              <div className="Pfp">
                <img src={gameInfo.playerOne.thumbnail} alt="Profile Picture" />
                <p>
                  {winnerDisplay == null
                    ? ""
                    : winnerDisplay == "winnerOne"
                    ? "Won"
                    : "Lost"}
                </p>
              </div>
              <div className="Info">
                <p className="Username">{gameInfo.playerOne.username}</p>
                <p className="Level">
                  Level {Math.floor(gameInfo.playerOne.level)}
                </p>
              </div>
              <p className="Percent">50%</p>
            </div>
            {gameInfo.winnerCoin == null ? (
              <p className="VS">VS</p>
            ) : (
              <video
                playsInline
                autoPlay
                muted
                src={gameInfo.winnerCoin == "heads" ? HeadsVideo : TailsVideo}
                width={300}
              ></video>
            )}
            <div
              className={`PlayerTwo ${
                winnerDisplay == null
                  ? ""
                  : winnerDisplay == "winnerTwo"
                  ? "WinnerState"
                  : "LoserState"
              }`}
            >
              <div className="Pfp">
                <img
                  src={
                    gameInfo.playerTwo
                      ? gameInfo.playerTwo.thumbnail
                      : anonymous
                  }
                  alt="Profile Picture"
                />
                <p>
                  {winnerDisplay == null
                    ? ""
                    : winnerDisplay == "winnerTwo"
                    ? "Won"
                    : "Lost"}
                </p>
              </div>
              <div className="Info">
                <p className="Username">
                  {gameInfo.playerTwo
                    ? gameInfo.playerTwo.username
                    : "Waiting..."}
                </p>
                <p className="Level">
                  {gameInfo.playerTwo &&
                    `Level ${Math.floor(gameInfo.playerTwo.level)}`}
                </p>
              </div>
              <p className="Percent">50%</p>
            </div>
          </div>
          <div className="ProvablyFair">
            <div className="Container" onClick={handleProvablyFairPopup}>
              <img src={verification} alt="provably fair icon" />
              <p>{gameInfo._id}</p>
            </div>
          </div>
          <div className="Bottom">
            <div className="Items">
              <div className="FirstItems">
                {gameInfo.playerOne.items.map((item) => {
                  return (
                    <div className="Item" key={item._id}>
                      <div
                        className={`${
                          Information.game == "PS99" ? "PS99" : "imageContainer"
                        }`}
                        key={item._id + Math.random()}
                      >
                        <img
                          src={`${item.item.item_image}`}
                          className="foregroundImage"
                          alt="Item"
                        />
                        <img
                          src={`${item.item.item_image}`}
                          className="backgroundImage"
                          alt="Item"
                        />
                      </div>

                      <div className="Info">
                        <p>{item.item.display_name}</p>
                        <p className="Value">
                          {numeral(item.item.item_value).format("0,0")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="SecondItems">
                {gameInfo.winnerCoin &&
                  gameInfo.playerTwo.items.map((item) => {
                    return (
                      <div className="Item" key={item._id}>
                        <div
                          className={`${
                            Information.game == "PS99"
                              ? "PS99"
                              : "imageContainer"
                          }`}
                          key={item._id + Math.random()}
                        >
                          <img
                            src={`${item.item.item_image}`}
                            className="foregroundImage"
                            alt="Item"
                          />
                          <img
                            src={`${item.item.item_image}`}
                            className="backgroundImage"
                            alt="Item"
                          />
                        </div>
                        <div className="Info">
                          <p>{item.item.display_name}</p>
                          <p className="Value">
                            {numeral(item.item.item_value).format("0,0")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
            <div className="Extra">
              {gameInfo.winnerCoin ? (
                <p className="EndedAt">
                  Ended - {format(gameInfo.endedAt, "PPPPpppp")}
                </p>
              ) : (
                <p className="CreatedAt">
                  Created - {format(gameInfo.createdAt, "PPPPpp")}
                </p>
              )}
            </div>
          </div>
        </m.div>
      </m.div>
    </>
  );
}

CoinflipViewing.propTypes = {
  closeModal: PropTypes.func,
  Information: PropTypes.object,
};
