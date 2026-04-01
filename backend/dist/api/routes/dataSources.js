"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dataSourcesController_1 = require("../controllers/dataSourcesController");
const router = (0, express_1.Router)();
router.get('/status', dataSourcesController_1.getDataSourceStatus);
exports.default = router;
//# sourceMappingURL=dataSources.js.map