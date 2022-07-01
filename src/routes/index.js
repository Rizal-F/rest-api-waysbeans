const express = require("express");

const router = express.Router();

const { register, login, checkAuth } = require("../controllers/auth.js");

const {
  addProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product");

const { getProfile, updateProfile } = require("../controllers/profile");

const {
  addUser,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/user");

const {
  addTransaction,
  getTransactions,
  deleteTransaction,
  updateTrans,
  notification,
  getAllTransactions,
  getTransactionStruct,
} = require("../controllers/transaction");
// const { getProfile, updateProfile } = require("../controllers/profile");

const {
  getCart,
  addCart,
  deleteCart,
  updateCart,
  getCarts,
} = require("../controllers/cart");

const { auth } = require("../middlewares/auth");
const { uploadFile } = require("../middlewares/uploadFile");

router.post("/register", register);
router.post("/login", login);
router.get("/check-auth", auth, checkAuth);
// router.get("/users", getUsers);
// router.delete("/user/:id", deleteUser);

router.post("/user", addUser);
router.get("/users", getUsers);
router.get("/user/:id", getUser);
router.patch("/user/:id", auth, updateUser);
router.delete("/user/:id", deleteUser);

router.post("/product", auth, uploadFile("image"), addProduct);
router.get("/products", getProducts);
router.get("/product/:id", getProduct);
router.patch("/product/:id", auth, uploadFile("image"), updateProduct);
router.delete("/product/:id", auth, deleteProduct);

//end point profile
router.get("/profile", auth, getProfile);
router.patch("/profile", auth, uploadFile("image"), updateProfile);

router.post("/cart", auth, addCart);
router.get("/cart", auth, getCarts);
router.get("/cart/:id", auth, getCart);
router.patch("/cart/:id", auth, updateCart);
router.delete("/cart/:id", auth, deleteCart);

router.post("/transaction", auth, addTransaction);
router.get("/transactions", auth, getTransactions);
router.get("/transactionsall", auth, getAllTransactions);
router.get("/transactionstruct/:id", auth, getTransactionStruct);
router.patch("/transaction/:id", auth, updateTrans);
router.delete("/transaction/:id", auth, deleteTransaction);
router.post("/notification", notification);

module.exports = router;
