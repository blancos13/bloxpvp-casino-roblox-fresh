import PropTypes from "prop-types";
import "./Giveaway.css";
import { giveawayArrow } from "../../assets/imageExport";
import { useState, useEffect, useCallback, useContext } from "react";
import Countdown from "react-countdown";
import { getJWT } from "../../utils/api";
import UserContext from "../../utils/UserContext";
import toast from "react-hot-toast";
import config from "../../config";

export default function Giveaway({ Information }) {
  const [giveawayView, setGiveawayView] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeEntries, setActiveEntries] = useState([]);
  const [joinedGiveaway, setJoinedGiveaway] = useState(false);
  const userData = useContext(UserContext);

  const handleJoinGiveaway = useCallback(async () => {
    if (userData?.robloxId) {
      const loadingToast = toast.loading("Joining...");
      const gwInfo = JSON.stringify({
        giveaway: giveawayView?._id,
      });
      await fetch(`${config.api}/giveaway/join`, {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${getJWT()}`,
        },
        mode: "cors",
        method: "POST",
        body: gwInfo,
      }).then(async (res) => {
        if (res.status == 200) {
          setJoinedGiveaway(true);
          return toast.success("Giveaway joined", {
            id: loadingToast,
          });
        } else {
          const data = await res.text();
          return toast.error(data.toString(), {
            id: loadingToast,
          });
        }
      });
    }
  }, [giveawayView, userData]);

  const handleViewOther = useCallback(() => {
    if (activeIndex + 1 >= Information.newGiveaways.length) {
      setActiveIndex(0);
      setGiveawayView(Information.newGiveaways[0]);
      if (userData?.robloxId) {
        const activeEntries = Information?.userEntries;
        if (Array.isArray(activeEntries)) {
          let myEntries = activeEntries.filter((userEntry) => {
            return userEntry.robloxId == userData.robloxId;
          });
          if (!myEntries) {
            myEntries = [];
          }
          const hasEntered = myEntries.find((myEntry) => {
            return myEntry.giveaway == Information.newGiveaways[0]?._id;
          });
          if (!hasEntered) {
            setJoinedGiveaway(false);
          } else {
            setJoinedGiveaway(true);
          }
        }
      }
    } else {
      setGiveawayView(Information.newGiveaways[activeIndex + 1]);
      setActiveIndex(activeIndex + 1);
      if (userData?.robloxId) {
        const activeEntries = Information?.userEntries;
        if (Array.isArray(activeEntries)) {
          let myEntries = activeEntries.filter((userEntry) => {
            return userEntry.robloxId == userData.robloxId;
          });
          if (!myEntries) {
            myEntries = [];
          }
          const hasEntered = myEntries.find((myEntry) => {
            return (
              myEntry.giveaway == Information.newGiveaways[activeIndex + 1]?._id
            );
          });
          if (!hasEntered) {
            setJoinedGiveaway(false);
          } else {
            setJoinedGiveaway(true);
          }
        }
      }
    }
  }, [
    Information.newGiveaways,
    Information?.userEntries,
    activeIndex,
    userData,
  ]);

  useEffect(() => {
    let theIndex;
    if (Information.newGiveaways.length > activeIndex) {
      theIndex = 0;
    } else {
      theIndex = activeIndex;
    }
    setGiveawayView(Information.newGiveaways[activeIndex]);
    if (userData?.robloxId) {
      const activeEntries = Information?.userEntries;
      if (Array.isArray(activeEntries)) {
        let myEntries = activeEntries.filter((userEntry) => {
          return userEntry.robloxId == userData.robloxId;
        });
        if (!myEntries) {
          myEntries = [];
        }
        const hasEntered = myEntries.find((myEntry) => {
          return myEntry.giveaway == Information.newGiveaways[theIndex]?._id;
        });
        if (!hasEntered) {
          setJoinedGiveaway(false);
        } else {
          setJoinedGiveaway(true);
        }
      }
    }
  }, [Information, activeIndex, userData]);

  const renderer = ({ hours, minutes, seconds }) => {
    return (
      <p className="Time">
        {hours}h {minutes}m {seconds}s
      </p>
    );
  };

  if (giveawayView) {
    if (giveawayView.winner == null) {
      return (
        <div className="GiveawayPopup Counting">
          <div className="Item">
            <div
              className={giveawayView.game == "MM2" ? "ImageContainer" : "PS99"}
            >
              <img
                src={`${giveawayView.item.item.item_image}`}
                className="foregroundImage"
                alt="Item"
              />
              <img
                src={`${giveawayView.item.item.item_image}`}
                className="backgroundImage"
                alt="Item"
              />
            </div>
            <div className="Text">
              <p className="Gw">Giveaway</p>
              <p className="ItemName">{giveawayView.item.item.display_name}</p>
            </div>
          </div>
          <div className="Interaction">
            <div
              className={`Join${joinedGiveaway == true ? " Joined" : ""}`}
              onClick={() => handleJoinGiveaway()}
            >
              <p>{joinedGiveaway == true ? "Joined" : "Join"}</p>
              <Countdown
                date={giveawayView.endsAt}
                renderer={renderer}
                className="Time"
              />
            </div>
            <div className="Other" onClick={() => handleViewOther()}>
              <p>Other</p>
              <img
                src={giveawayArrow}
                alt="Other giveaways"
                className="Arrow"
              />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="GiveawayPopup Ended">
          <img src={giveawayView.winnerImage} alt="" className="Winner" />
          <div className="Text">
            <p className="Header">Congratulations!</p>
            <p className="Winner">{giveawayView.winnerName}, you won!</p>
          </div>
          <div className="Image">
            <div
              className={giveawayView.game == "MM2" ? "ImageContainer" : "PS99"}
            >
              <img
                src={`${giveawayView.item.item.item_image}`}
                className="foregroundImage"
                alt="Item"
              />
              <img
                src={`${giveawayView.item.item.item_image}`}
                className="backgroundImage"
                alt="Item"
              />
            </div>
          </div>
        </div>
      );
    }
  }
}

Giveaway.propTypes = {
  Information: PropTypes.object,
};
