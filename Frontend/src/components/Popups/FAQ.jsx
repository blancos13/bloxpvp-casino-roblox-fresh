import { logoGradient } from "../../assets/imageExport";
import PropTypes from "prop-types";
import "./FAQ.css";
import { m } from "framer-motion";

export default function FAQ({ closeModal }) {
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
        className="FAQ"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="Header">
          <img src={logoGradient} alt="BLOXPVP Logo" />
          <h1>Frequently Asked Questions</h1>
        </div>
        <div className="Info">
          <div className="List">
            <p className="ListItem">
              <p className="Title">What is Coinflip and how does it work?</p>
              <p className="Text">
                Coinflip is 1v1 PvP game mode where participants place their
                bets by picking one side ofthe coin. Each player&apos;s chance
                of winning a particular match is +/- 50%. However, the player
                creating a coinflip is allowed to widen the range of value that
                can be used to coin.
              </p>
            </p>
            <p className="ListItem">
              <p className="Title">How do I deposit/withdraw?</p>
              <p className="Text">
                Click on the Deposit button, this will bring up various methods
                of depositing with guides attached.
              </p>
            </p>
            <p className="ListItem">
              <p className="Title">
                Why does it say I don&apos;t have permission to join the private
                server?
              </p>
              <p className="Text">
                Due to the privacy policies of roblox, accounts above the age of
                13 are allowed to join private servers. To enable this head over
                to Settings {">"} Privacy and select the option &quot;Everyone
                for the Who can invite me to private servers&quot;
              </p>
            </p>
            <p className="ListItem">
              <p className="Title">
                Will my roblox account be safe if I use the website?
              </p>
              <p className="Text">
                Yes, we don&apos;t require your roblox password for you to login
                hence making your account 100% safe and secure.
              </p>
            </p>
            <p className="ListItem">
              <p className="Title">Can BloxPVP be rigged?</p>
              <p className="Text">
                BloxPVP itself has no impact on the outcome of particular games.
                Due to the provably fair system, you&apos;re now able to verify
                each games&apos; outcome. Find more information by pressing the
                Fair button.
              </p>
            </p>
            <p className="ListItem">
              <p className="Title">
                I won a game, but I didn&apos;t receive all the items.
              </p>
              <p className="Text">
                BloxPVP takes a cut of 0-10% of every game to keep the site
                functional.
              </p>
            </p>
            <p className="ListItem">
              <p className="Title">
                Items that I own are mispriced, not priced at all, or appear to
                be &quot;unsuitable&quot;.
              </p>
              <p className="Text">
                In Murder Mystery 2, the market changes a lot. With this, so do
                prices - help our admins to keep track of them via support
                tickets. You are always free to report pricing issues using the
                Support tab or our Discord server.
              </p>
            </p>
            <p className="ListItem">
              <p className="Title">
                I am a MM2 content creator and I am looking for a sponsorship.
              </p>
              <p className="Text">
                Nothing easier! Open a support ticket, provide detailed
                information about you and your channel and let`s discuss the
                terms of our cooperation.
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

FAQ.propTypes = {
  closeModal: PropTypes.func,
};
