import { useState, useCallback, useContext } from "react";
import PropTypes from "prop-types";
import "./CryptoWithdrawal.css";
import { getJWT } from "../../utils/api";
import { AnimatePresence, m } from "framer-motion";
import {
  ethLogo,
  bitcoinLogo,
  litecoinLogo,
  binanceLogo,
  usdtLogo,
  logoGradient,
  backArrow,
  arrow,
  robux,
} from "../../assets/imageExport";
import toast from "react-hot-toast";
import Deposit from "./Deposit";
import CryptoDepositModal from "./CryptoDeposit";
import SocketContext from "../../utils/SocketContext";
import config from "../../config";

export default function CryptoWithdrawal({ closeModal, changeModal }) {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("BTC"); // Default to Bitcoin
  const [currencyLong, setCurrencyLong] = useState("BITCOIN (BTC)");
  const [network, setNetwork] = useState("Bitcoin"); // Default to Bitcoin network
  const [listActive, setListActive] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const socket = useContext(SocketContext);

  const handleCurrencyListExpand = useCallback(() => {
    if (listActive == true) {
      setListActive(false);
    } else {
      setListActive(true);
    }
  }, [listActive]);

  const handleCurrencyChange = (currency) => {
    const currencyToNetworkMap = {
      BTC: "bitcoin",
      ETH: "erc20",
      LTC: "litecoin",
      BNB: "bep20",
      USDT: "erc20",
    };

    const selectedNetwork = currencyToNetworkMap[currency];
    setNetwork(selectedNetwork);

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
  };

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

  const currentCurrencyLogo = getCurrencyLogo(currency);

  const handleWithdrawCrypto = useCallback(async () => {
    if (address == "") {
      toast.error("You must provide an address");
    } else if (!amount || amount < 1) {
      toast.error("Your withdrawal amount must be over $1");
    } else {
      setIsLoading(true);
      const payoutData = JSON.stringify({
        address: address,
        amount: parseFloat(amount),
        currency: currency.toUpperCase(),
        network: network,
      });
      await fetch(`${config.api}/send-payout`, {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${getJWT()}`,
        },
        method: "POST",
        mode: "cors",
        body: payoutData,
      }).then(async (res) => {
        if (res.status == 200) {
          toast.success("Your withdrawal has been successfully sent");
          socket.emit("BALANCE_UPDATE");
        } else {
          const error = await res.json();
          toast.error(error.message);
        }
      });
      setIsLoading(false);
    }
  }, [address, amount, currency, network, socket]);

  return (
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="ModalBackground"
      onClick={closeModal}
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
          className="CryptoWithdrawalModal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="Header">
            <div className="Navigation">
              <div className="Nav">
                <img src={logoGradient} alt="bloxpvp logo" />
                <div className="NavLinks">
                  <p
                    className="NavLink Inactive"
                    onClick={() => {
                      changeModal(
                        <CryptoDepositModal
                          closeModal={closeModal}
                          changeModal={changeModal}
                        />
                      );
                    }}
                  >
                    Deposit
                  </p>
                  <p className="NavLink Active">Withdraw</p>
                </div>
              </div>
              <m.div
                whileHover={{ opacity: 0.7 }}
                className="Navigate"
                onClick={() => {
                  changeModal(
                    <CryptoWithdrawal
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
                  <p>Your Address:</p>
                  <div className="Gradient"></div>
                </div>
                <div className="AddressBox">
                  <div className="Input">
                    <input
                      type="text"
                      name=""
                      id=""
                      value={address}
                      placeholder={`Enter your ${currency} address here`}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="Amount">
                <div className="Header">
                  <p>Withdraw Amount:</p>
                  <div className="Gradient"></div>
                </div>
                <div className="AmountBox">
                  <div className="Input">
                    <input
                      type="number"
                      name=""
                      id=""
                      value={amount}
                      placeholder="0"
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <img src={robux} alt="dollar icon" />
                  </div>
                </div>
              </div>
              <m.div
                whileHover={{ opacity: 0.8 }}
                whileTap={{ scale: 0.95 }}
                className="WithdrawButton"
                onClick={handleWithdrawCrypto}
              >
                <p>Withdraw</p>
              </m.div>
            </div>
          </div>
        </m.div>
      )}
    </m.div>
  );
}

CryptoWithdrawal.propTypes = {
  closeModal: PropTypes.func,
  changeModal: PropTypes.func,
};
