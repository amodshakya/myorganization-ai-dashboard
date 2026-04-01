"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const environmentController_1 = require("../controllers/environmentController");
const router = (0, express_1.Router)();
router.get('/carbon-avoided', environmentController_1.getCarbonAvoided);
exports.default = router;
//# sourceMappingURL=environment.js.map