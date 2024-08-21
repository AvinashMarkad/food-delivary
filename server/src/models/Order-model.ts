import { randomUUID } from "crypto";
import { model, Schema, Document, HookNextFunction } from "mongoose";
import { OrderInterface } from "../interfaces/Order-interface";
import { generateOrderId } from "../util/generateOrderId";

const orderSchema = new Schema<OrderInterface>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "users",
      validate: {
        validator: function (v: any) {
          // Custom validation logic, e.g., check if ObjectId is valid
          return Schema.Types.ObjectId.isValid(v);
        },
        message: (props: any) => `${props.value} is not a valid user ID!`,
      },
    },
    paymentDetails: {
      amount: {
        type: Number,
        required: [true, "Amount is required"],
      },
      mode: {
        type: String,
        required: [true, "Payment mode is required"],
      },
      razorpayOrderId: {
        type: String,
        required: [true, "Razorpay order ID is required"],
      },
      razorpayPaymentId: {
        type: String,
        required: [true, "Razorpay payment ID is required"],
      },
      razorpaySignature: {
        type: String,
        required: [true, "Razorpay signature is required"],
      },
      paymentStatus: {
        type: String,
        required: [true, "Payment status is required"],
      },
      paidAt: {
        type: Date,
        default: () => new Date().toUTCString(),
      },
    },
    addressDetails: {
      cordinates: {
        lat: {
          type: Number,
          required: [true, "Latitude is required"],
        },
        lng: {
          type: Number,
          required: [true, "Longitude is required"],
        },
      },
      placeName: {
        type: String,
        required: [true, "Place name is required"],
        lowercase: true,
      },
      state: {
        type: String,
        required: [true, "State is required"],
        lowercase: true,
      },
      country: {
        type: String,
        required: [true, "Country is required"],
        lowercase: true,
      },
      locality: {
        type: String,
        required: [true, "Locality is required"],
        lowercase: true,
      },
      pinCode: {
        type: Number,
        required: [true, "Pin code is required"],
      },
      district: {
        type: String,
        required: [true, "District is required"],
        lowercase: true,
      },
      landmark: {
        type: String,
        required: [true, "Landmark is required"],
      },
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          required: [true, "Product ID is required"],
          ref: "products",
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],
    orderId: {
      type: String,
      default: () => generateOrderId(),
    },
    orderStatus: {
      type: String,
      default: "placed",
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      required: [true, "Restaurant ID is required"],
      ref: "restaurants",
    },
  },
  { timestamps: true }
);

// Middleware for handling errors
orderSchema.post("save", function (error: any, doc: Document, next: HookNextFunction) {
  if (error.name === "ValidationError") {
    next(new Error("There was a validation error when saving the order."));
  } else if (error.name === "MongoError" && error.code === 11000) {
    next(new Error("Duplicate key error: an order with this ID already exists."));
  } else {
    next(error);
  }
});

// Example of pre-save middleware to handle any custom logic before saving
orderSchema.pre("save", function (next: HookNextFunction) {
  // Perform any checks or logging here before saving
  console.log("Preparing to save order...");
  next();
});

const Order = model<OrderInterface>("orders", orderSchema);

export default Order;
