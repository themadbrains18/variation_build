module.exports = {
     pairsTable : (sequelize,DataTypes, Model) => {
        
        const paris = sequelize.define('pairs', {
            domain : {
                type: DataTypes.STRING,
                allowNull:false
            },
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            ids : {
                type: DataTypes.TEXT,
                allowNull:false,
            },
            title : {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            paragraph : {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            heading : {
                type: DataTypes.STRING,
                length : 400,
                allowNull: true,

            },
            pairdata : {
                type: DataTypes.TEXT,
            },
            actualdata : {
                type: DataTypes.TEXT,
            }
        }, {
          tableName: 'pairs'
        });
        return paris;
    }
} 
 