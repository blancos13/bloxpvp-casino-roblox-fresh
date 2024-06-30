import { logoGradient } from "../../assets/imageExport";
import PropTypes from "prop-types";
import "./TOS.css";
import { m } from "framer-motion";

export default function TOS({ closeModal }) {
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
        className="TOS"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="Header">
          <img src={logoGradient} alt="BLOXPVP Logo" />
          <h1>Terms of Service</h1>
        </div>
        <div className="Info">
          <div className="List">
            <p className="ListItem">
              <p className="Title">Overview</p>
              <p className="Text">
                By using BloxPVP.com you agree to the following Terms of
                Service. If you do not agree with these Terms of Service, you
                are not allowed to use BloxPVP.com. You must be at least 18
                years of age to use this website.
              </p>
            </p>
            <p className="ListItem">
              <p className="Title">Items prices</p>
              <p className="Text">
                Items prices on our site does not represent any real life value,
                BloxPVP.com is for entertainment purposes only. BloxPVP.com does
                not give opportunity to win real money.
              </p>
            </p>
            <p className="ListItem">
              <p className="Title">Item refunds</p>
              <p className="Text">
                We do not refund any items that enters a pot, however, if your
                items did not enter the pot, contact our support. If you
                experienced any bug, you have 12 hours to contact our support,
                otherwise we cannot guarantee that we could find your trade. We
                will not take responsiblity not compensate you for items that
                are lost inside the bot or lost because of the rare chance of
                termination of the MM2 Bots.
              </p>
            </p>
            <p className="ListItem">
              <p className="Title">Code of Conduct</p>
              <p className="Text">
                Users have to be respectful and polite to each other at any
                time. Any spam, harassment, staff impersonating, website
                advertisement is forbidden and may result in website/chat
                restrictions. We also reserve the right to block any user&apos;s
                account for scam attempt, bug exploit, including item value
                abusing.
              </p>
            </p>
          </div>
        </div>
        <div className="Close" onClick={() => closeModal()}>
          <p>Close</p>
        </div>
      </m.div>
    </m.div>
  );
}

TOS.propTypes = {
  closeModal: PropTypes.func,
};
