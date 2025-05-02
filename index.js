import app from "./app.js";
import { PORT } from "./config/config.js";
import { sequelize } from "./database/database.js";
import "./models/index.js";

async function main() {
  try {
    await sequelize.authenticate(); //to test the connection
    await sequelize.sync({ force: false });
    // await User.sync({ force: true }); // Uncomment to drop and recreate the User table


    app.listen(PORT);
    console.log(`Server on port ${PORT}`);
  } catch (error) {
    console.log(error);
  }
}

main();
