"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exportController_1 = require("../controllers/exportController");
const router = (0, express_1.Router)();
router.get('/report', exportController_1.exportCSV);
router.get('/report/pdf', exportController_1.exportPDF);
exports.default = router;
//# sourceMappingURL=export.js.map