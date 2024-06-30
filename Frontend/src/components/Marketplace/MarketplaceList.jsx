import "./MarketplaceList.css";
import { useState, useCallback, useEffect, useContext } from "react";
import { toast } from "react-hot-toast";
import { getJWT } from "../../utils/api";
import PropTypes from "prop-types";
import SocketContext from "../../utils/SocketContext";
import {
  plus,
  purpleRobux,
  roblox,
  magnifyingGlass,
  lightning,
} from "../../assets/imageExport";
import Deposit from "../Cashier/Deposit";
import { m, AnimatePresence } from "framer-motion";
import config from "../../config";
import { sort } from "fast-sort";

export default function MarketplaceList({ closeModal, renderModal }) {
  const [pets, setPets] = useState([]);
  const [selectedPets, setSelectedPets] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [selectedValue, setSelectedValue] = useState(0);
  const [totalPets, setTotalPets] = useState(0);
  const [depositPopup, setDepositPopup] = useState(false);
  const socket = useContext(SocketContext);

  useEffect(() => {
    fetch(`${config.api}/user/inventory`, {
      headers: {
        Authorization: `Bearer ${getJWT()}`,
      },
    }).then(async (res) => {
      const loadedPets = await res.json();
      setSelectedPets([]);
      const sortedPets = sort(loadedPets.userItems).desc((pet) => {
        return Number(pet.item.item_value);
      });
      setPets(sortedPets);
      setTotalValue(loadedPets.totalValue);
      setTotalPets(loadedPets.userItems.length);
    });
  }, []);

  const handleListingCreation = useCallback(async () => {
    const loadingToast = toast.loading("Listing Items...");

    if (selectedPets.length < 1) {
      return toast.error("You must select at least 1 item");
    }

    let listingPets = [...selectedPets];
    listingPets = listingPets.map((listingPet) => {
      delete listingPet?.item;
      delete listingPet?.owner;
      delete listingPet?.locked;
      delete listingPet?.game;
      delete listingPet?.__v;
      return listingPet;
    });

    const listingInfo = JSON.stringify({
      chosenItems: listingPets,
    });

    await fetch(`${config.api}/marketplace/listing/create`, {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Authorization: `Bearer ${getJWT()}`,
      },
      mode: "cors",
      method: "POST",
      body: listingInfo,
    }).then(async (res) => {
      if (res.status == 200) {
        await fetch(`${config.api}/user/inventory`, {
          headers: {
            Authorization: `Bearer ${getJWT()}`,
          },
        }).then(async (res) => {
          const loadedPets = await res.json();
          setSelectedPets([]);
          setPets([...loadedPets.userItems]);
          setTotalValue(loadedPets.totalValue);
          setTotalPets(loadedPets.userItems.length);
        });
        return toast.success("Listings created", {
          id: loadingToast,
        });
      } else {
        const data = await res.text();
        return toast.error(data.toString(), {
          id: loadingToast,
        });
      }
    });
  }, [selectedPets]);

  const handleDepositModal = useCallback(() => {
    setDepositPopup(true);
  }, []);

  const handlePetSelection = useCallback(
    (pet) => {
      const checkSelected = selectedPets.includes(pet);
      if (checkSelected == false) {
        let temp = 0;
        let arr = [...selectedPets, pet];
        arr.forEach((item) => {
          temp += Number(item.item.item_value);
        });
        setSelectedValue(temp);
        setSelectedPets(arr);
        const sortedPets = sort(pets).desc((pet) => {
          pet.item.item_value;
        });
        setPets(sortedPets.filter((currentPet) => currentPet != pet));
      } else if (checkSelected == true) {
        let temp = 0;
        let arr = selectedPets.filter((currentPet) => currentPet != pet);
        arr.forEach((item) => {
          temp += Number(item.item.item_value);
        });
        setSelectedValue(temp);
        setSelectedPets(arr);
        const sortedPets = sort(pets).desc((pet) => {
          return Number(pet.item.item_value);
        });
        setPets([...sortedPets, pet]);
      }
    },
    [selectedPets, pets]
  );

  return (
    <>
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
          className="ListingModal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="Navbar">
            <div className="Search">
              <img src={magnifyingGlass} alt="magnifying glass icon" />
              <input placeholder="Search for an Item" />
            </div>
            <div className="Interaction">
              <button
                className="ListItems"
                onClick={() => handleListingCreation()}
              >
                <p>List Items</p>
              </button>
            </div>
          </div>
          <div className="Selection">
            <div className="SelectionStatistics">
              <div className="TotalValue">
                <img src={purpleRobux} alt="Total Value" />
                <div className="Text">
                  <p className="Worth">WORTH</p>
                  <p className="Value">{numeral(totalValue).format("0,0")}</p>
                </div>
              </div>
              <div className="TotalItems">
                <img src={roblox} alt="Total Items" />
                <div className="Text">
                  <p className="TheItems">ITEMS</p>
                  <p className="Value">{numeral(totalPets).format("0,0aaa")}</p>
                </div>
              </div>
              <button className="Deposit" onClick={() => handleDepositModal()}>
                <img src={plus} alt="Deposit" />
              </button>
            </div>
            <div className="ItemsDisplay">
              {
                <>
                  {selectedPets.map((pet) => {
                    return (
                      <div
                        key={pet._id}
                        className={`Item Active`}
                        id={pet.name}
                        onClick={() => handlePetSelection(pet)}
                      >
                        <img src={pet.item.item_image} alt="" />
                        <div className="Info">
                          <p>{pet.item.display_name}</p>
                          <div className="PriceInfo">
                            <p className="Price">
                              $
                              {numeral((pet.item.item_value / 1000) * 5).format(
                                "0.00"
                              )}
                            </p>
                            <p className="Rate">
                              <img
                                className="RateIcon"
                                src={lightning}
                                alt="lightning icon"
                              />
                              <span>$5/1k</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {pets.map((pet) => {
                    return (
                      <div
                        key={pet._id}
                        className={`Item`}
                        id={pet.item.item_name}
                        onClick={() => handlePetSelection(pet)}
                      >
                        <img src={pet.item.item_image} alt="" />
                        <div className="Info">
                          <p>{pet.item.display_name}</p>
                          <div className="PriceInfo">
                            <p className="Price">
                              $
                              {numeral((pet.item.item_value / 1000) * 5).format(
                                "0.00"
                              )}
                            </p>
                            <p className="Rate">
                              <img
                                className="RateIcon"
                                src={lightning}
                                alt="lightning icon"
                              />
                              <span>$5/1k</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              }
            </div>
          </div>
        </m.div>
        {depositPopup == true && (
          <Deposit closeModal={() => setDepositPopup(false)} />
        )}
      </m.div>
    </>
  );
}

MarketplaceList.propTypes = {
  closeModal: PropTypes.func,
  renderModal: PropTypes.func,
};
