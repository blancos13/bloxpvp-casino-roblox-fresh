import "./Cart.css";
import PropTypes from "prop-types";
import {
  emptyCart,
  cartGradient,
  cartCross,
  cart,
} from "../../assets/imageExport";
import { useAnimate, stagger, m } from "framer-motion";
import { useCallback, useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";
import SocketContext from "../../utils/SocketContext";
import { getJWT } from "../../utils/api";
import UserContext from "../../utils/UserContext";
import config from "../../config";

export default function Cart({ CartItems, refreshListings }) {
  const [items, setItems] = useState(CartItems);
  const socket = useContext(SocketContext);
  const userData = useContext(UserContext);

  useEffect(() => {
    setItems(CartItems);
  }, [CartItems]);

  const handlePurchaseItems = useCallback(async () => {
    const loadingToast = toast.loading("Purchasing Items...");

    if (items.length < 1) {
      return toast.error("You must select at least 1 item");
    }

    const listingInfo = JSON.stringify({
      chosenListings: items,
    });

    await fetch(`${config.api}/marketplace/listing/purchase`, {
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
        setItems([]);
        localStorage.setItem("CartItems", null);
        return toast.success("Items Purchased!", {
          id: loadingToast,
        });
      } else if (res.status == 400) {
        const data = await res.text();
        return toast.error(data.toString(), {
          id: loadingToast,
        });
      } else {
        const data = await res.json();
        toast.error(data.error.toString(), {
          id: loadingToast,
        });
        if (data.data.length > 0) {
          setItems([...data.data]);
          localStorage.setItem("CartItems", [...data.data]);
        } else {
          setItems(null);
          localStorage.setItem("CartItems", null);
        }
      }
    });
  }, [items, socket]);

  if (items == null || items.length < 1) {
    return (
      <m.div
        initial={{ y: -110, x: 60, scale: 0 }}
        animate={{ y: 0, x: 0, scale: 1 }}
        exit={{ scale: 0 }}
        className="ShoppingCart Empty"
      >
        <div className="Heading">
          <img src={cartGradient} alt="cart icon" />
          <h3>Cart</h3>
        </div>
        <div className="Content">
          <m.img
            initial={{ x: -200, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7, type: "spring" }}
            src={emptyCart}
            alt="cart icon"
          />
          <div className="Text">
            <h4>Empty Cart</h4>
            <p>There are no items in the cart</p>
          </div>
        </div>
      </m.div>
    );
  } else {
    return (
      <CartFilled
        CartItems={items}
        purchaseItems={() => handlePurchaseItems()}
        updateItems={(newItems) => {
          setItems(newItems);
          refreshListings();
        }}
      />
    );
  }
}

function CartFilled({ CartItems, updateItems, purchaseItems }) {
  const [cartSum, setCartSum] = useState(0);

  useEffect(() => {
    setCartSum(
      CartItems.reduce(
        (accumulator, currentValue) =>
          accumulator +
          (Number(currentValue.item.item.item_value) / 1000) *
            currentValue.rate,
        0
      )
    );
  }, [CartItems]);

  const [scope, animate] = useAnimate();

  useEffect(() => {
    animate(".CartItem", { x: [-50, 0] }, { delay: stagger(0.1) });
  }, [animate]);

  const handleRemoveFromCart = useCallback(
    (cartItem) => {
      const existingCartItems = JSON.parse(localStorage.getItem("CartItems"));

      const newCart = existingCartItems.filter((existingItem) => {
        return existingItem._id != cartItem._id;
      });

      localStorage.setItem("CartItems", JSON.stringify(newCart));
      updateItems(newCart);
    },
    [updateItems]
  );

  return (
    <m.div
      initial={{ y: -90, scale: 0.5, opacity: 0 }}
      animate={{ y: 0, x: 0, scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="ShoppingCart Filled"
    >
      <div className="Heading">
        <img src={cartGradient} alt="cart icon" />
        <h3>Cart</h3>
      </div>
      <div className="Content">
        <div className="ItemsContainer">
          <m.div ref={scope} className="Items">
            {CartItems.map((CartItem) => {
              return (
                <m.div
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className="CartItem"
                  key={CartItem._id}
                >
                  <div className="Info">
                    <div className="ImageContainer">
                      <img
                        src={`${CartItem.item.item.item_image}`}
                        className="foregroundImage"
                        alt="Item"
                      />
                      <img
                        src={`${CartItem.item.item.item_image}`}
                        className="backgroundImage"
                        alt="Item"
                      />
                    </div>
                    <div className="Text">
                      <p className="Name">{CartItem.item.item.display_name}</p>
                      <p className="Price">
                        $
                        {numeral(
                          (Number(CartItem.item.item.item_value) / 1000) *
                            CartItem.rate
                        ).format("0.00")}
                      </p>
                    </div>
                  </div>
                  <img
                    src={cartCross}
                    onClick={() => handleRemoveFromCart(CartItem)}
                    alt="remove icon"
                    className="Remove"
                  />
                </m.div>
              );
            })}
          </m.div>
        </div>
        <div className="Purchase">
          <div className="Amount">
            <p className="Text">Purchase Amount:</p>
            <p className="Amount">${numeral(cartSum).format("0.00")}</p>
          </div>
          <div className="Buy" onClick={() => purchaseItems()}>
            <img src={cart} alt="cart icon" />
            <p>Buy All</p>
          </div>
        </div>
      </div>
    </m.div>
  );
}

Cart.propTypes = {
  CartItems: PropTypes.any,
  refreshListings: PropTypes.func,
};

CartFilled.propTypes = {
  CartItems: PropTypes.any,
  updateItems: PropTypes.func,
  purchaseItems: PropTypes.func,
};
