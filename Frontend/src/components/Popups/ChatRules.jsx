import { logoGradient } from "../../assets/imageExport";
import PropTypes from "prop-types";
import "./ChatRules.css";
import { m } from "framer-motion";

export default function ChatRules({ closeModal }) {
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="ModalBackground"
      onClick={() => closeModal()}
    >
      <m.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="ChatRules"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="Header">
          <img src={logoGradient} alt="BLOXPVP Logo" />
          <h1>Chat Rules</h1>
        </div>
        <div className="Rules">
          <div className="List">
            <p className="ListItem">
              Don&apos;t spam & don&apos;t use excessive capital letters.
            </p>
            <p className="ListItem">
              Don&apos;t harass or be offensive to other players.
            </p>
            <p className="ListItem">
              Don&apos;t share any personal information of you or other players.
            </p>
            <p className="ListItem">Don&apos;t beg or ask for tips.</p>
            <p className="ListItem">Don&apos;t share links.</p>
            <p className="ListItem">Don&apos;t advertise.</p>
            <p className="ListItem">Don&apos;t share your affiliate code.</p>
          </div>
          <p className="Footer">
            Breaking any of these rules will result in a mute!
          </p>
        </div>
        <div className="Close" onClick={() => closeModal()}>
          <p>Close</p>
        </div>
      </m.div>
    </m.div>
  );
}

ChatRules.propTypes = {
  closeModal: PropTypes.func,
};
