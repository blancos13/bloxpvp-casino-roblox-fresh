import "./JackpotPage.css";
import { useCallback, useState, useContext, useEffect } from "react";
import UserContext from "../../utils/UserContext";
import SocketContext from "../../utils/SocketContext";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import PropTypes from "prop-types";
import Countdown from "react-countdown";
import JackpotJoining from "./JackpotJoining.jsx";
import { m, AnimatePresence } from "framer-motion";
import Profile from "../Popups/Profile.jsx";
import config from "../../config.js";

export default function JackpotPage() {
  const [modalState, setModalState] = useState(null);
  const userData = useContext(UserContext);
  const socket = useContext(SocketContext);
  const [jackpotData, setJackpotData] = useState({
    value: 0,
    requirements: {
      max: undefined,
    },
    endsAt: undefined,
  });
  const [jackpotEntries, setJackpotEntries] = useState([]);

  useEffect(() => {
    fetch(`${config.api}/jackpot`, {
      mode: "cors",
      method: "GET",
    }).then(async (res) => {
      const data = await res.json();

      setJackpotData(data.gameData);
      setJackpotEntries(data.entries);
    });
  }, []);

  const handleModalOpen = useCallback(() => {
    if (jackpotData.result == null) {
      setModalState(
        <JackpotJoining
          Information={jackpotData}
          closeModal={() => setModalState(null)}
        />
      );
    }
  }, [jackpotData]);

  const handleJackpotUpdate = useCallback((data) => {
    setJackpotData(data.gameData);
    setJackpotEntries(data.entries);
  }, []);

  const renderer = ({ seconds }) => {
    return <span>Starting in {seconds}s</span>;
  };

  const COLORS = [
    "#9E3EFF",
    "#3EFF68",
    "#FF3E3E",
    "#FF833E",
    "#3E74FF",
    "#e83eff",
  ];
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    // const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent * 100 > 6.99) {
      return (
        <g
          className="ImageLabel"
          style={{
            clipPath: "circle(50%)",
          }}
          y={y}
        >
          <image
            href={jackpotEntries[index].thumbnail}
            style={{
              transform: `rotate(${-midAngle + 90}deg) translate(0px, 25px)`,
              transformOrigin: "center",
            }}
            height="60px"
            width="60px"
          />
        </g>
      );
    }
  };
  const rotationPercentCalc = jackpotData.result / jackpotData.value;
  const rotationDEGCalc = rotationPercentCalc * 360 + 3600;

  useEffect(() => {
    socket.on("JACKPOT_UPDATE", handleJackpotUpdate);
    return () => {
      socket.off("JACKPOT_UPDATE", handleJackpotUpdate);
    };
  }, [socket, handleJackpotUpdate]);

  return (
    <>
      <div className="JackpotPage">
        <div className="Container">
          <div className="WheelBG">
            <div className="WheelInfo">
              <h1 className="Value">
                {numeral(jackpotData.value).format("O.Oa")}
              </h1>
              <div className="Extra">
                <p className="Range">
                  {jackpotData.requirements.max != 0
                    ? `MAX ${numeral(jackpotData.requirements.max).format(
                        "0,0"
                      )}`
                    : "ANY"}
                </p>
                <p className="Space">{jackpotEntries.length}/15</p>
                <p className="Timer">
                  {jackpotData.endsAt != null ? (
                    <Countdown
                      renderer={renderer}
                      zeroPadTime={2}
                      date={jackpotData.endsAt}
                    />
                  ) : (
                    "Waiting for players..."
                  )}
                </p>
              </div>
            </div>
            <div
              className={`Wheel ${jackpotData.result ? "Spin" : ""}`}
              style={
                jackpotData.result && {
                  transform: `rotate(${rotationDEGCalc}deg)`,
                }
              }
            >
              <ResponsiveContainer
                width="100%"
                height="100%"
                style={{ zIndex: 11 }}
              >
                <PieChart width={600} height={600}>
                  <Pie
                    data={jackpotEntries}
                    cx="50%"
                    cy="50%"
                    outerRadius={"100%"}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    stroke="0"
                    startAngle={-270}
                  >
                    {jackpotEntries.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        style={{ outline: "none", display: "flex" }}
                        fill={COLORS[index % COLORS.length]}
                      ></Cell>
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div
              className={`WheelMask ${jackpotData.result ? "Spin" : ""}`}
              style={{
                transform: `${
                  jackpotData.result ? `rotate(${rotationDEGCalc}deg)` : "none"
                }`,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart width={600} height={600}>
                  <Pie
                    data={jackpotEntries}
                    cx="50%"
                    cy="50%"
                    innerRadius={"192.5"}
                    outerRadius={"105%"}
                    dataKey="value"
                    stroke="0"
                    startAngle={-270}
                  >
                    {jackpotEntries.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="Info">
            <div className="Header">
              <p>
                {jackpotEntries.length == 1
                  ? `${jackpotEntries.length} Player`
                  : `${jackpotEntries.length} Players`}
              </p>
            </div>
            <div className="Interaction">
              <div className="Entries">
                {jackpotEntries.length > 0 ? (
                  jackpotEntries.map((entry, index) => {
                    return (
                      <Entry
                        key={index}
                        Information={entry}
                        jackpotData={jackpotData}
                        color={COLORS[index]}
                        changePopup={setModalState}
                        game={jackpotData?.game}
                      />
                    );
                  })
                ) : (
                  <p
                    style={{
                      textAlign: "center",
                      opacity: "30%",
                      color: "white",
                    }}
                  >
                    No entries to show
                  </p>
                )}
              </div>
              {!(
                userData &&
                jackpotEntries.find(
                  (entry) => entry.username == userData.username
                )
              ) ? (
                <div className="Buttons">
                  <div
                    className="Bet"
                    onClick={() => userData && handleModalOpen()}
                  >
                    <p>Place Bet</p>
                  </div>
                </div>
              ) : (
                <div className="Buttons">
                  <div className="Bet Joined">
                    <p>Joined</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>{modalState}</AnimatePresence>
    </>
  );
}

function Entry({ Information, jackpotData, color, changePopup, game }) {
  let toRender = Information.items.slice(0, 4);
  return (
    <div className="Entry">
      <div className="Top">
        <div className="Player">
          <img
            src={Information.thumbnail}
            style={{ border: `1px ${color} solid` }}
            alt="User Profile Picture"
            onClick={() =>
              changePopup(
                <Profile
                  closeModal={() => changePopup(null)}
                  userId={Information.joinerRobloxId}
                />
              )
            }
          />
          <p>{Information.username}</p>
        </div>
        <p className="Items">{Information.items.length} Items</p>
      </div>
      <div className="Bottom">
        <div className="BetInfo">
          <p className="Bet">
            Bet: <span>R${numeral(Information.value).format("O.Oa")}</span>
          </p>
          <p className="Win">
            Win:{" "}
            <span>
              {Math.round((Information.value / jackpotData.value) * 100 * 100) /
                100}
              %
            </span>
          </p>
        </div>
        <div className="ItemImages">
          {toRender &&
            toRender.map((item, index) => {
              return (
                <div
                  className={
                    game == null || game == "MM2" ? "ImageContainer" : "PS99"
                  }
                  key={index}
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
              );
            })}
          {Information.items.length > 4 && (
            <p className="ItemSurplus">+{Information.items.length - 4}</p>
          )}
        </div>
      </div>
    </div>
  );
}

Entry.propTypes = {
  Information: PropTypes.object,
  jackpotData: PropTypes.object,
  color: PropTypes.string,
  changePopup: PropTypes.func,
  game: PropTypes.string,
};
