const express = require("express");
const app = express();
const cors = require("cors");
const cronJob = require("./utils/cron");
require("dotenv").config();

// routers
const homeRouter = require("./routes/home");
const adminAuthRouter = require("./routes/adminAuth");
const adminUsersRouter = require("./routes/adminUsers");
const adminCampaignsRouter = require("./routes/adminCampaigns");
const campaignRouter = require("./routes/campaign");
const CRMFieldsRouter = require("./routes/crmFields");
const adminCrmFieldsRouter = require("./routes/adminCrmFields");
const mappingRouter = require("./routes/mapping");
const crmRouter = require("./routes/crm");
const dispositionRouter = require("./routes/disposition");
const monitoringRouter = require("./routes/monitoring");
const updateSessionRouter = require("./routes/updateSession");
const ivrCampaignRouter = require("./routes/ivrCampaign");
const numberRouter = require("./routes/number");
const speechRouter = require("./routes/speech");
const designRouter = require("./routes/design");
const leadRouter = require("./routes/lead");
const dropdownRouter = require("./routes/dropdown");
const invoiceRouter = require("./routes/invoice");

// cookie parser
const cookieParser = require("cookie-parser");
const roleRouter = require("./routes/roles");
const LoginActivityRouter = require("./routes/LoginActivity");

// parsing json
app.use(express.json());

// cors connection
app.use(
  cors({
    origin: "http://localhost:3002",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3002");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  next();
});

app.use(cookieParser());
cronJob.start();

app.use("/", homeRouter);
app.use("/", adminAuthRouter);
app.use("/", adminUsersRouter);
app.use("/", campaignRouter);
app.use("/", adminCampaignsRouter);
app.use("/", CRMFieldsRouter);
app.use("/", adminCrmFieldsRouter);
app.use("/", roleRouter);
app.use("/", mappingRouter);
app.use("/", crmRouter);
app.use("/", dispositionRouter);
app.use("/", monitoringRouter);
app.use("/", updateSessionRouter);
app.use("/", LoginActivityRouter);
app.use("/", ivrCampaignRouter);
app.use("/", numberRouter);
app.use("/", speechRouter);
app.use("/", designRouter);
app.use("/", leadRouter);
app.use("/", dropdownRouter);
app.use("/", invoiceRouter);

app.listen(process.env.PORT || 3003, () => {
  console.log(`Server listening at port no -> ${process.env.PORT}`);
});
