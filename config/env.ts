
export default () => ({
  database: {
    MONGO_PASSWORD: process.env.MONGO_PASSWORD,
    MONGO_CONNECTION: `mongodb+srv://root:${process.env.MONGO_PASSWORD}@cluster0.qpxt5ib.mongodb.net/?retryWrites=true&w=majority`,
  }
});


console.log(process.env);
