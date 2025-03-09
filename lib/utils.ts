import "dotenv/config";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const userRole = async (user: any): Promise<any> => {
  return user?.role;
};

const generateUID = async () => uuidv4();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

const generateToken = async (id: string): Promise<string> => {
  const accessToken = jwt.sign({ id }, ACCESS_TOKEN_SECRET, {
    expiresIn: "45min",
  });
  return accessToken;
};

const generateRefresh = async (id: string): Promise<string> => {
  const refreshToken = jwt.sign({ id }, REFRESH_TOKEN_SECRET, {
    expiresIn: "5d",
  });
  return refreshToken;
};

/*
 * Prefetch the forecast data
 */
import memoizee from "memoizee";

const memoizedForecast = memoizee(
  async (URL: string) => {
    const response = await fetch(URL);
    const data = await response.json();
    return data;
  },
  {
    promise: true,
    maxAge: 15 * 60 * 1000,
    preFetch: true,
    normalizer: () => {
      const now = new Date();
      return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
    },
  },
);

export { userRole, generateToken, generateRefresh, generateUID, memoizedForecast };
