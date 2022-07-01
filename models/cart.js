'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class cart extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      cart.belongsTo(models.user, {
        as: "buyer",
        foreignKey: {
          name: "idBuyer"
        }
      });
      cart.belongsTo(models.product, {
        as: "product",
        foreignKey: {
          name: "idProduct"
        }
      });
    }
  }
  cart.init({
    idBuyer: DataTypes.INTEGER,
    idProduct: DataTypes.INTEGER,
    qty: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'cart',
  });
  return cart;
};