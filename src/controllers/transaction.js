const {
  user,
  transaction,
  product,
  profile,
  producttransaction,
  cart,
} = require("../../models");
const midtransClient = require("midtrans-client");

exports.addTransaction = async (req, res) => {
  try {
    data = {
      idBuyer: req.user.id,
      idProfile: req.user.id,
      price: req.body.price,
      qty: req.body.qty == null ? 1 : req.body.qty,
      status: "pending",
    };

    let datatransaction = await transaction.create(data);
    //   console.log(idProduct)

    const buyerData = await user.findOne({
      include: {
        model: profile,
        as: "profile",
        attributes: {
          exclude: ["createdAt", "updatedAt", "idUser"],
        },
      },
      where: {
        id: req.user.id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    const transactionProducts = req.body.product.map((product) => {
      return {
        idProduct: product.idProduct,
        idTransaction: datatransaction.id,
        qty: product.qty,
      };
    });
    await producttransaction.bulkCreate(transactionProducts);

    await cart.destroy({
      where: {
        idBuyer: req.user.id,
      },
    });

    let snap = new midtransClient.Snap({
      // Set to true if you want Production Environment (accept real transaction).
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    let parameter = {
      transaction_details: {
        order_id: datatransaction.id,
        // order_id: [123, 056],
        gross_amount: datatransaction.price,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        full_name: buyerData?.name,
        email: buyerData?.email,
        phone: buyerData?.profile?.phone,
      },
    };

    const payment = await snap.createTransaction(parameter);
    // console.log(payment);

    res.send({
      status: "pending",
      message: "Pending transaction payment gateway",
      payment,
      id: datatransaction.id,
      product: {
        // id: data.idProduct,
      },
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
};

const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

const core = new midtransClient.CoreApi();

core.apiConfig.set({
  isProduction: false,
  serverKey: MIDTRANS_SERVER_KEY,
  clientKey: MIDTRANS_CLIENT_KEY,
});

exports.getTransactions = async (req, res) => {
  try {
    const idBuyer = req.user.id;
    let data = await transaction.findAll({
      where: {
        idBuyer,
      },
      attributes: {
        exclude: ["updatedAt", "idBuyer", "idSeller", "idProduct"],
      },
      include: [
        {
          model: product,
          as: "products",
          attributes: {
            exclude: ["createdAt", "updatedAt", "idUser", "id", "desc"],
          },
        },
      ],
    });

    data = JSON.parse(JSON.stringify(data));

    data = data.map((item) => {
      return {
        ...item,
      };
    });

    res.send({
      status: "success",
      data,
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
};
exports.getTransactionStruct = async (req, res) => {
  try {
    // const idBuyer = req.user.id;
    const { id } = req.params;

    let data = await transaction.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["updatedAt", "idBuyer", "idSeller", "idProduct"],
      },
      include: [
        {
          model: product,
          as: "products",
          attributes: {
            exclude: ["createdAt", "updatedAt", "idUser", "id", "desc"],
          },
        },
        {
          model: profile,
          as: "profile",
          attributes: {
            exclude: ["createdAt", "updatedAt", "idUser"],
          },
        },
      ],
    });

    // data = JSON.parse(JSON.stringify(data));

    res.send({
      status: "success",
      struct: { data: data, products: data.products },
      // producttransaction: data.products.producttransaction,
      // struct: producttransaction.qty,
      // qtyProduct: "producttransaction.qty",
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    let data = await transaction.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: [
        {
          model: product,
          as: "products",
          attributes: {
            exclude: ["createdAt", "updatedAt", "producttransaction"],
          },
        },

        {
          model: user,
          as: "buyer",
          attributes: {
            exclude: [
              "createdAt",
              "updatedAt",
              "password",
              "status",
              "id",
              "email",
            ],
          },
        },
        {
          model: profile,
          as: "profile",
          attributes: {
            exclude: ["createdAt", "updatedAt", "idUser"],
          },
        },
      ],
    });
    res.send({
      status: "success...",
      data,
    });
  } catch (error) {
    console.log(error);
    res.send({
      status: "failed",
      message: "Server Error",
    });
  }
};

const updateTransaction = async (status, transactionId) => {
  await transaction.update(
    {
      status,
    },
    {
      where: {
        id: transactionId,
      },
    }
  );
};

// Create function for handle product update stock/qty here ...
const updateProduct = async (orderId) => {
  let data = await transaction.findOne({
    where: {
      id: orderId,
    },
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
    include: {
      model: product,
      as: "products",
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    },
  });

  const dataUpdate = data.products.map((item) => {
    return {
      id: item.id,
      qty: item.qty - item.producttransaction.qty,
    };
  });

  await product.bulkCreate(dataUpdate, { updateOnDuplicate: ["qty"] });
};

exports.notification = async (req, res) => {
  try {
    const statusResponse = await core.transaction.notification(req.body);
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    console.log(statusResponse);

    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        // TODO set transaction status on your database to 'challenge'
        // and response with 200 OK
        updateTransaction("pending", orderId);
        res.status(200);
      } else if (fraudStatus == "accept") {
        // TODO set transaction status on your database to 'success'
        // and response with 200 OK
        updateProduct(orderId);
        updateTransaction("success", orderId);
        res.status(200);
      }
    } else if (transactionStatus == "settlement") {
      // TODO set transaction status on your database to 'success'
      // and response with 200 OK
      updateTransaction("success", orderId);
      res.status(200);
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      // TODO set transaction status on your database to 'failure'
      // and response with 200 OK
      updateTransaction("failed", orderId);
      res.status(200);
    } else if (transactionStatus == "pending") {
      // TODO set transaction status on your database to 'pending' / waiting payment
      // and response with 200 OK
      updateTransaction("pending", orderId);
      res.status(200);
    }
  } catch (error) {
    console.log(error);
    res.status(500);
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    await producttransaction.destroy({
      where: {
        idTransaction: id,
      },
    });

    await transaction.destroy({
      where: {
        id,
      },
    });

    res.send({
      status: "success",
      message: `Delete category id: ${id} finished`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server Error",
    });
  }
};

exports.updateTrans = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await transaction.update(
      {
        status: req.body.status,
      },
      {
        where: {
          id,
        },
      }
    );

    res.send({
      status: "success...",
      data: data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server Error",
    });
  }
};
