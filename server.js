const express = require("./docs/firebase/functions/node_modules/express");
const app = express();
app.use(express.static("docs"));
app.listen(3000);