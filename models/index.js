const {Sequelize, Model, DataTypes } = require('sequelize');
const pairs = require('./pairsModel');
const sequelize = new Sequelize( 'behno',
'root',
'123456', {
    logging : true, 
    host: 'localhost',
    dialect: 'mysql' /* one of 'mysql' | 'postgres' | 'sqlite' | 'mariadb' | 'mssql' | 'db2' | 'snowflake' | 'oracle' */
});


const db = {}
db.sequelize = sequelize
// zsdhasg
try {
    sequelize.authenticate();
    console.log('Connection has been established successfully.');
    db.Sequelize = Sequelize;
    db.pairs  = pairs.pairsTable(sequelize,DataTypes,Model);
    sequelize.sync({ force: false })   

} catch (error) {
    console.error('Unable to connect to the database:', error);
}

module.exports = {
    db
} 