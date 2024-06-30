import "./JackpotJoining.css";
import { useState, useCallback, useEffect, useContext } from "react";
import { toast } from "react-hot-toast";
import { getJWT } from "../../utils/api";
import PropTypes from "prop-types";
import SocketContext from "../../utils/SocketContext";
import { m } from "framer-motion";
import config from "../../config";
import { sort } from "fast-sort";

export default function JackpotJoining({ Information, closeModal }) {
  const [isLoading, setIsLoading] = useState(false);
  const [pets, setPets] = useState([]);
  const [selectedPets, setSelectedPets] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [selectedValue, setSelectedValue] = useState(0);
  const socket = useContext(SocketContext);

  useEffect(() => {
    setIsLoading(true);

    fetch(`${config.api}/user/inventory`, {
      headers: {
        Authorization: `Bearer ${getJWT()}`,
      },
    }).then(async (res) => {
      const loadedPets = await res.json();
      const sortedPets = sort(loadedPets.userItems).desc((pet) => {
        return Number(pet.item.item_value);
      });
      setPets(sortedPets);
      setTotalValue(loadedPets.totalValue);
      setIsLoading(false);
    });
  }, []);

  const handleJackpotJoin = useCallback(
    async (e) => {
      e.preventDefault();
      if (selectedValue < 1) {
        return toast.error("Please make sure you select an item");
      }
      const gameInfo = JSON.stringify({
        chosenItems: selectedPets,
      });

      setIsLoading(true);

      await fetch(`${config.api}/jackpot/join`, {
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${getJWT()}`,
        },
        mode: "cors",
        method: "POST",
        body: gameInfo,
      }).then(async (res) => {
        setIsLoading(false);
        const data = await res.text();
        if (res.status != 200) {
          toast.error(data);
        } else {
          closeModal();
          toast.success("Game joined");
        }
      });
    },
    [selectedValue, selectedPets, closeModal]
  );

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

  let joinRequirements = false;

  if (Information.requirements.max == 0) {
    joinRequirements = true;
  } else {
    if (selectedValue < Information.requirements.max) {
      joinRequirements = true;
    }
  }

  return (
    <>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="ModalBackground"
        onClick={() => closeModal()}
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
          className="JackpotModal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="Navbar">
            <div className="Options">
              <input
                type="text"
                className="Search"
                placeholder="Search for an item"
              />
              <div className="SelectWrapper">
                <select name="SortItems">
                  <option value="HighToLow">Highest To Lowest</option>
                  <option value="LowToHigh">Lowest To Highest</option>
                </select>
              </div>
            </div>
            <div className="Creation">
              <form action="" onSubmit={(e) => handleJackpotJoin(e)}>
                <button
                  type="submit"
                  className={`${joinRequirements == true ? "" : "Disabled"}`}
                >
                  Join Game
                </button>
              </form>
            </div>
          </div>
          <div className="SelectionStats">
            <p className="Range">
              MAX:{" "}
              <span>
                {Information.requirements.max == undefined
                  ? "NONE"
                  : numeral(Information.requirements.max).format("0,0")}
              </span>
            </p>
            <p className="TotalValue">
              Total Value: <span>{numeral(totalValue).format("0,0")}</span>
            </p>
            <p className="SelectedValue">
              Total Value Selected:{" "}
              <span>{numeral(selectedValue).format("0,0")}</span>
            </p>
          </div>
          <div className="Selection">
            <div className="Items">
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
                          <p className="Value">
                            {numeral(pet.item.item_value).format("0,0")}
                          </p>
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
                          <p className="Value">
                            {numeral(pet.item.item_value).format("0,0")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </>
              }
            </div>
          </div>
        </m.div>
      </m.div>
    </>
  );
}

JackpotJoining.propTypes = {
  closeModal: PropTypes.func,
  Information: PropTypes.object,
};
