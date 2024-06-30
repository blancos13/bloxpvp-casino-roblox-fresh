import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./CryptoDeposit.css";
import {
  ethLogo,
  bitcoinLogo,
  litecoinLogo,
  binanceLogo,
  usdtLogo,
  logoGradient,
  backArrow,
  arrow,
  regenerate,
} from "../../assets/imageExport";
import { getJWT } from "../../utils/api";
import toast from "react-hot-toast";
import { AnimatePresence, m } from "framer-motion";
import CryptoWithdrawal from "./CryptoWithdrawal";
import Deposit from "./Deposit";
import config from "../../config";

export default function CryptoDepositModal({ closeModal, changeModal }) {
  const [currency, setCurrency] = useState("BTC");
  const [currencyLong, setCurrencyLong] = useState("BITCOIN (BTC)");
  const [isLoading, setIsLoading] = useState(false);
  const [listActive, setListActive] = useState(null);
  const [qrcode, setQrcode] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const addressBody = JSON.stringify({
      currency: "BTC",
    });

    fetch(`${config.api}/get-address`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJWT()}`,
      },
      method: "POST",
      mode: "cors",
      body: addressBody,
    }).then(async (res) => {
      const data = await res.text();
      if (res.status == 200) {
        setAddress(data);
        setQrcode(
          `https://api.qrserver.com/v1/create-qr-code/?margin=5&?size=138x138&data=${data}`
        );
      } else {
        toast.error(res);
      }
    });
  }, []);

  const handleCurrencyListExpand = useCallback(() => {
    if (listActive == true) {
      setListActive(false);
    } else {
      setListActive(true);
    }
  }, [listActive]);

  const handleAddressRefresh = useCallback(async () => {
    const currencyBody = JSON.stringify({
      currency: currency,
    });
    setIsLoading(true);

    await fetch(`${config.api}/create-static-address`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJWT()}`,
      },
      method: "POST",
      mode: "cors",
      body: currencyBody,
    }).then(async (res) => {
      const data = await res.text();
      if (res.status == 200) {
        setAddress(data);
        setQrcode(
          `https://api.qrserver.com/v1/create-qr-code/?margin=5&?size=138x138&data=${data}`
        );
        setIsLoading(false);
      } else {
        toast.error(data);
      }
    });
  }, [currency]);

  const handleCopyAddress = useCallback(() => {
    navigator.clipboard.writeText(address);
    toast("Address copied");
  }, [address]);

  const handleModalChange = useCallback(() => {
    changeModal(
      <CryptoWithdrawal closeModal={closeModal} changeModal={changeModal} />
    );
  }, [changeModal, closeModal]);

  const handleCurrencyChange = useCallback(async (currency) => {
    setCurrency(currency);
    switch (currency) {
      case "BTC":
        setCurrencyLong("BITCOIN (BTC)");
        break;
      case "ETH":
        setCurrencyLong("ETHEREUM (ERC20)");
        break;
      case "LTC":
        setCurrencyLong("LITECOIN (LTC)");
        break;
      case "BNB":
        setCurrencyLong("BINANCE (BEP20)");
        break;
      case "USDT":
        setCurrencyLong("USDT (ERC20)");
    }
    const addressBody = JSON.stringify({
      currency: currency,
    });
    await fetch(`${config.api}/get-address/`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJWT()}`,
      },
      method: "POST",
      mode: "cors",
      body: addressBody,
    }).then(async (res) => {
      const data = await res.text();
      if (res.status == 200) {
        setAddress(data);
        setQrcode(
          `https://api.qrserver.com/v1/create-qr-code/?margin=5&?size=138x138&data=${data}`
        );
      } else {
        toast.error(res);
      }
    });
  }, []);

  // Function to return the correct logo based on the selected currency
  const getCurrencyLogo = (currency) => {
    switch (currency) {
      case "BTC":
        return bitcoinLogo;
      case "ETH":
        return ethLogo;
      case "LTC":
        return litecoinLogo;
      case "BNB":
        return binanceLogo;
      case "USDT":
        return usdtLogo;
      default:
        return bitcoinLogo;
    }
  };

  const currentCurrencyLogo = getCurrencyLogo(currency); // This ensures the logo updates with currency change

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="ModalBackground"
      onClick={() => closeModal()}
    >
      {isLoading ? (
        <div className="loadingContainer">
          <div className="loading"></div>
        </div>
      ) : (
        <m.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          className="CryptoDepositModal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="Header">
            <div className="Navigation">
              <div className="Nav">
                <img src={logoGradient} alt="bloxpvp logo" />
                <div className="NavLinks">
                  <p className="NavLink Active">Deposit</p>
                  <p className="NavLink Inactive" onClick={handleModalChange}>
                    Withdraw
                  </p>
                </div>
              </div>
              <m.div
                whileHover={{ opacity: 0.7 }}
                className="Navigate"
                onClick={() => {
                  changeModal(
                    <Deposit
                      closeModal={closeModal}
                      changeModal={changeModal}
                    />
                  );
                }}
              >
                <p>Go Back</p>
                <img src={backArrow} alt="" />
              </m.div>
            </div>
            <img src={qrcode} alt="qr code" className="QR" />
            <p>
              Access our <span>marketplace!</span>
            </p>
          </div>
          <div className="Bottom">
            <div className="Interaction">
              <div className="Currency">
                <div className="Header">
                  <p>Currency:</p>
                  <div className="Gradient"></div>
                </div>
                <div
                  className="CurrencyList"
                  onClick={handleCurrencyListExpand}
                >
                  <div className="Currency">
                    <img src={currentCurrencyLogo} alt="cryptocurrency logo" />
                    <p>{currencyLong}</p>
                  </div>
                  <img src={arrow} alt="arrow icon" className="Arrow" />
                  <AnimatePresence>
                    {listActive == true && (
                      <m.div
                        initial={{ scale: 0.95, y: -10, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: -10, opacity: 0 }}
                        transition={{ ease: "easeOut", duration: 0.1 }}
                        className="ListSelection"
                      >
                        <div
                          className={`Option${
                            currency == "BTC" ? " Active" : ""
                          }`}
                          onClick={() => handleCurrencyChange("BTC")}
                        >
                          <img src={bitcoinLogo} alt="bitcoin icon" />
                          <p>BITCOIN (BTC)</p>
                        </div>
                        <div
                          className={`Option${
                            currency == "ETH" ? " Active" : ""
                          }`}
                          onClick={() => handleCurrencyChange("ETH")}
                        >
                          <img src={ethLogo} alt="ethereum icon" />
                          <p>ETHEREUM (ERC20)</p>
                        </div>
                        <div
                          className={`Option${
                            currency == "LTC" ? " Active" : ""
                          }`}
                          onClick={() => handleCurrencyChange("LTC")}
                        >
                          <img src={litecoinLogo} alt="litecoin icon" />
                          <p>LITECOIN (LTC)</p>
                        </div>
                        <div
                          className={`Option${
                            currency == "BNB" ? " Active" : ""
                          }`}
                          onClick={() => handleCurrencyChange("BNB")}
                        >
                          <img src={binanceLogo} alt="binance icon" />
                          <p>BINANCE (BEP20)</p>
                        </div>
                        <div
                          className={`Option${
                            currency == "USDT" ? " Active" : ""
                          }`}
                          onClick={() => handleCurrencyChange("USDT")}
                        >
                          <img src={usdtLogo} alt="usdt icon" />
                          <p>USDT (ERC20)</p>
                        </div>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <div className="Address">
                <div className="Header">
                  <p>{currency} Address:</p>
                  <div className="Gradient"></div>
                </div>
                <div className="AddressBox">
                  <img
                    src={regenerate}
                    alt="regeneration icon"
                    className="Regenerate"
                    onClick={handleAddressRefresh}
                  />
                  <p>{address}</p>
                  <div className="Copy" onClick={handleCopyAddress}>
                    <p>Copy Address</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </m.div>
      )}
    </m.div>
  );
}

CryptoDepositModal.propTypes = {
  closeModal: PropTypes.func,
  changeModal: PropTypes.func,
};
