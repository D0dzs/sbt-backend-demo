import { Router, Request, Response } from "express";
import { getLatestForecast } from "../controllers/forecast.controller";

const forecastRouter = Router();

forecastRouter.get("/latest", getLatestForecast);

export default forecastRouter;
