"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const capacityController_1 = require("../controllers/capacityController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/by-state', (0, validation_1.validateQuery)(validation_1.filterSchema), capacityController_1.getCapacityByState);
router.get('/by-type', capacityController_1.getCapacityByType);
exports.default = router;
//# sourceMappingURL=capacity.js.map