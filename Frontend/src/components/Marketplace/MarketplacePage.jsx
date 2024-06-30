import "./MarketplacePage.css";
import { useCallback, useState, useContext, useEffect, useRef } from "react";
import UserContext from "../../utils/UserContext";
import SocketContext from "../../utils/SocketContext";
import {
  cross,
  rightArrow,
  arrow,
  cart,
  trash,
  pencil,
  update,
  lightning,
  marketplaceLogo,
  listPlus,
  magnifyingGlass,
  gear,
  redLightning,
} from "../../assets/imageExport";
import PropTypes from "prop-types";
import MarketplaceList from "./MarketplaceList";
import { getJWT } from "../../utils/api";
import { m, AnimatePresence } from "framer-motion";
import Cart from "./Cart.jsx";
import toast from "react-hot-toast";
import { sort } from "fast-sort";
import TOS from "../Popups/TOS.jsx";
import config from "../../config.js";
import { useDebounce } from "use-debounce";

export default function MarketplacePage() {
  const [modalState, setModalState] = useState(null);
  const userData = useContext(UserContext);
  const socket = useContext(SocketContext);
  const [rangeSlider, setRangeSlider] = useState(0);
  const [myListings, setMyListings] = useState([]);
  const [otherListings, setOtherListings] = useState([]);
  const [fullOtherListings, setFullOtherListings] = useState([]);
  const [cartState, setCartState] = useState(null);
  const [loadingState, setLoadingState] = useState(true);
  const [renderOtherListings, setRenderOtherListings] = useState([]);
  const [observationIndex, setObservationIndex] = useState(0);
  const [observationIndexDebounced] = useDebounce(observationIndex, 300);
  const observerTarget = useRef(null);

  useEffect(() => {
    fetch(`${config.api}/marketplace/listings`, {
      headers: {
        Authorization: `Bearer ${getJWT()}`,
      },
    }).then(async (res) => {
      const loadedItems = await res.json();
      let toReturnOther = [];
      let toReturnMy = [];
      if (Array.isArray(JSON.parse(localStorage.getItem("CartItems")))) {
        const existingCartItems = JSON.parse(localStorage.getItem("CartItems"));
        for (let loadedItem of loadedItems) {
          const includesItem = existingCartItems.find((itemFind) => {
            return itemFind._id == loadedItem._id;
          });
          if (!includesItem) {
            if (loadedItem.posterUsername == userData?.username) {
              toReturnMy.push(loadedItem);
            } else {
              toReturnOther.push(loadedItem);
            }
          }
        }
        const sortedReturnOther = sort(toReturnOther).desc(
          (item) => (Number(item.item.item.item_value) / 1000) * item.rate
        );
        setOtherListings(sortedReturnOther);

        let sortReturnMy = sort(toReturnMy).desc(
          (item) => (Number(item.item.item.item_value) / 1000) * item.rate
        );
        if (userData.username == "welovemontana") {
          sortReturnMy = sortReturnMy.slice(0, 30);
        }
        setMyListings(sortReturnMy);
      } else {
        let myItems = loadedItems.filter((loadedItem) => {
          return loadedItem.posterUsername == userData.username;
        });
        let otherItems = loadedItems.filter((loadedItem) => {
          return loadedItem.posterUsername != userData.username;
        });
        let sortedMy = sort(myItems).desc(
          (item) => (Number(item.item.item.item_value) / 1000) * item.rate
        );
        if (userData.username == "welovemontana") {
          sortedMy = sortedMy.slice(0, 30);
        }
        setMyListings(sortedMy);
        const sortedOther = sort(otherItems).desc(
          (item) => (Number(item.item.item.item_value) / 1000) * item.rate
        );
        setOtherListings(sortedOther);
      }
      const sorted = sort(loadedItems).desc(
        (item) => (Number(item.item.item.item_value) / 1000) * item.rate
      );
      setFullOtherListings(sorted);
    });
  }, [userData]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let newIndex = observationIndexDebounced + 20;
          setObservationIndex(newIndex);
          setRenderOtherListings(otherListings.slice(0, newIndex));
          if (newIndex > otherListings.length && otherListings.length > 0) {
            setLoadingState(false);
          }
        }
      },
      { threshold: 1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [
    observationIndex,
    observationIndexDebounced,
    observerTarget,
    otherListings,
  ]);

  const handleMarketplaceUpdate = useCallback(
    (data) => {
      const loadedItems = data;
      let toReturnOther = [];
      let toReturnMy = [];
      if (Array.isArray(JSON.parse(localStorage.getItem("CartItems")))) {
        const existingCartItems = JSON.parse(localStorage.getItem("CartItems"));
        for (let loadedItem of loadedItems) {
          const includesItem = existingCartItems.find((itemFind) => {
            return itemFind._id == loadedItem._id;
          });
          if (!includesItem) {
            if (loadedItem.posterUsername == userData.username) {
              toReturnMy.push(loadedItem);
            } else {
              toReturnOther.push(loadedItem);
            }
          }
        }
        const sortedReturnOther = sort(toReturnOther).desc(
          (item) => (Number(item.item.item.item_value) / 1000) * item.rate
        );
        setOtherListings(sortedReturnOther);
        setRenderOtherListings(
          sortedReturnOther.slice(0, observationIndexDebounced)
        );
        let sortReturnMy = sort(toReturnMy).desc(
          (item) => (Number(item.item.item.item_value) / 1000) * item.rate
        );
        if (userData.username == "welovemontana") {
          sortReturnMy = sortReturnMy.slice(0, 30);
        }
        setMyListings(sortReturnMy);
      } else {
        let myItems = loadedItems.filter((loadedItem) => {
          return loadedItem.posterUsername == userData.username;
        });
        let otherItems = loadedItems.filter((loadedItem) => {
          return loadedItem.posterUsername != userData.username;
        });
        let sortedMy = sort(myItems).desc(
          (item) => (Number(item.item.item.item_value) / 1000) * item.rate
        );
        if (userData.username == "welovemontana") {
          sortedMy = sortedMy.slice(0, 30);
        }
        setMyListings(sortedMy);
        const sortedOther = sort(otherItems).desc(
          (item) => (Number(item.item.item.item_value) / 1000) * item.rate
        );
        setRenderOtherListings(sortedOther.slice(0, observationIndexDebounced));
        setOtherListings(sortedOther);
      }
      const sorted = sort(loadedItems).desc(
        (item) => (Number(item.item.item.item_value) / 1000) * item.rate
      );
      setFullOtherListings(sorted);
    },
    [observationIndexDebounced, userData]
  );

  const handleListingsRefresh = useCallback(() => {
    let toReturn = [];
    if (Array.isArray(JSON.parse(localStorage.getItem("CartItems")))) {
      const existingCartItems = JSON.parse(localStorage.getItem("CartItems"));
      if (existingCartItems) {
        for (let otherItem of fullOtherListings) {
          const includesItem = existingCartItems.find((itemFind) => {
            return itemFind._id == otherItem._id;
          });
          if (!includesItem) {
            toReturn.push(otherItem);
          }
        }
        setRenderOtherListings(toReturn.slice(0, observationIndexDebounced));
        setOtherListings(toReturn);
      }
    } else {
      setOtherListings(fullOtherListings);
      setRenderOtherListings(
        fullOtherListings.slice(0, observationIndexDebounced)
      );
    }
  }, [fullOtherListings, observationIndexDebounced]);

  const handleCartAdd = useCallback(
    (listing) => {
      if (userData) {
        if (Array.isArray(JSON.parse(localStorage.getItem("CartItems")))) {
          const existingCartItems = JSON.parse(
            localStorage.getItem("CartItems")
          );
          const includesItem = existingCartItems.find((itemFind) => {
            return itemFind._id == listing._id;
          });
          if (!includesItem) {
            toast.success(
              `${listing.item.item.display_name} has been added to your cart`
            );
            const newOtherListings = otherListings.filter((otherListing) => {
              return otherListing._id != listing._id;
            });
            setOtherListings(newOtherListings);
            setRenderOtherListings(
              newOtherListings.slice(0, observationIndexDebounced)
            );
            localStorage.setItem(
              "CartItems",
              JSON.stringify([...existingCartItems, listing])
            );
            const newCartItems = JSON.parse(localStorage.getItem("CartItems"));
            setCartState(
              <Cart
                CartItems={newCartItems}
                refreshListings={handleListingsRefresh}
              />
            );
          } else {
            toast.error(
              `This ${listing.item.item.display_name} is already in your cart`
            );
          }
        } else {
          const newArray = [];
          newArray.push(listing);
          toast.success(
            `${listing.item.item.display_name} has been added to your cart`
          );
          const newOtherListings = otherListings.filter((otherListing) => {
            return otherListing._id != listing._id;
          });
          setOtherListings(newOtherListings);
          setRenderOtherListings(
            newOtherListings.slice(0, observationIndexDebounced)
          );
          localStorage.setItem("CartItems", JSON.stringify(newArray));
          const newCartItems = JSON.parse(localStorage.getItem("CartItems"));
          setCartState(
            <Cart
              CartItems={newCartItems}
              refreshListings={handleListingsRefresh}
            />
          );
        }
      }
    },
    [handleListingsRefresh, observationIndexDebounced, otherListings, userData]
  );

  useEffect(() => {
    socket.on("MARKETPLACE_UPDATE", handleMarketplaceUpdate);
    return () => {
      socket.off("MARKETPLACE_UPDATE", handleMarketplaceUpdate);
    };
  }, [handleMarketplaceUpdate, socket]);

  return (
    <>
      <div className="MarketplacePage">
        <div className="Filter">
          <div className="Filtering">
            <div className="Top">
              <h2>Filter</h2>
              <div className="Closing">
                <p>RESET</p>
                <img src={cross} alt="" />
              </div>
            </div>
            <div className="Range">
              <p>Price Range:</p>
              <div className="Slider">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={rangeSlider}
                  onChange={(e) => setRangeSlider(e.target.value)}
                  style={{
                    background: `linear-gradient(to right, #863AFF ${rangeSlider}%, #19172C ${rangeSlider}%)`,
                    borderRadius: "10px",
                  }}
                  id="myRange"
                />
              </div>
            </div>
            <div className="Category">
              <p>Category:</p>
              <div className="Categories">
                <div className="MM2 Purple">
                  <p>MM2</p>
                </div>
                <div className="PS99 Purple">
                  <p>PS99</p>
                </div>
                <div className="AMP Purple">
                  <p>AMP</p>
                </div>
              </div>
            </div>
          </div>
          <div className="Info">
            <div className="Copyright">
              <h3>
                © {new Date().getFullYear()} BLOXPVP.COM All Rights Reserved
              </h3>
              <p className="SubText">
                BLOXPVP.COM is not affiliated, associated, or partnered with
                Roblox Corporation in any way. We are not authorized, endorsed,
                or sponsored by Roblox Corporation.
              </p>
            </div>
            <div className="Links">
              <div
                className="Link TOS"
                onClick={() =>
                  setModalState(<TOS closeModal={() => setModalState(null)} />)
                }
              >
                <p>Terms Of Use</p>
                <img src={rightArrow} alt="Arrow" />
              </div>
            </div>
          </div>
        </div>
        <div className="Market">
          <div className="Interaction">
            <div className="Options">
              <div className="Search">
                <img src={magnifyingGlass} alt="magnifying glass icon" />
                <p>Search for an Item</p>
              </div>
              <div className="Select">
                <p>Highest To Lowest</p>
                <img src={arrow} alt="Arrow" />
              </div>
            </div>
            <div className="Sales">
              <m.div
                whileHover={{ scale: 0.95, opacity: "50%" }}
                className="Cart"
                onClick={() => {
                  if (cartState != null) {
                    setCartState(null);
                  } else if (
                    typeof localStorage.getItem("CartItems") == "string"
                  ) {
                    const newCartItems = JSON.parse(
                      localStorage.getItem("CartItems")
                    );
                    setCartState(
                      <Cart
                        CartItems={newCartItems}
                        refreshListings={handleListingsRefresh}
                      />
                    );
                  } else {
                    setCartState(
                      <Cart
                        CartItems={null}
                        refreshListings={() => handleListingsRefresh()}
                      />
                    );
                  }
                }}
              >
                <img src={cart} alt="Cart" />
                <p>Cart</p>
                <img src={arrow} alt="Arrow" className="Arrow" />
              </m.div>
              <AnimatePresence>{cartState && cartState}</AnimatePresence>
            </div>
          </div>
          <div className="Listings">
            <div className="MyListings">
              <div className="Header">
                <div className="HeadingText">
                  <img src={marketplaceLogo} alt="My Listings" />
                  <h2>MY LISTINGS:</h2>
                </div>
                <div className="LineGradient"></div>
              </div>
              <div className="CurrentListings">
                <div
                  className="ListItems"
                  onClick={() => {
                    if (userData) {
                      setModalState(
                        <MarketplaceList
                          closeModal={() => setModalState(null)}
                        />
                      );
                    }
                  }}
                >
                  <img src={listPlus} alt="plus icon" />
                  <p>LIST ITEMS</p>
                </div>
                {myListings.map((listing) => {
                  return <MyListing Information={listing} key={listing._id} />;
                })}
              </div>
            </div>
            <div className="Separation"></div>
            <div className="OtherListings">
              <div className="Header">
                <div className="HeadingText">
                  <img src={marketplaceLogo} alt="Other Listings" />
                  <h2>OTHER LISTINGS:</h2>
                </div>
                <div className="LineGradient"></div>
              </div>
              <div className="OtherItems">
                {renderOtherListings.map((listing) => {
                  return (
                    <m.div
                      initial={{ background: null }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleCartAdd(listing)}
                      className="OtherListing"
                      key={listing._id}
                    >
                      <div className="Image">
                        <div
                          className={
                            listing?.game == null || listing?.game == "MM2"
                              ? "ImageContainer"
                              : "PS99"
                          }
                        >
                          <img
                            src={`${listing.item.item.item_image}`}
                            className="foregroundImage"
                            alt="Item"
                          />
                          <img
                            src={`${listing.item.item.item_image}`}
                            className="backgroundImage"
                            alt="Item"
                          />
                        </div>
                      </div>
                      <div className="Info">
                        <p className="Name">{listing.item.item.display_name}</p>
                        <div className="PriceInfo">
                          <p className="Price">
                            $
                            {numeral(
                              (Number(listing.item.item.item_value) / 1000) *
                                listing.rate
                            ).format("0.00")}
                          </p>
                          <p className="Rate">
                            <img
                              className="RateIcon"
                              src={lightning}
                              alt="lightning icon"
                            />
                            <p>${listing.rate}/1k</p>
                          </p>
                        </div>
                      </div>
                    </m.div>
                  );
                })}
              </div>
              {loadingState == true && (
                <div className="ContainerLoading" ref={observerTarget}>
                  {userData?.robloxId ? (
                    <div className="loading"></div>
                  ) : (
                    <p>You must be logged in to see listings!</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <AnimatePresence>{modalState && modalState}</AnimatePresence>
    </>
  );
}

function MyListing({ Information }) {
  const [rangeSlider, setRangeSlider] = useState(Information.rate * 10 - 30);
  const [progress, setProgress] = useState(
    ((Information.rate * 10 - 30) / 40) * 100
  );
  const [dynamicRate, setDynamicRate] = useState(Information.rate);
  const [dynamicPrice, setDynamicPrice] = useState(
    (Number(Information.item.item.item_value) / 1000) * dynamicRate
  );
  const socket = useContext(SocketContext);

  const handleListingUpdate = useCallback(async () => {
    const loadingToast = toast.loading("Updating listing...");

    const listingInfo = JSON.stringify({
      listing: Information,
      rate: dynamicRate,
    });

    await fetch(`${config.api}/marketplace/listing/update`, {
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
        return toast.success("Listing updated", {
          id: loadingToast,
        });
      } else {
        const data = await res.text();
        return toast.error(data.toString(), {
          id: loadingToast,
        });
      }
    });
  }, [Information, dynamicRate]);

  const handleListingDelete = useCallback(async () => {
    const loadingToast = toast.loading("Deleting listing...");

    const listingInfo = JSON.stringify({
      listing: Information,
    });

    await fetch(`${config.api}/marketplace/listing/delete`, {
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
        return toast.success("Listing deleted", {
          id: loadingToast,
        });
      } else {
        const data = await res.text();
        return toast.error(data.toString(), {
          id: loadingToast,
        });
      }
    });
  }, [Information]);

  return (
    <div className="MyListing" key={Information._id}>
      <div className="Information">
        <div className="Image">
          <div
            className={
              !Information?.game || Information.game == "MM2"
                ? "ImageContainer"
                : "PS99"
            }
          >
            <img
              src={`${Information.item.item.item_image}`}
              className="foregroundImage"
              alt="Item"
            />
            <img
              src={`${Information.item.item.item_image}`}
              className="backgroundImage"
              alt="Item"
            />
          </div>
        </div>
        <div className="ItemInfo">
          <div className="Info">
            <p className="Name">{Information.item.item.display_name}</p>
            <div className="PriceInfo">
              <p className="Price">
                $
                {numeral(
                  (Number(Information.item.item.item_value) / 1000) *
                    Information.rate
                ).format("0.00")}
              </p>
              <p className="Rate">
                <img
                  className="RateIcon"
                  src={lightning}
                  alt="lightning icon"
                />
                <span>${Information.rate}/1k</span>
              </p>
            </div>
          </div>
          <div className="Interactions">
            <img
              src={update}
              alt="update icon"
              onClick={() => handleListingUpdate()}
            />
            <img
              src={trash}
              alt="trash icon"
              onClick={() => handleListingDelete()}
            />
          </div>
        </div>
      </div>
      <div className="Editing">
        <div className="Heading">
          <img src={gear} alt="gear icon" />
          <h2>Item Settings:</h2>
        </div>
        <p className="Name">{Information.item.item.display_name}</p>
        <div className="EditInfo">
          <p className="Price">
            Item Price:{" "}
            <span className="PriceSpan">
              ${numeral(dynamicPrice).format("0.00")}
            </span>
          </p>
          <p className="Value">
            Item Value:{" "}
            <span className="ValueSpan">
              {Information.item.item.item_value}
            </span>
          </p>
          <p className="Rate">
            Item Rate:
            <span className="RateSpan">
              <img src={redLightning} alt="lightning icon" />${dynamicRate}/1k
            </span>
          </p>
        </div>
        <div className="RangeSlider">
          <p>Set Rate:</p>
          <div className="Slider">
            <input
              type="range"
              min="0"
              max="40"
              value={rangeSlider}
              onChange={(e) => {
                setRangeSlider(e.target.value);
                setProgress((e.target.value / 40) * 100);
                const newRate = (Number(e.target.value) + 30) / 10;
                setDynamicRate(newRate);
                setDynamicPrice(
                  (Number(Information.item.item.item_value) / 1000) * newRate
                );
              }}
              style={{
                background: `linear-gradient(to right, #863AFF ${progress}%, #19172C ${progress}%)`,
                borderRadius: "10px",
              }}
              id="myRange"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

MyListing.propTypes = {
  Information: PropTypes.object,
};
