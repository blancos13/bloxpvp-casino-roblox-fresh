import { useState } from "react";
import { toast } from "react-hot-toast";
import PropTypes from "prop-types";
import {
  briefcase,
  MM2Deposit,
  AMPDeposit,
  PS99Deposit,
  CryptoDeposit,
} from "../../assets/imageExport";
import "./Deposit.css";
import MM2DepositModal from "./MM2Deposit";
import CryptoDepositModal from "./CryptoDeposit";
import { m } from "framer-motion";

export default function Deposit({ closeModal, changeModal }) {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="ModalBackground"
      onClick={closeModal}
    >
      {isLoading && (
        <div className="loadingContainer">
          <div className="loading"></div>
        </div>
      )}
      <m.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="DepositModal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="Header">
          <img src={briefcase} alt="Header Image" />
          <p>Deposit</p>
          <div className="Gradient"></div>
        </div>
        <div className="Methods">
          <m.img
            whileHover={{ opacity: 0.7 }}
            whileTap={{ scale: 0.95 }}
            src={PS99Deposit}
            alt=""
          />
          <m.img
            whileHover={{ opacity: 0.7 }}
            whileTap={{ scale: 0.95 }}
            src={MM2Deposit}
            alt=""
            onClick={() =>
              changeModal(
                <MM2DepositModal
                  closeModal={closeModal}
                  changeModal={() =>
                    changeModal(
                      <Deposit
                        closeModal={closeModal}
                        changeModal={changeModal}
                      />
                    )
                  }
                />
              )
            }
          />
          <m.img
            whileHover={{ opacity: 0.7 }}
            whileTap={{ scale: 0.95 }}
            src={AMPDeposit}
            alt=""
          />
          <m.img
            whileHover={{ opacity: 0.7 }}
            whileTap={{ scale: 0.95 }}
            src={CryptoDeposit}
            alt=""
            onClick={() =>
              changeModal(
                <CryptoDepositModal
                  closeModal={closeModal}
                  changeModal={changeModal}
                />
              )
            }
          />
        </div>
      </m.div>
    </m.div>
  );
}

Deposit.propTypes = {
  closeModal: PropTypes.func,
  changeModal: PropTypes.func,
};
