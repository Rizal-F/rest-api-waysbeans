"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class profile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      profile.belongsTo(models.user, {
        as: "user",
        foreignKey: {
          name: "idUser",
        },
      });
      profile.hasMany(models.transaction, {
        as: "transactions",
        foreignKey: {
          name: "idProfile",
        },
      });
    }
  }
  profile.init(
    {
      image: DataTypes.STRING,
      address: DataTypes.TEXT,
      postcode: DataTypes.INTEGER,
      phone: DataTypes.INTEGER,
      idUser: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "profile",
    }
  );
  return profile;
};
