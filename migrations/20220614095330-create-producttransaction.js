'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('producttransactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idProduct: {
        type: Sequelize.INTEGER,
        references: {
          model: "products",
          key: "id",
        },
      },
      idTransaction: {
        type: Sequelize.INTEGER,
        references: {
          model: "transactions",
          key: "id",
        },
      },
      qty: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('producttransactions');
  }
};