import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.API_PORT;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello, world!' });
});

app.listen(PORT, () => console.log(`>> Server is running on http://127.0.0.1:${PORT}`));
