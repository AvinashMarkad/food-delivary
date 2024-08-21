import { model, Schema, Document, HookNextFunction } from "mongoose";

const TokenSchema = new Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, "User ID is required"],
      ref: "users",
      validate: {
        validator: function (v: any) {
          return Schema.Types.ObjectId.isValid(v);
        },
        message: (props: any) => `${props.value} is not a valid user ID!`,
      },
    },
  },
  { timestamps: true }
);

// Middleware for handling errors
TokenSchema.post("save", function (error: any, doc: Document, next: HookNextFunction) {
  if (error.name === "ValidationError") {
    next(new Error("There was a validation error when saving the token."));
  } else if (error.name === "MongoError" && error.code === 11000) {
    next(new Error("Duplicate key error: a token with this value already exists."));
  } else {
    next(error);
  }
});

// Pre-save middleware to log actions before saving
TokenSchema.pre("save", function (next: HookNextFunction) {
  console.log("Preparing to save token...");
  next();
});

export default model("tokens", TokenSchema);
