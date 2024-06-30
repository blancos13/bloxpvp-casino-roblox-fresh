import config from "../../config";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useState } from "react";
import PropTypes from "prop-types";
import { m } from "framer-motion";
import "./ForgotPassword.css";

export default function ForgotPassword({ closeModal }) {
  const [captchaToken, setCaptchaToken] = useState(null);
  const [email, setEmail] = useState("");
  return (
    <m.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 20, opacity: 0 }}
      className="ModalBackground"
      onClick={closeModal}
    >
      <div className="ForgotPassword" onClick={(e) => e.stopPropagation()}>
        <div className="Header">
          <h2>Forgotten Password</h2>
          <p>
            Enter your email, and we&apos;ll send you a link to reset your
            password.
          </p>
        </div>
        <form action="">
          <div className="form-group">
            <div className="Email">
              <label htmlFor="Email">Email</label>
              <input
                type="text"
                name="Email"
                id=""
                placeholder="Enter your email..."
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
          </div>
          <button type="submit">Reset Password </button>
        </form>
      </div>
    </m.div>
  );
}

ForgotPassword.propTypes = {
  closeModal: PropTypes.func,
};
