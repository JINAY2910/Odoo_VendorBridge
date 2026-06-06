import sequelize from './sequelize.js';

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Database Connected via Sequelize successfully.');
    
    // We will sync models in server.js or here
    // Let's run sync here to make sure tables are initialized
    await sequelize.sync({ alter: true });
    console.log('Database tables synchronized successfully.');
  } catch (error) {
    console.error(`Sequelize Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;