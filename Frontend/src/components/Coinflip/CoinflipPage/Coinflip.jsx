import "./Coinflip.css";
import { heads, tails, arrow } from "../../../assets/imageExport";
import { useCallback, useState, useContext, useEffect } from "react";
import CoinflipCreation from "../CoinflipCreation/CoinflipCreation";
import UserContext from "../../../utils/UserContext";
import CoinflipOverview from "../CoinflipOverview/CoinflipOverview";
import SocketContext from "../../../utils/SocketContext";
import { m, AnimatePresence } from "framer-motion";
import config from "../../../config";

export default function Coinflip() {
  const [modalState, setModalState] = useState(null);
  const userData = useContext(UserContext);
  const socket = useContext(SocketContext);
  const [activeFlips, setActiveFlips] = useState([]);
  const [previousFlips, setPreviousFlips] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [filteredGames, setFilteredGames] = useState([]);
  const [filteredGame, setFilteredGame] = useState("All");
  const [gameSelectionActive, setGameSelectionActive] = useState(false);

  useEffect(() => {
    fetch(`${config.api}/coinflips`, {
      mode: "cors",
      method: "GET",
    }).then(async (res) => {
      const data = await res.json();
      setActiveFlips(data.activeFlips);
      if (filteredGame == "All") {
        setFilteredGames(data.activeFlips);
      } else {
        const newActiveFlips = data.activeFlips.filter((activeFlip) => {
          return activeFlip.game == filteredGame;
        });
        setFilteredGames(newActiveFlips);
      }
      setPreviousFlips(data.previousFlips);
      if (!data.currentStats.totalValue[0]?.value) {
        const newStats = {
          totalValue: [
            {
              value: 0,
            },
          ],
          currentActive: data.currentStats.currentActive,
          totalGames: data.currentStats.totalGames,
        };
        setStatistics(newStats);
      } else {
        setStatistics(data.currentStats);
      }
    });
  }, [filteredGame]);

  const handleFilterGameUpdate = useCallback(
    (game) => {
      setFilteredGame(game);
      const newActiveFlips = activeFlips.filter((activeFlip) => {
        return activeFlip.game == game;
      });
      setFilteredGames(newActiveFlips);
      setGameSelectionActive(false);
    },
    [activeFlips]
  );

  const handleCoinflipsUpdate = useCallback(
    (data) => {
      setActiveFlips(data.activeFlips);
      if (filteredGame == "All") {
        setFilteredGames(data.activeFlips);
      } else {
        const newActiveFlips = data.activeFlips.filter((activeFlip) => {
          return activeFlip.game == filteredGame;
        });
        setFilteredGames(newActiveFlips);
      }
      setPreviousFlips(data.previousFlips);
      if (!data.currentStats.totalValue[0]?.value) {
        const newStats = {
          totalValue: [
            {
              value: 0,
            },
          ],
          currentActive: data.currentStats.currentActive,
          totalGames: data.currentStats.totalGames,
        };
        setStatistics(newStats);
      } else {
        setStatistics(data.currentStats);
      }
    },
    [filteredGame]
  );

  const handleCreationModal = useCallback(() => {
    if (userData != null) {
      setModalState(
        <CoinflipCreation
          renderModal={setModalState}
          closeModal={() => setModalState(null)}
        />
      );
    }
  }, [userData]);

  useEffect(() => {
    socket.on("COINFLIP_UPDATE", handleCoinflipsUpdate);
    return () => {
      socket.off("COINFLIP_UPDATE", handleCoinflipsUpdate);
    };
  }, [socket, handleCoinflipsUpdate]);

  return (
    <>
      <div className="Coinflip">
        <div className="CurrentGames">
          <div className="Interactive">
            <div className="Creation">
              <div className="GameInteractivity">
                <button onClick={handleCreationModal}>Create Game</button>
                <p>History</p>
              </div>
              <div className="Options">
                <div className="PreviousResults">
                  {previousFlips &&
                    previousFlips.map((flip) => {
                      {
                        return (
                          <img
                            src={flip.winnerCoin == "heads" ? heads : tails}
                            key={flip._id}
                            alt="Previous Result"
                          />
                        );
                      }
                    })}
                </div>
                <select
                  name="sortGames"
                  defaultValue={"HighestToLowest"}
                  className="SortGames"
                >
                  <option value="HighestToLowest">Highest To Lowest</option>
                  <option value="LowestToHighest">Lowest To Highest</option>
                </select>
                <m.div
                  className="GameFilter"
                  onClick={() => {
                    if (gameSelectionActive) {
                      setGameSelectionActive(false);
                    } else {
                      setGameSelectionActive(true);
                    }
                  }}
                >
                  <p>{filteredGame}</p>
                  <img src={arrow} alt="" />
                  <AnimatePresence>
                    {gameSelectionActive && (
                      <m.div
                        initial={{ scale: 0.95, y: -5, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: -5, opacity: 0 }}
                        transition={{ ease: "easeOut", duration: 0.1 }}
                        className="FilterOptions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className="FilterOption"
                          onClick={() => {
                            handleFilterGameUpdate("MM2");
                          }}
                        >
                          <p>MM2</p>
                        </div>
                        <div
                          className="FilterOption"
                          onClick={() => {
                            handleFilterGameUpdate("PS99");
                          }}
                        >
                          <p>Pet Simulator 99</p>
                        </div>
                        <div
                          className="FilterOption"
                          onClick={() => {
                            handleFilterGameUpdate("PS99");
                          }}
                        >
                          <p>Adopt Me</p>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </m.div>
              </div>
            </div>
          </div>
          <div className="Statistics">
            <div className="Stat TotalItems">
              <p className="Amount">
                {statistics && numeral(statistics.totalGames).format("0,0aaa")}+
              </p>
              <p className="Description">Total Games</p>
            </div>
            <div className="Stat TotalValue">
              <p className="Amount">
                {statistics &&
                  numeral(statistics.totalValue[0].value).format("0,0")}
                +
              </p>
              <p className="Description">Total Value</p>
            </div>
            <div className="Stat ActiveGames">
              <p className="Amount">{statistics && statistics.currentActive}</p>
              <p className="Description">Active Games</p>
            </div>
          </div>
          {filteredGames.map((flip) => {
            return (
              <AnimatePresence key={flip._id}>
                <CoinflipOverview
                  renderModal={setModalState}
                  Information={flip}
                ></CoinflipOverview>
              </AnimatePresence>
            );
          })}
        </div>
      </div>
      <AnimatePresence>{modalState && modalState}</AnimatePresence>
    </>
  );
}
