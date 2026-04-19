import { createApp } from './app.js';

const PORT = process.env.PORT || 3027;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Leumas Folder Timeline running at http://localhost:${PORT}`);
});
