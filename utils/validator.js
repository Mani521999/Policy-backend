import Joi from "joi";
import { sendResponse } from "./library.js";

export const scheduleValidation = async (req, res, next) => {
  try {
    let schema = Joi.object({
  message: Joi.string().min(1).required(),
  day: Joi.string().valid("once",  "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",).required(),
  dateTime: Joi.when("day", {
    is: "once",
    then: Joi.date().required(),
    otherwise: Joi.forbidden(), 
  }),
  time: Joi.string()
    .pattern(/^\d{2}:\d{2}$/)
    .required(),
}).unknown(true)

    const { error, value } = schema.validate(req.body, { abortEarly: false });
    console.log("errorerror:", JSON.stringify(error, null, 2), value);

    if (error) {
      const errors = {};
      for (let i = 0; i < error.details.length; i++) {
        const data = error.details[i];
        errors[data.context.label] = data.message;
      }

      console.log("error", errors);

      return sendResponse(res, {
        statusCode: 400,
        success: false,
        message: "validation error ",
        errors,
      });
    }
    next();
  } catch (e) {
    console.log("scheduleValidation_err", e);
    return sendResponse(res, {
      success: false,
      message: "Error on server",
      errors: {},
      statusCode: 500,
    });
  }
};
