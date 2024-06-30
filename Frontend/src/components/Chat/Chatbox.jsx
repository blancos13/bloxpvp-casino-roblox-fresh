import PropTypes from "prop-types";
import { format } from "date-fns";
import "./Chatbox.css";
import { whale, owner } from "../../assets/imageExport";
import { useCallback } from "react";
import Profile from "../Popups/Profile";

export default function Chatbox({ Information, setModal }) {
  const loadProfile = useCallback(() => {
    setModal(
      <Profile
        closeModal={() => setModal(null)}
        userId={Information.robloxId}
      />
    );
  }, [Information, setModal]);
  if (Information.rank == "Owner") {
    return (
      <div className="Chatbox Owner">
        <img
          src={Information.thumbnail}
          alt="Roblox Avatar"
          onClick={loadProfile}
        />
        <div className="Content">
          <div className="Username">
            <div className="User">
              <img src={owner} alt="owner icon" />
              <h1>{Information.username}</h1>
            </div>
            <div className="Timestamp">
              <p>{format(Information.timestamp, "h:mm")}</p>
            </div>
          </div>
          <p
            className="message"
            dangerouslySetInnerHTML={{ __html: Information.message }}
          ></p>
        </div>
      </div>
    );
  } else if (Information.rank == "Whale") {
    return (
      <div className="Chatbox Whale">
        <img
          src={Information.thumbnail}
          alt="Roblox Avatar"
          onClick={loadProfile}
        />
        <div className="Content">
          <div className="Username">
            <div className="User">
              <img src={whale} alt="whale icon" />
              <h1>{Information.username}</h1>
            </div>
            <div className="Timestamp">
              <p>{format(Information.timestamp, "h:mm")}</p>
            </div>
          </div>
          <p
            className="message"
            dangerouslySetInnerHTML={{ __html: Information.message }}
          ></p>
        </div>
      </div>
    );
  } else {
    return (
      <div className="Chatbox">
        <img
          src={Information.thumbnail}
          alt="Roblox Avatar"
          onClick={loadProfile}
        />
        <div className="Content">
          <div className="Username">
            <h1>{Information.username}</h1>
            <div className="Timestamp">
              <p>{format(Information.timestamp, "h:mm")}</p>
            </div>
          </div>
          <p
            className="message"
            dangerouslySetInnerHTML={{ __html: Information.message }}
          ></p>
        </div>
      </div>
    );
  }
}

Chatbox.propTypes = {
  Information: PropTypes.object,
  setModal: PropTypes.func,
};
