"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const generationController_1 = require("../controllers/generationController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/current', generationController_1.getCurrentGeneration);
router.get('/history', (0, validation_1.validateQuery)(validation_1.dateRangeSchema), generationController_1.getGenerationHistory);
exports.default = router;
//# sourceMappingURL=generation.js.map