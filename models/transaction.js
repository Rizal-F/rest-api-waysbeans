"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      transaction.belongsTo(models.user, {
        as: "buyer",
        foreignKey: {
          name: "idBuyer",
        },
      });
      transaction.belongsTo(models.profile, {
        as: "profile",
        foreignKey: {
          name: "idProfile",
        },
      });
      transaction.belongsToMany(models.product, {
        as: "products",
        through: {
          model: "producttransaction",
          as: "bridge",
        },
        foreignKey: "idTransaction",
      });
    }
  }
  transaction.init(
    {
      idBuyer: DataTypes.INTEGER,
      price: DataTypes.INTEGER,
      qty: DataTypes.INTEGER,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "transaction",
    }
  );
  return transaction;
};
