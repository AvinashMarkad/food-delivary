import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import OrderApi from "../../../api/order-api";
import { Map, Product, SelectBox } from "../../../components";
import { OrderInterface } from "../../../interfaces/OrderInterface";
import Button from "../../../styles/Button";
import {
  Actions,
  DelivaredTitle,
  FormControl,
  Grid,
  HeadingContainer,
  Image,
  MainContainer,
  Mapcontainer,
  ProductContainer,
  RestaurantSingleOrderContainer,
  SubTitle,
  Title,
} from "./RestaurantSingleOrder.styled";
import moment from "moment";
import { useFetchLoading, useMessage, useSocket } from "../../../hooks";

const OPTIONS = [
  "canceled",
  "confirmed",
  "preparing",
  "out for delivary",
  "delivared",
];

function RestaurantSingleOrder() {
  const { id: orderId } = useParams();
  const { setMessage } = useMessage();
  const { setIsLoading } = useFetchLoading();
  const socket = useSocket();

  const [current, setCurrent] = useState<string>("");

  const [order, setOrder] = useState<OrderInterface>();

  const changeStatus = async () => {
    if (!orderId) return;

    setIsLoading(true);
    try {
      const { data } = await OrderApi.changeStatus(orderId, {
        status: current,
      });
      if (data.ok) {
        setOrder(data.order);
        socket?.emit("order-status-updated", data.order);
        setMessage("Order status changed successfully!");
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!orderId) return;

    socket?.emit("order-room", orderId);
  }, [orderId, socket]);

  useEffect(() => {
    if (!orderId) return;

    (async () => {
      try {
        const { data } = await OrderApi.singleOrder(orderId);
        if (data.ok) {
          setOrder(data.order);
          setCurrent(data.order.orderStatus);
        }
      } catch (error) {}
    })();
  }, [orderId]);

  return (
    <RestaurantSingleOrderContainer>
      <SubTitle>Order status</SubTitle>

      {order?.orderStatus !== "delivared" ? (
        <Actions>
          <SelectBox
            options={OPTIONS}
            current={current}
            changeCurrent={setCurrent}
            label="Change Status"
          />
          <Button onClick={changeStatus} hover>
            Process
          </Button>
        </Actions>
      ) : (
        <DelivaredTitle>Order delivared!</DelivaredTitle>
      )}
      <MainContainer>
        <SubTitle>User Details</SubTitle>
        <Grid>
          <FormControl>
            <h1>User ID</h1>
            <p>{order?.user._id}</p>
          </FormControl>
          <FormControl>
            <h1>User Name</h1>
            <p>{order?.user.name}</p>
          </FormControl>
          <FormControl>
            <h1>User email</h1>
            <p>{order?.user.email}</p>
          </FormControl>
          <FormControl>
            <h1>User Contact</h1>
            <p>{order?.user.number}</p>
          </FormControl>
        </Grid>
        <SubTitle>Order Details</SubTitle>
        <Grid>
          <FormControl>
            <h1>Order ID</h1>
            <p>{order?.orderId}</p>
          </FormControl>
          <FormControl>
            <h1>Ordered Date</h1>
            <p>{order && moment(order.createdAt).format("DD MMMM YYYY")}</p>
          </FormControl>
          <FormControl>
            <h1>Payment status</h1>
            <p>{order?.paymentDetails.paymentStatus}</p>
          </FormControl>
          <FormControl>
            <h1>Total payment</h1>
            <p>Rs {order?.paymentDetails.amount}</p>
          </FormControl>
          <FormControl>
            <h1>Delivary address</h1>
            <p>{order?.addressDetails.placeName}</p>
          </FormControl>
        </Grid>
        <SubTitle>Delivary location</SubTitle>
        {order && (
          <Mapcontainer>
            <Map
              currentCordinates={[
                order.addressDetails.cordinates.lat,
                order.addressDetails.cordinates.lng,
              ]}
            />
          </Mapcontainer>
        )}
        <SubTitle>Products</SubTitle>
        <ProductContainer>
          {order?.products.map((product) => (
            <Product
              quantity={product.quantity}
              hideAdd
              product={product.product}
            />
          ))}
        </ProductContainer>
      </MainContainer>
    </RestaurantSingleOrderContainer>
  );
}

export default RestaurantSingleOrder;
